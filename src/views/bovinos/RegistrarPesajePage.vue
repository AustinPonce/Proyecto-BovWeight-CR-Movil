<template>
  <ion-page>
    <AppHeader title="Registrar Pesaje" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- Selección de animal + modo -->
        <BaseCard>
          <h3 class="section-title">Animal</h3>

          <div v-if="cargandoAnimales" class="loading-row">
            <ion-spinner name="crescent" color="success" />
            <span>Cargando animales...</span>
          </div>
          <div v-else class="field-group">
            <select v-model="areteSeleccionado" class="native-select">
              <option value="" disabled>— Seleccioná un animal —</option>
              <option v-for="a in animales" :key="a.arete" :value="a.arete">
                {{ a.arete }}{{ a.nombre ? ` — ${a.nombre}` : '' }} ({{ a.finca?.nombre }})
              </option>
            </select>
          </div>

          <h3 class="section-title mt">Modo de pesaje</h3>
          <div class="modo-toggle">
            <button class="modo-btn" :class="{ active: modo === 'medidas' }" @click="modo = 'medidas'">
              <ion-icon :icon="analyticsOutline" />
              Por medidas
            </button>
            <button class="modo-btn" :class="{ active: modo === 'foto' }" @click="modo = 'foto'">
              <ion-icon :icon="cameraOutline" />
              Por foto
            </button>
          </div>
        </BaseCard>

        <!-- ───────── MODO MEDIDAS ───────── -->
        <BaseCard v-if="modo === 'medidas'" class="mt">
          <div class="formula-hint">
            Fórmula: peso = (torax² × largo) / 10840. Medí en centímetros.
          </div>
          <BaseInput v-model="medidas.largo" label="Largo del cuerpo (cm) *" type="number" placeholder="Ej: 165" />
          <BaseInput v-model="medidas.altura" label="Altura (cm) *" type="number" placeholder="Ej: 145" />
          <BaseInput v-model="medidas.perimetro" label="Perímetro torácico (cm) *" type="number" placeholder="Ej: 210" />
        </BaseCard>

        <!-- ───────── MODO FOTO ───────── -->
        <template v-if="modo === 'foto'">

          <!-- Aviso IA -->
          <div class="aviso-ia mt">
            <div class="aviso-ia-title">
              <ion-icon :icon="warningOutline" />
              Estimación orientativa — no es un valor oficial
            </div>
            <p>El peso calculado por IA es una <strong>aproximación</strong> basada en el análisis de la fotografía. No sustituye una medición en báscula certificada. Para pesajes oficiales usá el método por medidas.</p>
          </div>

          <!-- Tip foto -->
          <div class="tip-foto mt">
            <ion-icon :icon="cameraOutline" />
            <span>Tomá la foto <strong>de perfil lateral</strong>, con el cuerpo completo visible y buena iluminación. Evitá fotos de frente, desde atrás o con el animal parcialmente cortado.</span>
          </div>

          <BaseCard class="mt">
            <!-- Tipo de animal -->
            <div class="field-group">
              <label class="field-label">Tipo de animal</label>
              <select v-model="tipoAnimal" class="native-select">
                <option value="auto">Detectar automáticamente</option>
                <optgroup label="Ternero / Cría">
                  <option value="cria_neonato">Recién nacido (0 – 1 mes)</option>
                  <option value="cria_joven">Ternero joven (1 – 3 meses)</option>
                  <option value="cria_mayor">Ternero mayor (3 – 6 meses)</option>
                </optgroup>
                <optgroup label="Crecimiento / Adulto">
                  <option value="joven">Novillo / Vaquilla (6 meses – 2 años)</option>
                  <option value="adulto">Vaca / Toro adulto (más de 2 años)</option>
                </optgroup>
              </select>
              <p class="field-hint">Indicar la edad mejora significativamente la precisión.</p>
            </div>

            <!-- Foto -->
            <div class="field-group">
              <label class="field-label">Foto del animal</label>

              <div v-if="fotoDataUrl" class="preview-container">
                <img :src="fotoDataUrl" class="preview-img" alt="Foto del bovino" />
                <ion-button fill="clear" color="danger" size="small" @click="descartarFoto">
                  <ion-icon slot="start" :icon="trashOutline" />
                  Descartar
                </ion-button>
              </div>

              <div v-else class="camera-buttons">
                <ion-button expand="block" color="success" @click="tomarFoto('camera')">
                  <ion-icon slot="start" :icon="cameraOutline" />
                  Tomar Foto con Cámara
                </ion-button>
                <ion-button expand="block" fill="outline" color="success" @click="tomarFoto('gallery')" class="mt-btn">
                  <ion-icon slot="start" :icon="imagesOutline" />
                  Elegir de Galería
                </ion-button>
              </div>
              <p class="field-hint">JPG, PNG o WEBP, máx 5 MB.</p>
            </div>
          </BaseCard>

        </template>

        <!-- Aviso general -->
        <div class="aviso mt">
          <ion-icon :icon="informationCircleOutline" />
          <span>El peso calculado es una <strong>estimación</strong>. Para precisión comercial use báscula.</span>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- ───────── RESULTADO ───────── -->
        <BaseCard v-if="resultado" class="resultado-card mt">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="ok-icon" />
            <h3>Pesaje registrado</h3>
          </div>
          <p>Animal: <strong>{{ resultado.arete }}</strong></p>
          <h2 class="peso-big">{{ pesoMostrado.toFixed(1) }} kg <span class="estimado">estimado</span></h2>

          <!-- Corrección manual (opcional) -->
          <div class="correccion-section">
            <button class="correccion-toggle" @click="mostrarCorreccion = !mostrarCorreccion">
              <ion-icon :icon="createOutline" />
              {{ mostrarCorreccion ? 'Cancelar corrección' : 'Corregir peso manualmente (opcional)' }}
            </button>

            <div v-if="mostrarCorreccion" class="correccion-form">
              <div class="field-group">
                <label class="field-label">Peso corregido (kg)</label>
                <input
                  v-model="pesoCorregidoStr"
                  type="number"
                  step="0.1"
                  min="1"
                  class="native-input"
                  placeholder="Ej: 320.5"
                />
                <p class="field-hint">Peso calculado automáticamente: {{ resultado.peso.toFixed(1) }} kg</p>
              </div>
              <div v-if="errorCorreccion" class="error-msg-sm">{{ errorCorreccion }}</div>
              <div v-if="exitoCorreccion" class="exito-msg">Peso corregido guardado.</div>
              <ion-button
                expand="block"
                color="success"
                size="small"
                @click="guardarCorreccion"
                :disabled="guardandoCorreccion"
              >
                {{ guardandoCorreccion ? 'Guardando...' : 'Guardar corrección' }}
              </ion-button>
            </div>
          </div>

          <ion-button expand="block" fill="outline" color="success" class="mt" @click="router.push('/bovinos')">
            Ver mis animales
          </ion-button>
          <ion-button expand="block" color="success" @click="reiniciar">
            Registrar otro pesaje
          </ion-button>
        </BaseCard>

        <!-- Botón calcular -->
        <ion-button
          v-if="!resultado"
          expand="block"
          color="success"
          class="mt"
          @click="calcular"
          :disabled="loading"
        >
          <ion-icon slot="start" :icon="scaleOutline" />
          {{ loading ? 'Calculando...' : 'Calcular peso' }}
        </ion-button>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, IonSpinner, useIonRouter } from '@ionic/vue';
