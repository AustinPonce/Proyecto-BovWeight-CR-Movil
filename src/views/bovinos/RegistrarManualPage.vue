<template>
  <ion-page>

    <AppHeader title="Registrar Bovino" :show-back="true" default-href="/bovinos" />

    <ion-content>
      <div class="container">

        <BaseCard>
          <h3 class="section-title">Datos del Animal</h3>

          <BaseInput
            v-model="formulario.arete"
            label="Número de Arete *"
            placeholder="Ej: CR-12345"
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

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- Éxito -->
        <BaseCard v-if="registrado" class="resultado-card mt">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="ok-icon" />
            <h3>Bovino registrado</h3>
          </div>
          <p>El animal con arete <strong>{{ areteRegistrado }}</strong> fue registrado correctamente.</p>
          <p class="hint">Para registrar un pesaje, ve a <strong>Registrar Pesaje</strong>.</p>
          <ion-button expand="block" color="success" class="mt" @click="router.push('/bovinos')">
            Ver mis bovinos
          </ion-button>
          <ion-button expand="block" fill="outline" color="success" @click="reiniciar">
            Registrar otro
          </ion-button>
        </BaseCard>

        <!-- Botón guardar -->
        <ion-button
          v-if="!registrado"
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
import { ref, reactive, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, useIonRouter } from '@ionic/vue';
import { checkmarkCircleOutline, saveOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { RAZAS, SEXOS, ESTADOS } from '@/services/catalogos';
import { bovinoService } from '@/services/bovinoService';
import { fincaService, type FincaAPI } from '@/services/fincaService';

const router = useIonRouter();

const fincas = ref<FincaAPI[]>([]);
const cargandoFincas = ref(false);
const loading = ref(false);
const error = ref('');
const registrado = ref(false);
const areteRegistrado = ref('');

const formulario = reactive({
  arete: '',
  nombre: '',
  id_raza: 0,
  id_sexo: 0,
  id_estado: 1,
  id_finca: 0,
});

const validar = (): string | null => {
  if (!formulario.arete.trim()) return 'El número de arete es obligatorio';
  if (!formulario.id_raza) return 'Selecciona una raza';
  if (!formulario.id_sexo) return 'Selecciona el sexo';
  if (!formulario.id_estado) return 'Selecciona el estado';
  if (!formulario.id_finca) return 'Selecciona una finca';
  return null;
};

const guardar = async () => {
  error.value = '';
  const err = validar();
  if (err) { error.value = err; return; }

  loading.value = true;
  try {
    await bovinoService.crearAnimal({
      arete: formulario.arete.trim(),
      nombre: formulario.nombre.trim() || undefined,
      id_raza: formulario.id_raza,
      id_sexo: formulario.id_sexo,
      id_estado: formulario.id_estado,
      id_finca: formulario.id_finca,
    });
    areteRegistrado.value = formulario.arete.trim();
    registrado.value = true;
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

const reiniciar = () => {
  formulario.arete = '';
  formulario.nombre = '';
  formulario.id_raza = 0;
  formulario.id_sexo = 0;
  formulario.id_estado = 1;
  formulario.id_finca = 0;
  registrado.value = false;
  areteRegistrado.value = '';
  error.value = '';
};

onMounted(async () => {
  cargandoFincas.value = true;
  try {
    const res = await fincaService.getFincas();
    fincas.value = res.data;
    if (fincas.value.length === 1) formulario.id_finca = fincas.value[0].id;
  } catch { /* sin fincas */ }
  finally { cargandoFincas.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 32px; }
.mt { margin-top: 16px; }

.section-title { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 12px; }

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.native-select {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 15px; color: #111827; background: #fff;
}
.native-select:focus { outline: none; border-color: #006d37; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 12px; color: #991b1b; font-size: 13px;
}

.resultado-card { border: 2px solid #16a34a; text-align: center; }
.resultado-header {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-bottom: 8px;
}
.ok-icon { font-size: 24px; color: #16a34a; }
.hint { font-size: 12px; color: #6b7280; margin-top: 4px; }
</style>
