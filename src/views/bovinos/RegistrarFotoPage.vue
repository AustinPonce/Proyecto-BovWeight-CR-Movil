<template>
  <ion-page>

    <AppHeader title="Registrar por Foto" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- PASO 1: Animal -->
        <BaseCard>
          <h3 class="step-title">
            <ion-icon :icon="pawOutline" class="step-icon" />
            Animal
          </h3>

          <BaseInput
            v-model="arete"
            label="Número de Arete *"
            placeholder="Ej: CR-12345"
          />

          <div v-if="animalEncontrado" class="animal-info">
            <ion-icon :icon="checkmarkCircleOutline" class="check-icon" />
            <span>{{ animalEncontrado.nombre || 'Sin nombre' }} · {{ animalEncontrado.raza?.nombre }}</span>
          </div>

          <ion-button
            fill="outline"
            color="success"
            size="small"
            @click="buscarAnimal"
            :disabled="!arete || buscandoAnimal"
          >
            {{ buscandoAnimal ? 'Buscando...' : 'Verificar arete' }}
          </ion-button>
        </BaseCard>

        <!-- PASO 2: Fotografía -->
        <BaseCard class="mt">
          <h3 class="step-title">
            <ion-icon :icon="cameraOutline" class="step-icon" />
            Fotografía del Animal
          </h3>

          <p class="instruccion">
            Toma la foto de <strong>perfil lateral</strong> del animal con el cuerpo completo visible.
            El sistema estimará el peso usando inteligencia artificial.
          </p>

          <!-- Vista previa de la foto -->
          <div v-if="fotoDataUrl" class="preview-container">
            <img :src="fotoDataUrl" class="preview-img" alt="Foto del bovino" />
            <ion-button fill="clear" color="danger" size="small" @click="descartarFoto">
              <ion-icon slot="start" :icon="trashOutline" />
              Descartar
            </ion-button>
          </div>

          <!-- Botones de cámara -->
          <div v-else class="camera-buttons">
            <ion-button
              expand="block"
              color="success"
              @click="tomarFoto('camera')"
            >
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

        <!-- Aviso legal -->
        <div class="aviso">
          <ion-icon :icon="informationCircleOutline" />
          <span>Esta es una <strong>estimación</strong>. Para transacciones comerciales use báscula oficial.</span>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- Resultado -->
        <BaseCard v-if="resultado" class="resultado-card">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="resultado-icon" />
            <h2>Peso estimado</h2>
          </div>
          <h1 class="peso-estimado">{{ resultado.peso.toFixed(1) }} kg</h1>
          <p class="resultado-arete">Arete: {{ resultado.arete }}</p>
        </BaseCard>

        <!-- Botón de envío -->
        <ion-button
          v-if="fotoDataUrl && arete && !resultado"
          expand="block"
          color="success"
          class="mt"
          @click="enviarFoto"
          :disabled="enviando || !animalEncontrado"
        >
          <ion-icon slot="start" :icon="cloudUploadOutline" />
          {{ enviando ? 'Estimando peso...' : 'Estimar Peso con IA' }}
        </ion-button>

        <ion-button
          v-if="resultado"
          expand="block"
          fill="outline"
          color="success"
          class="mt"
          @click="reiniciar"
        >
          Registrar otro bovino
        </ion-button>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon,
  toastController
} from '@ionic/vue';
import {
  cameraOutline, imagesOutline, pawOutline, trashOutline,
  informationCircleOutline, cloudUploadOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { Camera } from '@capacitor/camera';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService } from '@/services/pesajeService';

// Estado
const arete = ref('');
const animalEncontrado = ref<AnimalAPI | null>(null);
const buscandoAnimal = ref(false);

const fotoDataUrl = ref<string | null>(null);
const fotoBlob = ref<Blob | null>(null);

const enviando = ref(false);
const error = ref('');
const resultado = ref<{ peso: number; arete: string } | null>(null);

// Verificar que el arete existe en el sistema
const buscarAnimal = async () => {
  if (!arete.value.trim()) return;
  buscandoAnimal.value = true;
  animalEncontrado.value = null;
  error.value = '';
  try {
    const res = await bovinoService.getAnimal(arete.value.trim());
    animalEncontrado.value = res.data;
  } catch {
    error.value = `No se encontró ningún animal con el arete "${arete.value}". Verifica el número o registra el animal primero.`;
  } finally {
    buscandoAnimal.value = false;
  }
};

// Abrir cámara o galería usando Capacitor
const tomarFoto = async (fuente: 'camera' | 'gallery') => {
  error.value = '';
  try {
    const foto = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: 'dataUrl',
      source: fuente === 'camera' ? 'CAMERA' : 'PHOTOS',
      width: 1024,
    } as any);

    if (!foto.dataUrl) {
      error.value = 'No se pudo obtener la imagen.';
      return;
    }

    fotoDataUrl.value = foto.dataUrl;

    // Convertir DataUrl → Blob para enviar como multipart
    const fetchRes = await fetch(foto.dataUrl);
    fotoBlob.value = await fetchRes.blob();
  } catch (e: any) {
    if (e?.message?.includes('cancelled') || e?.message?.includes('User cancelled')) {
      return; // El usuario canceló, no es un error
    }
    error.value = 'No se pudo acceder a la cámara. Verifica los permisos.';
  }
};

const descartarFoto = () => {
  fotoDataUrl.value = null;
  fotoBlob.value = null;
  resultado.value = null;
};

// Enviar foto al API para estimar peso
const enviarFoto = async () => {
  if (!fotoBlob.value || !arete.value || !animalEncontrado.value) return;
  enviando.value = true;
  error.value = '';
  try {
    const res = await pesajeService.crearPesajeFoto(
      arete.value.trim(),
      fotoBlob.value,
      'bovino.jpg'
    );
    resultado.value = { peso: res.data.peso, arete: res.data.arete };

    const toast = await toastController.create({
      message: `Peso estimado: ${res.data.peso.toFixed(1)} kg`,
      duration: 3000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  } catch (e: any) {
    const msg = e.response?.data?.message || e.response?.data?.errors;
    error.value = typeof msg === 'string'
      ? msg
      : 'Error al procesar la imagen. Asegúrate de que el servicio de IA esté activo.';
  } finally {
    enviando.value = false;
  }
};

const reiniciar = () => {
  arete.value = '';
  animalEncontrado.value = null;
  fotoDataUrl.value = null;
  fotoBlob.value = null;
  resultado.value = null;
  error.value = '';
};
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 32px;
}
.mt { margin-top: 16px; }
.mt-btn { margin-top: 8px; }

.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}
.step-icon {
  color: #006d37;
  font-size: 20px;
}

.animal-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0;
}
.check-icon { font-size: 18px; color: #16a34a; }

.instruccion {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.preview-container {
  text-align: center;
}
.preview-img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 8px;
}

.camera-buttons {
  display: flex;
  flex-direction: column;
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
.aviso ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

.error-msg {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  color: #991b1b;
  font-size: 13px;
}

.resultado-card {
  border: 2px solid #16a34a;
  text-align: center;
  margin-top: 16px;
}
.resultado-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}
.resultado-icon {
  font-size: 24px;
  color: #16a34a;
}
.peso-estimado {
  font-size: 52px;
  font-weight: bold;
  color: #006d37;
  margin: 0 0 4px;
}
.resultado-arete {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}
</style>
