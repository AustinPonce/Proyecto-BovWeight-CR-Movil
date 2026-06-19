<template>
  <ion-page>

    <AppHeader title="Informes" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- Carga global -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando datos...</p>
        </div>

        <template v-else>

          <!-- ═══ REPORTE 1: BOVINOS ═══ -->
          <BaseCard>
            <div class="reporte-header">
              <div class="reporte-icon-box" style="background:#d1fae5">
                <ion-icon :icon="pawOutline" style="color:#006d37" />
              </div>
              <div>
                <h3 class="reporte-title">Inventario de Bovinos</h3>
                <p class="reporte-sub">{{ bovinos.length }} animales registrados</p>
              </div>
            </div>

            <div v-if="bovinos.length > 0" class="preview-tabla">
              <div class="tabla-row tabla-head">
                <span>Arete</span><span>Nombre</span><span>Raza</span><span>Estado</span>
              </div>
              <div
                v-for="b in bovinos.slice(0, 4)"
                :key="b.arete"
                class="tabla-row"
              >
                <span>{{ b.arete }}</span>
                <span>{{ b.nombre || '—' }}</span>
                <span>{{ b.raza?.nombre }}</span>
                <span :class="b.estado?.nombre === 'Activo' ? 'badge-verde' : 'badge-gris'">
                  {{ b.estado?.nombre }}
                </span>
              </div>
              <p v-if="bovinos.length > 4" class="mas-rows">
                + {{ bovinos.length - 4 }} más en el archivo
              </p>
            </div>
            <p v-else class="sin-datos">No hay bovinos registrados aún.</p>

            <div class="export-btns">
              <ion-button
                expand="block"
                color="danger"
                fill="outline"
                :disabled="bovinos.length === 0 || exportando === 'bovinos-pdf'"
                @click="exportarBovinosPDF"
              >
                <ion-icon slot="start" :icon="documentOutline" />
                {{ exportando === 'bovinos-pdf' ? 'Generando...' : 'Exportar PDF' }}
              </ion-button>
              <ion-button
                expand="block"
                color="success"
                fill="outline"
                :disabled="bovinos.length === 0 || exportando === 'bovinos-excel'"
                @click="exportarBovinosExcel"
              >
                <ion-icon slot="start" :icon="gridOutline" />
                {{ exportando === 'bovinos-excel' ? 'Generando...' : 'Exportar Excel' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- ═══ REPORTE 2: PESAJES ═══ -->
          <BaseCard class="mt">
            <div class="reporte-header">
              <div class="reporte-icon-box" style="background:#dbeafe">
                <ion-icon :icon="barChartOutline" style="color:#1d4ed8" />
              </div>
              <div>
                <h3 class="reporte-title">Historial de Pesajes</h3>
                <p class="reporte-sub">{{ pesajes.length }} registros de peso</p>
              </div>
            </div>

            <div v-if="pesajes.length > 0" class="preview-tabla">
              <div class="tabla-row tabla-head">
                <span>Arete</span><span>Peso (kg)</span><span>Fecha</span><span>Tipo</span>
              </div>
              <div
                v-for="p in pesajes.slice(0, 4)"
                :key="p.id"
                class="tabla-row"
              >
                <span>{{ p.arete }}</span>
                <span class="peso-val">{{ p.peso.toFixed(1) }}</span>
                <span>{{ formatFecha(p.fecha) }}</span>
                <span :class="p.tipo_pesaje_id === 1 ? 'badge-azul' : 'badge-morado'">
                  {{ p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto' }}
                </span>
              </div>
              <p v-if="pesajes.length > 4" class="mas-rows">
                + {{ pesajes.length - 4 }} más en el archivo
              </p>
            </div>
            <p v-else class="sin-datos">No hay pesajes registrados aún.</p>

            <div class="export-btns">
              <ion-button
                expand="block"
                color="danger"
                fill="outline"
                :disabled="pesajes.length === 0 || exportando === 'pesajes-pdf'"
                @click="exportarPesajesPDF"
              >
                <ion-icon slot="start" :icon="documentOutline" />
                {{ exportando === 'pesajes-pdf' ? 'Generando...' : 'Exportar PDF' }}
              </ion-button>
              <ion-button
                expand="block"
                color="success"
                fill="outline"
                :disabled="pesajes.length === 0 || exportando === 'pesajes-excel'"
                @click="exportarPesajesExcel"
              >
                <ion-icon slot="start" :icon="gridOutline" />
                {{ exportando === 'pesajes-excel' ? 'Generando...' : 'Exportar Excel' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- ═══ REPORTE 3: FINCAS ═══ -->
          <BaseCard class="mt">
            <div class="reporte-header">
              <div class="reporte-icon-box" style="background:#fef9c3">
                <ion-icon :icon="businessOutline" style="color:#854d0e" />
              </div>
              <div>
                <h3 class="reporte-title">Resumen de Fincas</h3>
                <p class="reporte-sub">{{ fincas.length }} fincas registradas</p>
              </div>
            </div>

            <div v-if="fincas.length > 0" class="preview-tabla">
              <div class="tabla-row tabla-head">
                <span>Nombre</span><span>Ubicación</span><span>Bovinos</span>
              </div>
              <div
                v-for="f in fincas"
                :key="f.id"
                class="tabla-row"
              >
                <span>{{ f.nombre }}</span>
                <span>{{ f.ubicacion }}</span>
                <span class="badge-verde">{{ f.animales_count ?? 0 }}</span>
              </div>
            </div>
            <p v-else class="sin-datos">No hay fincas registradas aún.</p>

            <div class="export-btns">
              <ion-button
                expand="block"
                color="danger"
                fill="outline"
                :disabled="fincas.length === 0 || exportando === 'fincas-pdf'"
                @click="exportarFincasPDF"
              >
                <ion-icon slot="start" :icon="documentOutline" />
                {{ exportando === 'fincas-pdf' ? 'Generando...' : 'Exportar PDF' }}
              </ion-button>
              <ion-button
                expand="block"
                color="success"
                fill="outline"
                :disabled="fincas.length === 0 || exportando === 'fincas-excel'"
                @click="exportarFincasExcel"
              >
                <ion-icon slot="start" :icon="gridOutline" />
                {{ exportando === 'fincas-excel' ? 'Generando...' : 'Exportar Excel' }}
              </ion-button>
            </div>
          </BaseCard>

        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonIcon, IonButton, IonSpinner
} from '@ionic/vue';
import {
  pawOutline, barChartOutline, businessOutline,
  documentOutline, gridOutline
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { cargarImagenBase64 } from '@/utils/exportHelpers';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService, type PesajeAPI } from '@/services/pesajeService';
import { fincaService, type FincaAPI } from '@/services/fincaService';

const cargando = ref(false);
const exportando = ref('');

const bovinos = ref<AnimalAPI[]>([]);
const pesajes = ref<PesajeAPI[]>([]);
const fincas = ref<FincaAPI[]>([]);

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─────────────────── CARGA DE DATOS ───────────────────
onMounted(async () => {
  cargando.value = true;
  try {
    const [bovRes, pesRes, fincaRes] = await Promise.all([
      bovinoService.getAnimales(),
      pesajeService.getPesajes(),
      fincaService.getFincas(),
    ]);
    bovinos.value = Array.isArray(bovRes) ? bovRes : (bovRes.data ?? []);
    pesajes.value = Array.isArray(pesRes) ? pesRes : (pesRes.data ?? []);
    fincas.value = Array.isArray(fincaRes) ? fincaRes : (fincaRes.data ?? []);
  } catch { /* sin datos */ }
  finally { cargando.value = false; }
});

// ─────────────────── DESCARGA HELPERS ───────────────────
const guardarPDF = async (doc: jsPDF, filename: string) => {
  if (Capacitor.isNativePlatform()) {
    const base64 = doc.output('datauristring').split(',')[1];
    await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Guardar PDF' });
  } else {
    doc.save(filename);
  }
};

const guardarExcel = async (wb: XLSX.WorkBook, filename: string) => {
  if (Capacitor.isNativePlatform()) {
    const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Guardar Excel' });
  } else {
    XLSX.writeFile(wb, filename);
  }
};

// ─────────────────── PDF HELPERS ───────────────────
const crearEncabezadoPDF = (doc: jsPDF, titulo: string) => {
  doc.setFillColor(0, 109, 55);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BovWeight CR', 14, 10);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 14, 17);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, 150, 17);
  doc.setTextColor(0, 0, 0);
};

// ─────────────────── EXPORTAR BOVINOS ───────────────────
const exportarBovinosPDF = async () => {
  exportando.value = 'bovinos-pdf';
  try {
    const doc = new jsPDF();
    crearEncabezadoPDF(doc, 'Inventario de Bovinos');
    autoTable(doc, {
      startY: 28,
      head: [['Arete', 'Nombre', 'Raza', 'Sexo', 'Estado', 'Finca', 'Último Peso (kg)']],
      body: bovinos.value.map(b => [
        b.arete,
        b.nombre ?? '—',
        b.raza?.nombre ?? '—',
        b.sexo?.nombre ?? '—',
        b.estado?.nombre ?? '—',
        b.finca?.nombre ?? '—',
        b.ultimo_peso ? b.ultimo_peso.peso.toFixed(1) : '—',
      ]),
      headStyles: { fillColor: [0, 109, 55], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 9 },
    });
    await guardarPDF(doc, `bovinos_${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarBovinosExcel = async () => {
  exportando.value = 'bovinos-excel';
  try {
    const datos = bovinos.value.map(b => ({
      Arete: b.arete,
      Nombre: b.nombre ?? '',
      Raza: b.raza?.nombre ?? '',
      Sexo: b.sexo?.nombre ?? '',
      Estado: b.estado?.nombre ?? '',
      Finca: b.finca?.nombre ?? '',
      'Último Peso (kg)': b.ultimo_peso ? b.ultimo_peso.peso : '',
      'Fecha Último Peso': b.ultimo_peso ? formatFecha(b.ultimo_peso.fecha) : '',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [14, 16, 14, 10, 12, 18, 16, 18].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, 'Bovinos');
    await guardarExcel(wb, `bovinos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } finally { exportando.value = ''; }
};

// ─────────────────── EXPORTAR PESAJES ───────────────────
const exportarPesajesPDF = async () => {
  exportando.value = 'pesajes-pdf';
  try {
    const doc = new jsPDF();
    crearEncabezadoPDF(doc, 'Historial de Pesajes');
    autoTable(doc, {
      startY: 28,
      head: [['Arete', 'Animal', 'Peso (kg)', 'Fecha', 'Tipo']],
      body: pesajes.value.map(p => [
        p.arete,
        p.animal?.nombre ?? '—',
        p.peso.toFixed(1),
        formatFecha(p.fecha),
        p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
      ]),
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      styles: { fontSize: 9 },
    });

    const pesajesFoto = pesajes.value.filter(p => p.imagen_url);
    if (pesajesFoto.length > 0) {
      doc.addPage();
      doc.setFillColor(29, 78, 216);
      doc.rect(0, 0, 210, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Fotografías de Pesajes IA', 14, 11);
      doc.setTextColor(0, 0, 0);

      const imgW = 88, imgH = 66;
      let x = 11, y = 22;

      for (const p of pesajesFoto) {
        const b64 = await cargarImagenBase64(p.imagen_url!);
        if (!b64) continue;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`Arete: ${p.arete}  —  ${formatFecha(p.fecha)}  —  ${p.peso.toFixed(1)} kg`, x, y);
        doc.addImage(b64, 'JPEG', x, y + 2, imgW, imgH);

        x += imgW + 12;
        if (x + imgW > 210) {
          x = 11;
          y += imgH + 12;
        }
        if (y + imgH + 12 > 280) {
          doc.addPage();
          y = 14;
          x = 11;
        }
      }
    }

    await guardarPDF(doc, `pesajes_${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarPesajesExcel = async () => {
  exportando.value = 'pesajes-excel';
  try {
    const datos = pesajes.value.map(p => ({
      Arete: p.arete,
      Animal: p.animal?.nombre ?? '',
      'Peso (kg)': p.peso,
      Fecha: formatFecha(p.fecha),
      Tipo: p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [14, 16, 12, 14, 12].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, 'Pesajes');
    await guardarExcel(wb, `pesajes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } finally { exportando.value = ''; }
};

// ─────────────────── EXPORTAR FINCAS ───────────────────
const exportarFincasPDF = async () => {
  exportando.value = 'fincas-pdf';
  try {
    const doc = new jsPDF();
    crearEncabezadoPDF(doc, 'Resumen de Fincas');
    autoTable(doc, {
      startY: 28,
      head: [['ID', 'Nombre', 'Ubicación', 'Bovinos registrados']],
      body: fincas.value.map(f => [
        f.id,
        f.nombre,
        f.ubicacion,
        f.animales_count ?? 0,
      ]),
      headStyles: { fillColor: [133, 77, 14], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      styles: { fontSize: 9 },
    });
    await guardarPDF(doc, `fincas_${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarFincasExcel = async () => {
  exportando.value = 'fincas-excel';
  try {
    const datos = fincas.value.map(f => ({
      ID: f.id,
      Nombre: f.nombre,
      Ubicación: f.ubicacion,
      'Bovinos registrados': f.animales_count ?? 0,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [8, 20, 24, 20].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, 'Fincas');
    await guardarExcel(wb, `fincas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } finally { exportando.value = ''; }
};
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 16px; }

.loading-box {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 50vh; color: #6b7280;
}

.reporte-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
}
.reporte-icon-box {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.reporte-title { margin: 0 0 2px; font-size: 15px; font-weight: 700; color: #111827; }
.reporte-sub { margin: 0; font-size: 12px; color: #6b7280; }

/* Vista previa de tabla */
.preview-tabla {
  border: 1px solid #e5e7eb; border-radius: 8px;
  overflow: hidden; margin-bottom: 12px; font-size: 12px;
}
.tabla-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  padding: 6px 10px; gap: 4px; align-items: center;
  border-bottom: 1px solid #f3f4f6;
}
.tabla-row:last-child { border-bottom: none; }
.tabla-head {
  background: #f9fafb; font-weight: 700;
  font-size: 11px; color: #374151; text-transform: uppercase;
}
.peso-val { font-weight: 700; color: #006d37; }
.mas-rows { text-align: center; font-size: 11px; color: #6b7280; margin: 6px 0 0; }

/* Badges */
.badge-verde {
  display: inline-block; background: #dcfce7; color: #166534;
  border-radius: 20px; padding: 1px 8px; font-size: 11px; font-weight: 600;
}
.badge-gris {
  display: inline-block; background: #f3f4f6; color: #6b7280;
  border-radius: 20px; padding: 1px 8px; font-size: 11px; font-weight: 600;
}
.badge-azul {
  display: inline-block; background: #dbeafe; color: #1e40af;
  border-radius: 20px; padding: 1px 8px; font-size: 11px; font-weight: 600;
}
.badge-morado {
  display: inline-block; background: #ede9fe; color: #5b21b6;
  border-radius: 20px; padding: 1px 8px; font-size: 11px; font-weight: 600;
}

.sin-datos { color: #9ca3af; font-size: 13px; text-align: center; margin: 12px 0; }

/* Botones de exportación */
.export-btns {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;
}
</style>
