<template>
  <ion-page>
    <AppHeader title="Transacciones de ganado" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">
        <p class="subtitulo">Registro de compras y ventas en kg en pie</p>

        <!-- Botones exportar + Nueva transacción -->
        <div class="top-row">
          <div class="export-row">
            <button class="export-btn pdf" @click="exportarPDF" :disabled="exportando !== ''">
              <ion-icon :icon="documentOutline" />
              {{ exportando === 'pdf' ? '...' : 'PDF' }}
            </button>
            <button class="export-btn csv-excel" @click="exportarCSV" :disabled="exportando !== ''">
              <ion-icon :icon="gridOutline" />
              {{ exportando === 'csv' ? '...' : 'CSV/Excel' }}
            </button>
          </div>
          <ion-button color="warning" size="small" @click="router.push('/transacciones/nueva')" style="--background:#f97316">
            <ion-icon slot="start" :icon="addOutline" />
            + Nueva transacción
          </ion-button>
        </div>

        <!-- Filtros -->
        <div class="filtros-row">
          <div class="field-mini">
            <label class="field-label">Tipo</label>
            <select v-model="filtroTipo" class="native-select">
              <option value="">Todos</option>
              <option value="compra">Compra</option>
              <option value="venta">Venta</option>
            </select>
          </div>
          <div class="field-mini flex-grow">
            <label class="field-label">Animal (arete)</label>
            <select v-model="filtroArete" class="native-select">
              <option value="">Todos</option>
              <option v-for="t in areteUnicos" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- Cargando -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
        </div>

        <!-- Vacío -->
        <div v-else-if="transaccionesFiltradas.length === 0" class="empty-hint">
          No hay transacciones registradas.
        </div>

        <!-- Lista -->
        <div v-else class="trans-list">
          <div class="trans-item" v-for="t in transaccionesFiltradas" :key="t.id">
            <div class="trans-tipo" :class="t.tipo">
              <ion-icon :icon="t.tipo === 'compra' ? arrowDownCircleOutline : arrowUpCircleOutline" />
              <span>{{ t.tipo === 'compra' ? 'Compra' : 'Venta' }}</span>
            </div>
            <div class="trans-info">
              <p class="trans-arete">Arete: <strong>{{ t.arete }}</strong>
                <span v-if="t.animal?.nombre"> — {{ t.animal.nombre }}</span>
              </p>
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
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton, useIonRouter } from '@ionic/vue';
import {
  arrowDownCircleOutline, arrowUpCircleOutline,
  documentOutline, gridOutline, addOutline
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import { transaccionService, type TransaccionAPI } from '@/services/transaccionService';

const router = useIonRouter();

const transacciones = ref<TransaccionAPI[]>([]);
const cargando = ref(false);
const exportando = ref('');
const filtroTipo = ref('');
const filtroArete = ref('');

const areteUnicos = computed(() => [...new Set(transacciones.value.map(t => t.arete))].sort());

const transaccionesFiltradas = computed(() => {
  let lista = transacciones.value;
  if (filtroTipo.value) lista = lista.filter(t => t.tipo === filtroTipo.value);
  if (filtroArete.value) lista = lista.filter(t => t.arete === filtroArete.value);
  return lista;
});

const formatFecha = (f: string) =>
  new Date(f).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });

const fechaHoy = () => new Date().toISOString().split('T')[0];

const exportarPDF = async () => {
  exportando.value = 'pdf';
  try {
    const doc = new jsPDF();
    doc.setFillColor(0, 109, 55);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('BovWeight CR — Transacciones de Ganado', 14, 12);
    autoTable(doc, {
      startY: 24,
      head: [['Tipo', 'Arete', 'Contraparte', 'Peso (kg)', 'Precio/kg (₡)', 'Monto (₡)', 'Fecha']],
      body: transaccionesFiltradas.value.map(t => [
        t.tipo, t.arete, t.nombre_contraparte,
        t.peso_negociado, t.precio_por_kg.toLocaleString('es-CR'),
        t.monto_total.toLocaleString('es-CR'), formatFecha(t.fecha),
      ]),
      headStyles: { fillColor: [0, 109, 55] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });
    doc.save(`transacciones_${fechaHoy()}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarCSV = async () => {
  exportando.value = 'csv';
  try {
    const filas = transaccionesFiltradas.value.map(t => ({
      Tipo: t.tipo, Arete: t.arete, Animal: t.animal?.nombre || '',
      Contraparte: t.nombre_contraparte, Cédula: t.cedula_contraparte || '',
      'Peso Negociado (kg)': t.peso_negociado, 'Precio por kg (₡)': t.precio_por_kg,
      'Monto Total (₡)': t.monto_total, Fecha: formatFecha(t.fecha),
      Notas: t.notas || '',
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.writeFile(wb, `transacciones_${fechaHoy()}.xlsx`);
  } finally { exportando.value = ''; }
};

onMounted(async () => {
  cargando.value = true;
  try {
    const res = await transaccionService.getTransacciones();
    transacciones.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* silent */ }
  finally { cargando.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 12px; }

.top-row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
}

.export-row { display: flex; gap: 6px; }

.export-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  border: none; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s;
}
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.export-btn ion-icon { font-size: 15px; }
.export-btn.pdf { background: #fef2f2; color: #991b1b; }
.export-btn.csv-excel { background: #f0fdf4; color: #166534; }

.filtros-row {
  display: flex; gap: 10px; margin-bottom: 16px; align-items: flex-end;
}
.field-mini { min-width: 90px; }
.field-mini.flex-grow { flex: 1; }
.field-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.native-select {
  width: 100%; padding: 8px 10px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
}
.native-select:focus { outline: none; border-color: #006d37; }

.loading-box { display: flex; justify-content: center; padding: 40px 0; }
.empty-hint { text-align: center; color: #9ca3af; font-size: 14px; padding: 40px 0; }

.trans-list { display: flex; flex-direction: column; gap: 10px; }
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