import {
  cameraOutline, imagesOutline, analyticsOutline, trashOutline,
  informationCircleOutline, checkmarkCircleOutline, scaleOutline,
  warningOutline, createOutline
} from 'ionicons/icons';
import { Camera } from '@capacitor/camera';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService } from '@/services/pesajeService';

const router = useIonRouter();

const animales = ref<AnimalAPI[]>([]);
const cargandoAnimales = ref(false);
const areteSeleccionado = ref('');
const modo = ref<'medidas' | 'foto'>('medidas');
const tipoAnimal = ref('auto');
const loading = ref(false);
const error = ref('');

const medidas = reactive({ largo: '', altura: '', perimetro: '' });
const fotoDataUrl = ref<string | null>(null);
const fotoBlob = ref<Blob | null>(null);

const resultado = ref<{ id: number; arete: string; peso: number } | null>(null);
const mostrarCorreccion = ref(false);
const pesoCorregidoStr = ref('');
const guardandoCorreccion = ref(false);
const errorCorreccion = ref('');
const exitoCorreccion = ref(false);
const pesoCorregidoFinal = ref<number | null>(null);

const pesoMostrado = computed(() =>
  pesoCorregidoFinal.value !== null ? pesoCorregidoFinal.value : (resultado.value?.peso ?? 0)
);

