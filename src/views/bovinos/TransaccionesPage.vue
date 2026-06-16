<template>
  <ion-page>
    <AppHeader title="Transacciones" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- Formulario nueva transacción -->
        <BaseCard>
          <h3 class="card-title">
            <ion-icon :icon="swapHorizontalOutline" class="title-icon" />
            Nueva Transacción
          </h3>

          <BaseInput v-model="form.arete" label="Arete del Bovino *" placeholder="Ej: CR-12345" />

          <div class="field-group">
            <label class="field-label">Tipo de Transacción *</label>
            <div class="tipo-row">
              <button
                class="tipo-btn"
                :class="{ active: form.tipo === 'compra', compra: true }"
                @click="form.tipo = 'compra'"
              >
                <ion-icon :icon="arrowDownCircleOutline" /> Compra
              </button>
              <button
                class="tipo-btn"
                :class="{ active: form.tipo === 'venta', venta: true }"
                @click="form.tipo = 'venta'"
              >
                <ion-icon :icon="arrowUpCircleOutline" /> Venta
              </button>
            </div>
          </div>

          <BaseInput
            v-model="form.nombre_contraparte"
            label="Nombre del comprador/vendedor *"
            placeholder="Ej: Juan Pérez"
          />

          <BaseInput
            v-model="form.cedula_contraparte"
            label="Cédula del comprador/vendedor (opcional)"
            placeholder="Ej: 123456789"
          />

          <BaseInput
            v-model="form.pesoStr"
            label="Peso negociado (kg) *"
            placeholder="Ej: 350"
            type="number"
          />

          <BaseInput
            v-model="form.precioStr"
            label="Precio por kg (₡) *"
            placeholder="Ej: 2500"
            type="number"
          />

          <div class="field-group">
            <label class="field-label">Notas (opcional)</label>
            <textarea v-model="form.notas" class="textarea" rows="2"
              placeholder="Observaciones de la transacción..." />
          </div>

          <!-- Cálculo automático -->
          <div v-if="montoTotal !== null" class="monto-preview">
            <span class="monto-label">Monto total estimado:</span>
            <span class="monto-valor">₡{{ montoTotal.toLocaleString('es-CR') }}</span>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <BaseButton @click="guardar" :disabled="guardando">
            {{ guardando ? 'Registrando...' : 'Registrar Transacción' }}
          </BaseButton>
        </BaseCard>

        <!-- Historial de transacciones -->
        <div class="section-header mt">
          <h3>Historial</h3>
          <button class="reload-btn" @click="cargarHistorial">
            <ion-icon :icon="refreshOutline" />
          </button>
        </div>

        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
        </div>

        <div v-else-if="transacciones.length === 0" class="empty-hint">
          Sin transacciones registradas.
        </div>

        <div v-else class="trans-list">
          <div class="trans-item" v-for="t in transacciones" :key="t.id">
            <div class="trans-tipo" :class="t.tipo">
              <ion-icon :icon="t.tipo === 'compra' ? arrowDownCircleOutline : arrowUpCircleOutline" />
              <span>{{ t.tipo === 'compra' ? 'Compra' : 'Venta' }}</span>
            </div>
            <div class="trans-info">
              <p class="trans-arete">Arete: <strong>{{ t.arete }}</strong></p>
              <p class="trans-contraparte">{{ t.nombre_contraparte }}</p>
              <p class="trans-detalle">{{ t.peso_negociado }} kg × ₡{{ t.precio_por_kg.toLocaleString('es-CR') }}/kg</p>
              <p class="trans-fecha">{{ formatFecha(t.fecha) }}</p>
            </div>
            <div class="trans-monto" :class="t.tipo">
              ₡{{ t.monto_total.toLocaleString('es-CR') }}
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import {
  swapHorizontalOutline, arrowDownCircleOutline, arrowUpCircleOutline,
  refreshOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { transaccionService, type TransaccionAPI } from '@/services/transaccionService';

const form = ref({
  arete: '',
  tipo: 'venta' as 'compra' | 'venta',
  nombre_contraparte: '',
  cedula_contraparte: '',
  pesoStr: '',
  precioStr: '',
  notas: '',
});

const guardando = ref(false);
const error = ref('');
const transacciones = ref<TransaccionAPI[]>([]);
const cargando = ref(false);

const montoTotal = computed(() => {
  const peso = parseFloat(form.value.pesoStr);
  const precio = parseFloat(form.value.precioStr);
  if (isNaN(peso) || isNaN(precio) || peso <= 0 || precio <= 0) return null;
  return peso * precio;
});

const formatFecha = (f: string) => {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const guardar = async () => {
  error.value = '';
  if (!form.value.arete.trim()) { error.value = 'Ingresa el arete del bovino'; return; }
  if (!form.value.nombre_contraparte.trim()) { error.value = 'Ingresa el nombre del comprador/vendedor'; return; }
  const peso = parseFloat(form.value.pesoStr);
  const precio = parseFloat(form.value.precioStr);
  if (isNaN(peso) || peso <= 0) { error.value = 'El peso debe ser mayor a 0'; return; }
  if (isNaN(precio) || precio <= 0) { error.value = 'El precio debe ser mayor a 0'; return; }

  guardando.value = true;
  try {
    const res = await transaccionService.crearTransaccion({
      tipo: form.value.tipo,
      arete: form.value.arete.trim(),
      nombre_contraparte: form.value.nombre_contraparte.trim(),
      cedula_contraparte: form.value.cedula_contraparte.trim() || undefined,
      precio_por_kg: precio,
      peso_negociado: peso,
      notas: form.value.notas.trim() || undefined,
    });
    transacciones.value.unshift(res.data);
    form.value = { arete: '', tipo: 'venta', nombre_contraparte: '', cedula_contraparte: '', pesoStr: '', precioStr: '', notas: '' };
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    error.value = errors
      ? (Object.values(errors) as string[][]).flat().join(' ')
      : e.response?.data?.mensaje || e.response?.data?.message || 'No se pudo registrar la transacción.';
  } finally {
    guardando.value = false;
  }
};

const cargarHistorial = async () => {
  cargando.value = true;
  try {
    const res = await transaccionService.getTransacciones();
    transacciones.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* silent */ }
  finally { cargando.value = false; }
};

onMounted(cargarHistorial);
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 20px; }

.card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 14px;
}
.title-icon { color: #006d37; font-size: 20px; }

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }

