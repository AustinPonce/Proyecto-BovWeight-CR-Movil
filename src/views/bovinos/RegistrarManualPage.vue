<template>
  <ion-page>

    <AppHeader title="Registrar Bovino" />

    <ion-content>
      <div class="container">

        <!-- ======= SECCIÓN: DATOS DEL ANIMAL ======= -->
        <BaseCard>
          <h3 class="section-title">Datos del Animal</h3>

          <BaseInput
            v-model="formulario.arete"
            label="Número de Arete *"
            placeholder="Ej: CR-12345"
            :disabled="soloMedidas"
          />

          <BaseInput
            v-model="formulario.nombre"
            label="Nombre (opcional)"
            placeholder="Ej: Bella"
          />

          <div class="field-group">
            <label class="field-label">Raza *</label>
            <select v-model="formulario.id_raza" class="native-select">
              <option :value="0" disabled>Seleccione una raza</option>
              <option v-for="r in RAZAS" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Sexo *</label>
            <select v-model="formulario.id_sexo" class="native-select">
              <option :value="0" disabled>Seleccione sexo</option>
              <option v-for="s in SEXOS" :key="s.id" :value="s.id">{{ s.nombre }}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Estado *</label>
            <select v-model="formulario.id_estado" class="native-select">
              <option :value="0" disabled>Seleccione estado</option>
              <option v-for="e in ESTADOS" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Finca *</label>
            <select v-model="formulario.id_finca" class="native-select" :disabled="cargandoFincas">
              <option :value="0" disabled>
                {{ cargandoFincas ? 'Cargando fincas...' : 'Seleccione finca' }}
              </option>
              <option v-for="f in fincas" :key="f.id" :value="f.id">{{ f.nombre }}</option>
            </select>
          </div>
        </BaseCard>

        <!-- ======= SECCIÓN: MEDIDAS ======= -->
        <BaseCard class="mt">
          <h3 class="section-title">Medidas para Estimación de Peso</h3>
          <p class="hint">
            El sistema calcula el peso con la fórmula:
            <strong>(perímetro² × largo) / 10840</strong>
          </p>

          <BaseInput
            v-model="formulario.largo_cuerpo"
            label="Largo del cuerpo (cm) *"
            type="number"
            placeholder="Ej: 165"
          />

          <BaseInput
            v-model="formulario.altura"
            label="Altura (cm) *"
            type="number"
            placeholder="Ej: 145"
          />

          <BaseInput
            v-model="formulario.perimetro_toracico"
            label="Perímetro torácico (cm) *"
            type="number"
            placeholder="Ej: 210"
          />
        </BaseCard>

        <!-- Aviso -->
        <div class="aviso">
          <ion-icon :icon="informationCircleOutline" />
          <span>El peso calculado es una <strong>estimación</strong>. Para precisión comercial use báscula.</span>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- Resultado de peso estimado -->
        <BaseCard v-if="pesoEstimado !== null" class="resultado-card mt">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="ok-icon" />
            <h3>Registro exitoso</h3>
          </div>
          <p>Bovino <strong>{{ formulario.arete }}</strong> registrado.</p>
          <h2 class="peso-big">{{ pesoEstimado.toFixed(1) }} kg <span class="estimado">estimado</span></h2>
          <ion-button expand="block" fill="outline" color="success" class="mt" @click="irABovinos">
            Ver mis bovinos
          </ion-button>
          <ion-button expand="block" color="success" @click="reiniciar">
            Registrar otro
          </ion-button>
        </BaseCard>

        <!-- Botón guardar -->
        <ion-button
          v-if="pesoEstimado === null"
          expand="block"
          color="success"
          class="mt"
          @click="guardar"
          :disabled="loading"
        >
          <ion-icon slot="start" :icon="saveOutline" />
          {{ loading ? 'Guardando...' : 'Guardar Bovino' }}
        </ion-button>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import {
  informationCircleOutline, checkmarkCircleOutline, saveOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { RAZAS, SEXOS, ESTADOS } from '@/services/catalogos';
import { bovinoService } from '@/services/bovinoService';
import { fincaService, type FincaAPI } from '@/services/fincaService';
import { pesajeService } from '@/services/pesajeService';

const router = useRouter();
const route = useRoute();

// Si viene con ?arete=XXX solo añade pesaje sin crear animal
const soloMedidas = computed(() => !!route.query.arete);

const fincas = ref<FincaAPI[]>([]);
const cargandoFincas = ref(false);
const loading = ref(false);
const error = ref('');
const pesoEstimado = ref<number | null>(null);

const formulario = reactive({
  arete: (route.query.arete as string) || '',
  nombre: '',
  id_raza: 0,
  id_sexo: 0,
  id_estado: 1, // Activo por defecto
  id_finca: 0,
  largo_cuerpo: '',
  altura: '',
  perimetro_toracico: '',
});

const validar = (): string | null => {
  if (!formulario.arete.trim()) return 'El número de arete es obligatorio';
  if (!soloMedidas.value) {
    if (!formulario.id_raza) return 'Selecciona una raza';
    if (!formulario.id_sexo) return 'Selecciona el sexo';
    if (!formulario.id_estado) return 'Selecciona el estado';
    if (!formulario.id_finca) return 'Selecciona una finca';
  }
  if (!formulario.largo_cuerpo) return 'Ingresa el largo del cuerpo';
  if (!formulario.altura) return 'Ingresa la altura';
  if (!formulario.perimetro_toracico) return 'Ingresa el perímetro torácico';
  return null;
};

const guardar = async () => {
  error.value = '';
  const err = validar();
  if (err) { error.value = err; return; }

  loading.value = true;
  try {
    // Paso 1: crear animal (solo si no estamos en modo solo-medidas)
    if (!soloMedidas.value) {
      try {
        await bovinoService.crearAnimal({
          arete: formulario.arete.trim(),
          nombre: formulario.nombre.trim() || undefined,
          id_raza: formulario.id_raza,
          id_sexo: formulario.id_sexo,
          id_estado: formulario.id_estado,
          id_finca: formulario.id_finca,
        });
      } catch (e: any) {
        // 422 con "arete" en errors → animal ya existe, continuamos con pesaje
        if (e.response?.status === 422 && e.response?.data?.errors?.arete) {
          // Animal ya existe, solo agregamos pesaje
        } else {
          throw e;
        }
      }
    }

    // Paso 2: crear pesaje manual
    const pesajeRes = await pesajeService.crearPesajeManual({
      arete: formulario.arete.trim(),
      largo_cuerpo: parseFloat(formulario.largo_cuerpo),
      altura: parseFloat(formulario.altura),
      perimetro_toracico: parseFloat(formulario.perimetro_toracico),
    });

    pesoEstimado.value = pesajeRes.data.peso;
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    if (errors) {
      error.value = Object.values(errors).flat().join(' ');
    } else {
      error.value = e.response?.data?.message || 'Error al guardar. Verifica los datos.';
    }
  } finally {
    loading.value = false;
  }
};

const irABovinos = () => router.push('/bovinos');

const reiniciar = () => {
  formulario.arete = '';
  formulario.nombre = '';
  formulario.id_raza = 0;
  formulario.id_sexo = 0;
  formulario.id_estado = 1;
  formulario.id_finca = 0;
  formulario.largo_cuerpo = '';
  formulario.altura = '';
  formulario.perimetro_toracico = '';
  pesoEstimado.value = null;
  error.value = '';
};

onMounted(async () => {
  cargandoFincas.value = true;
  try {
    const res = await fincaService.getFincas();
    fincas.value = res.data;
    if (fincas.value.length === 1) {
      formulario.id_finca = fincas.value[0].id;
    }
  } catch { /* sin fincas */ }
  finally { cargandoFincas.value = false; }
});
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 32px;
}
.mt { margin-top: 16px; }

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}
.hint {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}

.field-group { margin: 10px 0; }
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}
.native-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
  background: #fff;
}
.native-select:focus {
  outline: none;
  border-color: #006d37;
}

.aviso {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #92400e;
}
.aviso ion-icon { font-size: 18px; flex-shrink: 0; }

.error-msg {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  color: #991b1b;
  font-size: 13px;
}

.resultado-card { border: 2px solid #16a34a; text-align: center; }
.resultado-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ok-icon { font-size: 24px; color: #16a34a; }
.peso-big {
  font-size: 42px;
  font-weight: bold;
  color: #006d37;
  margin: 8px 0;
}
.estimado {
  font-size: 14px;
  font-weight: normal;
  color: #6b7280;
}
</style>