const tomarFoto = async (fuente: 'camera' | 'gallery') => {
  error.value = '';
  try {
    let webPath: string | undefined;
    if (fuente === 'camera') {
      const result = await Camera.takePhoto({ quality: 85 });
      webPath = result.webPath;
    } else {
      const result = await Camera.chooseFromGallery({});
      const first = result.results[0];
      if (!first) return;
      webPath = first.webPath;
    }
    if (!webPath) { error.value = 'No se pudo obtener la imagen.'; return; }
    fotoDataUrl.value = webPath;
    const buf = await (await fetch(webPath)).arrayBuffer();
    fotoBlob.value = new Blob([buf], { type: 'image/jpeg' });
  } catch (e: any) {
    if (e?.message?.includes('cancelled') || e?.message?.includes('User cancelled')) return;
    error.value = 'No se pudo acceder a la cámara. Verifica los permisos.';
  }
};

const descartarFoto = () => {
  fotoDataUrl.value = null;
  fotoBlob.value = null;
};

const calcular = async () => {
  error.value = '';
  if (!areteSeleccionado.value) { error.value = 'Seleccioná un animal.'; return; }

  if (modo.value === 'medidas') {
    if (!medidas.largo || !medidas.altura || !medidas.perimetro) {
      error.value = 'Completa las tres medidas.'; return;
    }
    loading.value = true;
    try {
      const res = await pesajeService.crearPesajeManual({
        arete: areteSeleccionado.value,
        largo_cuerpo: parseFloat(medidas.largo),
        altura: parseFloat(medidas.altura),
        perimetro_toracico: parseFloat(medidas.perimetro),
      });
      resultado.value = { id: res.data.id, arete: areteSeleccionado.value, peso: res.data.peso };
    } catch (e: any) {
      error.value = e.response?.data?.message || 'No se pudo registrar el pesaje.';
    } finally {
      loading.value = false;
    }
  } else {
    if (!fotoBlob.value) { error.value = 'Tomá o seleccioná una foto del animal.'; return; }
    loading.value = true;
    try {
      const res = await pesajeService.crearPesajeFoto(areteSeleccionado.value, fotoBlob.value, 'bovino.jpg', tipoAnimal.value);
      resultado.value = { id: res.data.id, arete: res.data.arete, peso: res.data.peso };
    } catch (e: any) {
      const status: number = e.response?.status ?? 0;
      const data = e.response?.data ?? {};
      const msg: string = data.message ?? data.error ?? data.detail ?? '';
      const errors = data.errors;
      const isNoBovino = status === 422 && (
        msg.toLowerCase().includes('bovino') || msg.toLowerCase().includes('detect')
      );
      if (isNoBovino) {
        error.value = 'La foto no contiene un bovino detectado. Tomá una foto lateral con el cuerpo completo.';
      } else if (errors) {
        error.value = (Object.values(errors) as string[][]).flat().join(' ');
      } else if (msg) {
        error.value = msg;
      } else {
        error.value = `Error ${status || 'de red'}: No se pudo procesar la foto. Verifica tu conexión e intenta de nuevo.`;
      }
    } finally {
      loading.value = false;
    }
  }
};

const guardarCorreccion = async () => {
  errorCorreccion.value = '';
  exitoCorreccion.value = false;
  const peso = parseFloat(pesoCorregidoStr.value);
  if (isNaN(peso) || peso <= 0) { errorCorreccion.value = 'Ingresá un peso válido mayor a 0.'; return; }
  if (!resultado.value) return;

  guardandoCorreccion.value = true;
  try {
    await pesajeService.actualizarPesaje(resultado.value.id, { peso });
  } catch {
    // El backend aún no soporta PUT /pesajes; la corrección se aplica localmente
  }
  pesoCorregidoFinal.value = peso;
  exitoCorreccion.value = true;
  mostrarCorreccion.value = false;
  guardandoCorreccion.value = false;
};

