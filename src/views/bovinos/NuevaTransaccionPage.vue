<template>
  <ion-page>
    <AppHeader title="Registrar Transacción" :show-back="true" default-href="/transacciones" />

    <ion-content>
      <div class="container">
        <p class="subtitulo">Registrá una compra o venta de ganado bovino negociada en kilogramos en pie. El monto total se calcula automáticamente.</p>

        <BaseCard>

          <!-- Tipo y Animal -->
          <div class="two-col">
            <div class="field-group">
              <label class="field-label">Tipo de transacción *</label>
              <select v-model="form.tipo" class="native-select">
                <option value="" disabled>— Seleccioná —</option>
                <option value="compra">Compra</option>
                <option value="venta">Venta</option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Animal *</label>
              <div v-if="cargandoAnimales" class="loading-mini">
                <ion-spinner name="crescent" color="success" />
              </div>
              <select v-else v-model="form.arete" class="native-select">
                <option value="" disabled>— Seleccioná un animal —</option>
                <option v-for="a in animales" :key="a.arete" :value="a.arete">
                  {{ a.arete }}{{ a.nombre ? ` — ${a.nombre}` : '' }}
                </option>
              </select>
            </div>
          </div>

          <!-- Datos del comprador/vendedor -->
          <div class="seccion-box">
            <p class="seccion-label">Datos del comprador / vendedor</p>
            <BaseInput
              v-model="form.nombre_contraparte"
              label="Nombre completo *"
              placeholder="Ej: Juan Pérez"
            />
            <BaseInput
              v-model="form.cedula_contraparte"
              label="Cédula / ID (opcional)"
              placeholder="Ej: 123456789"
            />
          </div>

          <!-- Precio, Peso y Monto -->
          <div class="three-col">
            <div class="field-group">
              <label class="field-label">Precio por kg (₡) *</label>
              <input v-model="form.precioStr" type="number" class="native-input" placeholder="Ej: 2500" min="0" />
            </div>
            <div class="field-group">
              <label class="field-label">Peso negociado (kg) *</label>
              <input v-model="form.pesoStr" type="number" class="native-input" placeholder="Ej: 350" min="0" />
            </div>
            <div class="field-group">
              <label class="field-label">Monto total estimado (₡)</label>
              <input :value="montoFormateado" type="text" class="native-input monto" readonly />
            </div>
          </div>

          <!-- Notas -->
          <div class="field-group">
            <label class="field-label">Notas / observaciones (opcional)</label>
            <textarea v-model="form.notas" class="textarea" rows="3" placeholder="Observaciones de la transacción..." />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="btn-row">
            <ion-button fill="outline" color="medium" @click="router.back()">Cancelar</ion-button>
            <ion-button color="warning" @click="guardar" :disabled="guardando" style="--background:#f97316">
              {{ guardando ? 'Registrando...' : 'Registrar transacción' }}
            </ion-button>
          </div>

        </BaseCard>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonSpinner, useIonRouter } from '@ionic/vue';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { transaccionService } from '@/services/transaccionService';

const router = useIonRouter();

const animales = ref<AnimalAPI[]>([]);
const cargandoAnimales = ref(false);
const guardando = ref(false);
const error = ref('');

const form = reactive({
  tipo: '' as '' | 'compra' | 'venta',
  arete: '',
  nombre_contraparte: '',
  cedula_contraparte: '',
  precioStr: '',
  pesoStr: '',
  notas: '',
});

const montoTotal = computed(() => {
  const precio = parseFloat(form.precioStr);
  const peso = parseFloat(form.pesoStr);
  if (isNaN(precio) || isNaN(peso) || precio <= 0 || peso <= 0) return null;
  return precio * peso;
});

const montoFormateado = computed(() =>
  montoTotal.value !== null ? montoTotal.value.toLocaleString('es-CR') : '—'
);

const guardar = async () => {
  error.value = '';
  if (!form.tipo) { error.value = 'Seleccioná el tipo de transacción.'; return; }
  if (!form.arete) { error.value = 'Seleccioná un animal.'; return; }
  if (!form.nombre_contraparte.trim()) { error.value = 'Ingresá el nombre del comprador/vendedor.'; return; }
  const precio = parseFloat(form.precioStr);
  const peso = parseFloat(form.pesoStr);
  if (isNaN(precio) || precio <= 0) { error.value = 'El precio por kg debe ser mayor a 0.'; return; }
  if (isNaN(peso) || peso <= 0) { error.value = 'El peso negociado debe ser mayor a 0.'; return; }

  guardando.value = true;
  try {
    await transaccionService.crearTransaccion({
      tipo: form.tipo as 'compra' | 'venta',
      arete: form.arete,
      nombre_contraparte: form.nombre_contraparte.trim(),
      cedula_contraparte: form.cedula_contraparte.trim() || undefined,
      precio_por_kg: precio,
      peso_negociado: peso,
      notas: form.notas.trim() || undefined,
    });
    router.push('/transacciones');
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    error.value = errors
      ? (Object.values(errors) as string[][]).flat().join(' ')
      : e.response?.data?.message || 'No se pudo registrar la transacción.';
  } finally {
    guardando.value = false;
  }
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

.subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 16px; line-height: 1.4; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }

.native-select, .native-input {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  box-sizing: border-box;
}
.native-select:focus, .native-input:focus { outline: none; border-color: #006d37; }
.native-input.monto { background: #f9fafb; color: #166534; font-weight: 600; }

.loading-mini {
  display: flex; align-items: center; padding: 10px 0; gap: 8px;
  color: #6b7280; font-size: 13px;
}

.seccion-box {
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 10px; padding: 12px; margin: 10px 0;
}
.seccion-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }

.textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  resize: vertical; box-sizing: border-box;
}

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 10px; color: #991b1b; font-size: 13px;
}

.btn-row {
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px;
}
</style>