.tipo-row { display: flex; gap: 10px; }
.tipo-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #f9fafb; color: #6b7280;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.tipo-btn.active.compra { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
.tipo-btn.active.venta { border-color: #16a34a; background: #f0fdf4; color: #166534; }

.textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  resize: vertical; box-sizing: border-box;
}

.monto-preview {
  display: flex; justify-content: space-between; align-items: center;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 10px; padding: 12px 16px; margin-top: 12px;
}
.monto-label { font-size: 13px; color: #166534; }
.monto-valor { font-size: 20px; font-weight: bold; color: #006d37; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 10px; color: #991b1b; font-size: 13px;
}

.section-header {
  display: flex; justify-content: space-between; align-items: center;
}
.section-header h3 { font-size: 16px; font-weight: 600; color: #374151; margin: 0; }
.reload-btn {
  background: none; border: none; font-size: 22px; color: #006d37; cursor: pointer;
}

.loading-box {
  display: flex; justify-content: center; padding: 24px 0;
}
.empty-hint { text-align: center; color: #9ca3af; font-size: 14px; padding: 24px 0; }

.trans-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.trans-item {
  display: flex; align-items: center; gap: 12px;
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 12px 14px;
}
.trans-tipo {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 52px; font-size: 11px; font-weight: 600;
}
.trans-tipo.compra { color: #1d4ed8; }
.trans-tipo.venta { color: #166534; }
.trans-tipo ion-icon { font-size: 26px; }

.trans-info { flex: 1; }
.trans-arete { margin: 0 0 2px; font-size: 14px; }
.trans-contraparte { margin: 0 0 2px; font-size: 13px; color: #374151; font-weight: 500; }
.trans-detalle { margin: 0 0 2px; font-size: 12px; color: #6b7280; }
.trans-fecha { margin: 0; font-size: 11px; color: #9ca3af; }

.trans-monto { font-size: 15px; font-weight: bold; }
.trans-monto.compra { color: #1d4ed8; }
.trans-monto.venta { color: #166534; }
</style>