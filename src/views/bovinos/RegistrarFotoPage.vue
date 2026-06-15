<template>
  <ion-page>

    <AppHeader title="Registrar por Foto" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- PASO 1: Datos del Animal -->
        <BaseCard>
          <h3 class="step-title">
            <ion-icon :icon="pawOutline" class="step-icon" />
            Datos del Animal
          </h3>

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

        <!-- PASO 2: Fotografía -->
        <BaseCard class="mt">
          <h3 class="step-title">
            <ion-icon :icon="cameraOutline" class="step-icon" />
            Fotografía del Animal
          </h3>

          <p class="instruccion">
            Toma la foto de <strong>perfil lateral</strong> con el cuerpo completo visible.
            El sistema estimará el peso mediante inteligencia artificial.
          </p>

          <!-- Vista previa -->
          <div v-if="fotoDataUrl" class="preview-container">
            <img :src="fotoDataUrl" class="preview-img" alt="Foto del bovino" />
            <ion-button fill="clear" color="danger" size="small" @click="descartarFoto">
              <ion-icon slot="start" :icon="trashOutline" />
              Descartar
            </ion-button>
          </div>

          <!-- Botones cámara -->
          <div v-else class="camera-buttons">
            <ion-button expand="block" color="success" @click="tomarFoto('camera')">
              <ion-icon slot="start" :icon="cameraOutline" />
              Tomar Foto con Cámara
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              color="success"
              @click="tomarFoto('gallery')"
              class="mt-btn"
            >
              <ion-icon slot="start" :icon="imagesOutline" />
              Elegir de Galería
            </ion-button>
          </div>
        </BaseCard>

        <!-- Aviso -->
        <div class="aviso">
          <ion-icon :icon="informationCircleOutline" />
          <span>El peso estimado no reemplaza una báscula oficial para transacciones comerciales.</span>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- Resultado -->
        <BaseCard v-if="resultado" class="resultado-card mt">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="resultado-icon" />
            <h3>Registro exitoso</h3>
          </div>
          <p>Bovino <strong>{{ resultado.arete }}</strong> registrado.</p>
          <h1 class="peso-estimado">
            {{ resultado.peso.toFixed(1) }} kg
            <span class="estimado-label">estimado</span>
          </h1>
          <ion-button expand="block" fill="outline" color="success" class="mt" @click="irABovinos">
            Ver mis bovinos
          </ion-button>
          <ion-button expand="block" color="success" @click="reiniciar">
            Registrar otro
          </ion-button>
        </BaseCard>

        <!-- Botón principal -->
        <ion-button
          v-if="!resultado"
          expand="block"
          color="success"
          class="mt"
          @click="guardar"
          :disabled="loading"
        >
          <ion-icon slot="start" :icon="cloudUploadOutline" />
          {{ loading ? 'Registrando...' : 'Registrar Bovino' }}
        </ion-button>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, useIonRouter } from '@ionic/vue';
