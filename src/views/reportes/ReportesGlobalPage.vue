<template>
  <ion-page>
    <AppHeader title="Reportes Globales" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- Spinner global -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando datos...</p>
        </div>

        <template v-else>

          <!-- ─── Inventario Bovinos ──────────────────── -->
          <div class="section-header">
            <div class="section-dot green" />
            <h3>Inventario Bovinos ({{ bovinos.length }})</h3>
          </div>

          <div v-if="bovinos.length > 0">
            <div class="preview-table">
              <div class="table-row header-row">
                <span>Arete</span><span>Raza</span><span>Estado</span><span>Finca</span>
              </div>
              <div class="table-row" v-for="b in bovinos.slice(0, 5)" :key="b.arete">
                <span>{{ b.arete }}</span>
                <span>{{ b.raza?.nombre || '—' }}</span>
                <span>{{ b.estado?.nombre || '—' }}</span>
                <span>{{ b.finca?.nombre || '—' }}</span>
              </div>
              <p v-if="bovinos.length > 5" class="more-hint">... y {{ bovinos.length - 5 }} más</p>
            </div>
            <div class="export-row">
              <button class="export-btn pdf" @click="exportarPDF('bovinos')" :disabled="exportando !== ''">
                <ion-icon :icon="documentOutline" />
                {{ exportando === 'bovinos-pdf' ? 'Generando...' : 'PDF' }}
              </button>
              <button class="export-btn excel" @click="exportarExcel('bovinos')" :disabled="exportando !== ''">
                <ion-icon :icon="gridOutline" />
                {{ exportando === 'bovinos-excel' ? 'Generando...' : 'Excel' }}
              </button>
            </div>
          </div>
          <p v-else class="empty-msg">Sin bovinos registrados</p>

          <!-- ─── Historial Pesajes ──────────────────── -->
          <div class="section-header mt">
            <div class="section-dot blue" />
            <h3>Historial Pesajes ({{ pesajes.length }})</h3>
          </div>

          <div v-if="pesajes.length > 0">
            <div class="preview-table">
              <div class="table-row header-row">
                <span>Arete</span><span>Peso (kg)</span><span>Fecha</span><span>Método</span>
              </div>
              <div class="table-row" v-for="p in pesajes.slice(0, 5)" :key="p.id">
                <span>{{ p.arete }}</span>
                <span>{{ p.peso?.toFixed(1) }}</span>
                <span>{{ formatFecha(p.fecha_pesaje || p.created_at) }}</span>
                <span>{{ p.metodo || '—' }}</span>
              </div>
              <p v-if="pesajes.length > 5" class="more-hint">... y {{ pesajes.length - 5 }} más</p>
            </div>
            <div class="export-row">
              <button class="export-btn pdf" @click="exportarPDF('pesajes')" :disabled="exportando !== ''">
                <ion-icon :icon="documentOutline" />
                {{ exportando === 'pesajes-pdf' ? 'Generando...' : 'PDF' }}
              </button>
              <button class="export-btn excel" @click="exportarExcel('pesajes')" :disabled="exportando !== ''">
                <ion-icon :icon="gridOutline" />
                {{ exportando === 'pesajes-excel' ? 'Generando...' : 'Excel' }}
              </button>
            </div>
          </div>
          <p v-else class="empty-msg">Sin pesajes registrados</p>

        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import { documentOutline, gridOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import { bovinoService } from '@/services/bovinoService';
import { pesajeService } from '@/services/pesajeService';

const bovinos = ref<any[]>([]);
const pesajes = ref<any[]>([]);
const cargando = ref(false);
const exportando = ref('');

const fechaHoy = () => new Date().toISOString().split('T')[0];
const formatFecha = (f: string) => f ? f.split('T')[0] : '—';

onMounted(async () => {
  cargando.value = true;
  try {
    const [bRes, pRes] = await Promise.all([
      bovinoService.getAnimales(),
      pesajeService.getPesajes(),
    ]);
    bovinos.value = Array.isArray(bRes) ? bRes : (bRes.data ?? []);
    pesajes.value = Array.isArray(pRes) ? pRes : (pRes.data ?? []);
  } catch { /* silent */ }
  finally { cargando.value = false; }
});

const exportarPDF = async (tipo: string) => {
  exportando.value = `${tipo}-pdf`;
  try {
    const doc = new jsPDF();
    doc.setFillColor(0, 109, 55);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(`BovWeight CR — ${tipo === 'bovinos' ? 'Inventario Global de Bovinos' : 'Historial Global de Pesajes'}`, 14, 12);

    if (tipo === 'bovinos') {
      autoTable(doc, {
        startY: 24,
        head: [['Arete', 'Nombre', 'Raza', 'Sexo', 'Estado', 'Finca']],
        body: bovinos.value.map(b => [b.arete, b.nombre || '—', b.raza?.nombre || '—', b.sexo?.nombre || '—', b.estado?.nombre || '—', b.finca?.nombre || '—']),
        headStyles: { fillColor: [0, 109, 55] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });
    } else {
      autoTable(doc, {
        startY: 24,
        head: [['Arete', 'Peso (kg)', 'Fecha', 'Método']],
        body: pesajes.value.map(p => [p.arete, p.peso?.toFixed(1) ?? '—', formatFecha(p.fecha_pesaje || p.created_at), p.metodo || '—']),
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
      });
    }

    doc.save(`${tipo}_global_${fechaHoy()}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarExcel = async (tipo: string) => {
  exportando.value = `${tipo}-excel`;
  try {
    let filas: any[];
    let sheetName: string;

    if (tipo === 'bovinos') {
      filas = bovinos.value.map(b => ({
        Arete: b.arete, Nombre: b.nombre || '', Raza: b.raza?.nombre || '',
        Sexo: b.sexo?.nombre || '', Estado: b.estado?.nombre || '', Finca: b.finca?.nombre || '',
      }));
      sheetName = 'Bovinos';
    } else {
      filas = pesajes.value.map(p => ({
        Arete: p.arete, 'Peso (kg)': p.peso?.toFixed(1) ?? '',
        Fecha: formatFecha(p.fecha_pesaje || p.created_at), Método: p.metodo || '',
      }));
      sheetName = 'Pesajes';
    }

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${tipo}_global_${fechaHoy()}.xlsx`);
  } finally { exportando.value = ''; }
};
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #6b7280;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.section-header h3 { font-size: 16px; font-weight: 600; color: #374151; margin: 0; }
.section-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
}
.section-dot.green { background: #16a34a; }
.section-dot.blue { background: #2563eb; }
.mt { margin-top: 28px; }

.preview-table { background: #f9fafb; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  padding: 8px 12px;
  font-size: 12px;
  border-bottom: 1px solid #e5e7eb;
}
.header-row { background: #f3f4f6; font-weight: 600; color: #374151; }
.more-hint { text-align: center; font-size: 12px; color: #9ca3af; padding: 6px; margin: 0; }

.export-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.export-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.export-btn ion-icon { font-size: 16px; }
.export-btn.pdf { background: #fef2f2; color: #991b1b; }
.export-btn.excel { background: #f0fdf4; color: #166534; }

.empty-msg { color: #9ca3af; font-size: 14px; padding: 12px 0; }
</style>