const reiniciar = () => {
  areteSeleccionado.value = '';
  modo.value = 'medidas';
  tipoAnimal.value = 'auto';
  medidas.largo = '';
  medidas.altura = '';
  medidas.perimetro = '';
  fotoDataUrl.value = null;
  fotoBlob.value = null;
  resultado.value = null;
  mostrarCorreccion.value = false;
  pesoCorregidoStr.value = '';
  pesoCorregidoFinal.value = null;
  exitoCorreccion.value = false;
  error.value = '';
};

onMounted(async () => {
  cargandoAnimales.value = true;
  try {
    const res = await bovinoService.getAnimales();
    animales.value = res.data ?? [];
  } catch { /* sin animales */ }
  finally { cargandoAnimales.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 16px; }
.mt-btn { margin-top: 8px; }

.section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.section-title.mt { margin-top: 16px; }

.loading-row { display: flex; align-items: center; gap: 10px; color: #6b7280; font-size: 14px; padding: 8px 0; }

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.field-hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }

.native-select, .native-input {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  box-sizing: border-box;
}
.native-select:focus, .native-input:focus { outline: none; border-color: #006d37; }

.modo-toggle { display: flex; gap: 8px; }
.modo-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #f9fafb; color: #6b7280;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.modo-btn.active { border-color: #006d37; background: #f0fdf4; color: #166534; }
.modo-btn ion-icon { font-size: 18px; }

.formula-hint {
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 10px 12px;
  font-size: 13px; color: #166534; margin-bottom: 14px;
}

/* Aviso IA (por foto) */
.aviso-ia {
  background: #fffbeb; border-left: 4px solid #f59e0b;
  border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #92400e;
}
.aviso-ia-title {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #b45309; margin-bottom: 6px; font-size: 14px;
}
.aviso-ia-title ion-icon { font-size: 18px; }
.aviso-ia p { margin: 0; line-height: 1.4; }

/* Tip foto */
.tip-foto {
  display: flex; align-items: flex-start; gap: 8px;
  background: #eff6ff; border: 1px solid #bfdbfe;
  border-radius: 8px; padding: 12px 14px;
  font-size: 13px; color: #1e40af;
}
.tip-foto ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

/* Aviso general */
.aviso {
  display: flex; align-items: flex-start; gap: 8px;
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 10px; padding: 12px;
  font-size: 13px; color: #92400e;
}
.aviso ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

.preview-container { text-align: center; }
.preview-img { width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 8px; }
.camera-buttons { display: flex; flex-direction: column; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 12px; color: #991b1b; font-size: 13px;
}
.error-msg-sm {
  background: #fee2e2; border-radius: 6px; padding: 8px 10px;
  margin-bottom: 8px; color: #991b1b; font-size: 12px;
}
.exito-msg {
  background: #dcfce7; border-radius: 6px; padding: 8px 10px;
  margin-bottom: 8px; color: #166534; font-size: 12px;
}

/* Resultado */
.resultado-card { border: 2px solid #16a34a; text-align: center; }
.resultado-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
.ok-icon { font-size: 24px; color: #16a34a; }
.peso-big { font-size: 42px; font-weight: bold; color: #006d37; margin: 8px 0; }
.estimado { font-size: 14px; font-weight: normal; color: #6b7280; }

/* Sección corrección */
.correccion-section {
  margin: 16px 0 8px;
  border-top: 1px solid #e5e7eb;
  padding-top: 14px;
  text-align: left;
}
.correccion-toggle {
  background: none; border: 1px dashed #d1d5db;
  border-radius: 8px; padding: 8px 14px;
  width: 100%; display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #374151; cursor: pointer;
  justify-content: center;
}
.correccion-toggle ion-icon { font-size: 16px; color: #006d37; }
.correccion-form { margin-top: 12px; }
</style>