import {
  cameraOutline, imagesOutline, pawOutline, trashOutline,
  informationCircleOutline, cloudUploadOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { Camera } from '@capacitor/camera';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { RAZAS, SEXOS, ESTADOS } from '@/services/catalogos';
import { bovinoService } from '@/services/bovinoService';
import { fincaService, type FincaAPI } from '@/services/fincaService';
import { pesajeService } from '@/services/pesajeService';

const router = useIonRouter();

const fincas = ref<FincaAPI[]>([]);
const cargandoFincas = ref(false);
const loading = ref(false);
const error = ref('');
const fotoDataUrl = ref<string | null>(null);
const fotoBlob = ref<Blob | null>(null);
const resultado = ref<{ peso: number; arete: string } | null>(null);

const formulario = reactive({
  arete: '',
  nombre: '',
  id_raza: 0,
  id_sexo: 0,
  id_estado: 1,
  id_finca: 0,
});

const tomarFoto = async (fuente: 'camera' | 'gallery') => {
  error.value = '';
  try {
    let webPath: string | undefined;

    if (fuente === 'camera') {
      const result = await Camera.takePhoto({ quality: 85 });
      webPath = result.webPath;
      if (!webPath && result.thumbnail) {
        webPath = `data:image/jpeg;base64,${result.thumbnail}`;
      }
    } else {
      const result = await Camera.chooseFromGallery({});
      const first = result.results[0];
      if (!first) return;
      webPath = first.webPath;
      if (!webPath && first.thumbnail) {
        webPath = `data:image/jpeg;base64,${first.thumbnail}`;
      }
    }

    if (!webPath) { error.value = 'No se pudo obtener la imagen.'; return; }
    fotoDataUrl.value = webPath;
    const fetchRes = await fetch(webPath);
    fotoBlob.value = await fetchRes.blob();
  } catch (e: any) {
    if (e?.message?.includes('cancelled') || e?.message?.includes('User cancelled')) return;
    error.value = 'No se pudo acceder a la cámara. Verifica los permisos.';
  }
};

const descartarFoto = () => {
  fotoDataUrl.value = null;
  fotoBlob.value = null;
};

const validar = (): string | null => {
  if (!formulario.arete.trim()) return 'El número de arete es obligatorio';
  if (!formulario.id_raza) return 'Selecciona una raza';
  if (!formulario.id_sexo) return 'Selecciona el sexo';
  if (!formulario.id_estado) return 'Selecciona el estado';
  if (!formulario.id_finca) return 'Selecciona una finca';
  if (!fotoBlob.value) return 'Toma o selecciona una foto del animal';
  return null;
};

const guardar = async () => {
  error.value = '';
  const err = validar();
  if (err) { error.value = err; return; }

  loading.value = true;
  try {
    // Paso 1: crear el animal
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
      // Si el arete ya existe, continuamos y solo añadimos el pesaje
      if (e.response?.status === 422 && e.response?.data?.errors?.arete) {
        // animal ya existe, OK
      } else {
        throw e;
      }
    }

    // Paso 2: estimar peso con foto
    const pesajeRes = await pesajeService.crearPesajeFoto(
      formulario.arete.trim(),
      fotoBlob.value!,
      'bovino.jpg'
    );
    resultado.value = { peso: pesajeRes.data.peso, arete: pesajeRes.data.arete };
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    error.value = errors
      ? Object.values(errors).flat().join(' ')
      : e.response?.data?.message || 'Error al registrar. Verifica los datos e intenta de nuevo.';
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
  fotoDataUrl.value = null;
  fotoBlob.value = null;
  resultado.value = null;
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
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 16px; }
.mt-btn { margin-top: 8px; }

.step-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px;
}
.step-icon { color: #006d37; font-size: 20px; }

.field-group { margin: 10px 0; }
.field-label {
  display: block; font-size: 13px; font-weight: 600;
  color: #374151; margin-bottom: 5px;
}
.native-select {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 15px; color: #111827; background: #fff;
}
.native-select:focus { outline: none; border-color: #006d37; }

.instruccion { color: #6b7280; font-size: 13px; margin-bottom: 16px; line-height: 1.5; }

.preview-container { text-align: center; }
.preview-img {
  width: 100%; max-height: 280px;
  object-fit: cover; border-radius: 12px; margin-bottom: 8px;
}
.camera-buttons { display: flex; flex-direction: column; }

.aviso {
  display: flex; align-items: flex-start; gap: 8px;
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 10px; padding: 12px; margin-top: 16px;
  font-size: 13px; color: #92400e;
}
.aviso ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

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
.resultado-icon { font-size: 24px; color: #16a34a; }
.peso-estimado {
  font-size: 48px; font-weight: bold; color: #006d37; margin: 8px 0 4px;
}
.estimado-label { font-size: 14px; font-weight: normal; color: #6b7280; }
</style>
