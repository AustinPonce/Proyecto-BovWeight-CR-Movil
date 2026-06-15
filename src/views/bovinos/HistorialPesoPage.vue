<template>
  <ion-page>

    <AppHeader title="Historial de Peso" />

    <ion-content>
      <div class="container">

        <!-- Carga inicial -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando datos...</p>
        </div>

        <template v-else>

          <!-- Tarjeta del animal -->
          <BaseCard>
            <h2>{{ animal?.nombre || 'Sin nombre' }} <span class="arete">#{{ bovinoId }}</span></h2>
            <p class="subtitulo">{{ animal?.raza?.nombre }} · {{ animal?.sexo?.nombre }} · {{ animal?.finca?.nombre }}</p>

            <p class="label-peso">Último peso registrado</p>
            <h1 class="peso-actual">
              {{ ultimoPeso ? `${ultimoPeso.toFixed(1)} kg` : '-- kg' }}
            </h1>

            <ion-button color="success" expand="block" @click="abrirFormularioPeso">
              <ion-icon slot="start" :icon="addCircleOutline" />
              Registrar Nuevo Peso
            </ion-button>
          </BaseCard>

          <!-- Modal inline para nuevo pesaje -->
          <BaseCard v-if="mostrarFormPeso" class="mt form-peso">
            <h3>Medidas del Animal</h3>
            <p class="hint">La app calcula el peso con la fórmula: (torax² × largo) / 10840</p>

            <BaseInput
              v-model="formPeso.largo_cuerpo"
              label="Largo del cuerpo (cm)"
              type="number"
              placeholder="Ej: 165"
            />
            <BaseInput
              v-model="formPeso.altura"
              label="Altura (cm)"
              type="number"
              placeholder="Ej: 145"
            />
            <BaseInput
              v-model="formPeso.perimetro_toracico"
              label="Perímetro torácico (cm)"
              type="number"
              placeholder="Ej: 210"
            />

            <div v-if="errorPeso" class="error-msg">{{ errorPeso }}</div>

            <div class="btn-row">
              <ion-button fill="outline" color="medium" @click="mostrarFormPeso = false">
                Cancelar
              </ion-button>
              <ion-button color="success" @click="guardarPeso" :disabled="guardandoPeso">
                {{ guardandoPeso ? 'Guardando...' : 'Guardar' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- Historial -->
          <h3 class="mt">Historial de Pesajes</h3>

          <BaseCard v-if="historial.length === 0" class="empty-hist">
            <p>No hay registros de peso aún.</p>
          </BaseCard>

          <ion-list v-else>
            <ion-item v-for="(registro, i) in historial" :key="registro.id">
              <ion-label>
                <h2>{{ formatFecha(registro.fecha) }}</h2>
                <p>{{ registro.peso.toFixed(1) }} kg
                  <span v-if="registro.imagen_url">· 📷 Con foto</span>
                </p>
              </ion-label>
              <ion-badge slot="end" :color="colorDiff(registro.peso, i)">
                {{ textosDiff(registro.peso, i) }}
              </ion-badge>
            </ion-item>
          </ion-list>

        </template>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonList, IonItem,
  IonLabel, IonButton, IonBadge, IonSpinner, IonIcon
} from '@ionic/vue';
import { addCircleOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService, type PesajeAPI } from '@/services/pesajeService';

const route = useRoute();
const bovinoId = computed(() => route.params.id as string);

const animal = ref<AnimalAPI | null>(null);
const historial = ref<PesajeAPI[]>([]);
const cargando = ref(false);
const ultimoPeso = computed(() =>
  historial.value.length > 0 ? historial.value[0].peso : null
);

// Formulario inline
const mostrarFormPeso = ref(false);
const guardandoPeso = ref(false);
const errorPeso = ref('');
const formPeso = ref({ largo_cuerpo: '', altura: '', perimetro_toracico: '' });

const abrirFormularioPeso = () => {
  mostrarFormPeso.value = true;
  errorPeso.value = '';
  formPeso.value = { largo_cuerpo: '', altura: '', perimetro_toracico: '' };
};

const guardarPeso = async () => {
  errorPeso.value = '';
  const largo = parseFloat(formPeso.value.largo_cuerpo);
  const altura = parseFloat(formPeso.value.altura);
  const perimetro = parseFloat(formPeso.value.perimetro_toracico);

  if (!largo || !altura || !perimetro) {
    errorPeso.value = 'Completa todos los campos';
    return;
  }

  guardandoPeso.value = true;
  try {
    const res = await pesajeService.crearPesajeManual({
      arete: bovinoId.value,
      largo_cuerpo: largo,
      altura,
      perimetro_toracico: perimetro,
    });
    historial.value.unshift(res.data);
    mostrarFormPeso.value = false;
  } catch (e: any) {
    errorPeso.value = e.response?.data?.message || 'Error al guardar peso';
  } finally {
    guardandoPeso.value = false;
  }
};

const formatFecha = (f: string) => new Date(f).toLocaleDateString('es-CR');

const textosDiff = (peso: number, i: number) => {
  if (i === historial.value.length - 1) return 'Inicial';
  const prev = historial.value[i + 1]?.peso;
  if (prev === undefined) return '';
  const d = peso - prev;
  return d >= 0 ? `+${d.toFixed(1)} kg` : `${d.toFixed(1)} kg`;
};

const colorDiff = (peso: number, i: number) => {
  if (i === historial.value.length - 1) return 'medium';
  const prev = historial.value[i + 1]?.peso;
  if (prev === undefined) return 'primary';
  return peso - prev >= 0 ? 'success' : 'danger';
};

onMounted(async () => {
  cargando.value = true;
  try {
    const [animalRes, pesajesRes] = await Promise.all([
      bovinoService.getAnimal(bovinoId.value),
      pesajeService.getPesajes({ animal: bovinoId.value }),
    ]);
    animal.value = animalRes.data;
    historial.value = pesajesRes.data;
  } catch { /* mostrar vacío */ }
  finally { cargando.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; }
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #6b7280;
}
.arete { color: #6b7280; font-size: 16px; font-weight: normal; }
.subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
.label-peso { color: #6b7280; margin: 0; font-size: 13px; }
.peso-actual {
  color: #006d37;
  font-size: 42px;
  font-weight: bold;
  margin: 4px 0 16px;
}
.mt { margin-top: 16px; }
.hint { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
.btn-row { display: flex; gap: 8px; margin-top: 8px; }
.btn-row ion-button { flex: 1; }
.error-msg {
  color: #991b1b;
  background: #fee2e2;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin: 8px 0;
}
.empty-hist { color: #6b7280; text-align: center; padding: 20px; }
.form-peso { border: 2px dashed #d1fae5; }
</style>
