<template>
  <ion-page>

    <AppHeader title="Mis Bovinos" :show-back="true" default-href="/dashboard" />

    <ion-content>

      <div class="container">

        <!-- Búsqueda y filtros -->
        <div class="search-filter-row">
          <BaseInput v-model="buscar" placeholder="Buscar por arete o nombre..." />
          <select v-model="filtroEstado" class="estado-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Vendido">Vendido</option>
            <option value="Fallecido">Fallecido</option>
          </select>
        </div>

        <!-- Botones de exportación -->
        <div v-if="bovinos.length > 0" class="export-row">
          <button class="export-btn pdf" @click="exportarPDF" :disabled="exportando !== ''">
            <ion-icon :icon="documentOutline" />
            {{ exportando === 'pdf' ? 'Generando...' : 'PDF' }}
          </button>
          <button class="export-btn csv" @click="exportarCSV" :disabled="exportando !== ''">
            <ion-icon :icon="documentTextOutline" />
            {{ exportando === 'csv' ? 'Generando...' : 'CSV' }}
          </button>
          <button class="export-btn excel" @click="exportarExcel" :disabled="exportando !== ''">
            <ion-icon :icon="gridOutline" />
            {{ exportando === 'excel' ? 'Generando...' : 'Excel' }}
          </button>
        </div>

        <!-- Estado de carga -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando bovinos...</p>
        </div>

        <!-- Error de carga -->
        <BaseCard v-else-if="errorCarga" class="empty-card">
          <ion-icon :icon="alertCircleOutline" class="empty-icon" style="color: #ef4444;" />
          <h2>Error al cargar</h2>
          <p>{{ errorCarga }}</p>
          <BaseButton @click="cargarBovinos">Reintentar</BaseButton>
        </BaseCard>

        <!-- Sin bovinos -->
        <BaseCard v-else-if="bovinos.length === 0" class="empty-card">
          <ion-icon :icon="leafOutline" class="empty-icon" />
          <h2>Sin registros aún</h2>
          <p>No hay ganado registrado en tu inventario.</p>
          <BaseButton v-if="puedeCrear" @click="router.push('/bovinos/registrar-manual')">
            Agregar Bovino
          </BaseButton>
        </BaseCard>

        <!-- Listado -->
        <ion-list v-else>
          <ion-item
            v-for="bovino in bovinosFiltrados"
            :key="bovino.arete"
            button
            @click="router.push(`/bovinos/detalle/${bovino.arete}`)"
          >
            <ion-avatar slot="start" class="avatar-placeholder">
              <ion-icon :icon="pawOutline" />
            </ion-avatar>
            <ion-label>
              <h2>{{ bovino.arete }} — {{ bovino.nombre || 'Sin nombre' }}</h2>
              <p>{{ bovino.raza?.nombre }} | {{ bovino.finca?.nombre }}</p>
              <p v-if="bovino.ultimo_peso">
                Último peso: <strong>{{ bovino.ultimo_peso.peso.toFixed(1) }} kg</strong>
              </p>
            </ion-label>
            <ion-badge
              slot="end"
              :color="bovino.estado?.nombre === 'Activo' ? 'success' : 'warning'"
            >
              {{ bovino.estado?.nombre }}
            </ion-badge>
          </ion-item>
        </ion-list>

        <!-- Estadísticas -->
        <div v-if="bovinos.length > 0" class="stats">
          <StatCard title="ACTIVOS" :value="totalActivos.toString()" />
          <StatCard title="OTROS" :value="totalOtros.toString()" />
        </div>

      </div>

    </ion-content>

    <!-- FAB solo para Admin y Ganadero -->
    <ion-fab v-if="puedeCrear" vertical="bottom" horizontal="end" slot="fixed" style="margin-bottom: 70px">
      <ion-fab-button color="success" @click="router.push('/bovinos/registrar-manual')">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonContent, IonIcon, IonList, IonItem,
  IonLabel, IonAvatar, IonBadge, IonSpinner,
  IonFab, IonFabButton, useIonRouter
} from '@ionic/vue';
import {
  leafOutline, pawOutline, addOutline, alertCircleOutline,
  documentOutline, documentTextOutline, gridOutline
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { guardarPDF, guardarExcel } from '@/utils/exportHelpers';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import StatCard from '@/components/StatCard.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { useRol } from '@/composables/useRol';

const router = useIonRouter();
const { puedeCrear } = useRol();

const buscar = ref('');
const filtroEstado = ref('');
const bovinos = ref<AnimalAPI[]>([]);
const cargando = ref(false);
const errorCarga = ref('');
const exportando = ref('');

const bovinosFiltrados = computed(() => {
  let lista = bovinos.value;
  const q = buscar.value.toLowerCase();
  if (q) {
    lista = lista.filter(b =>
      b.arete.toLowerCase().includes(q) ||
      (b.nombre ?? '').toLowerCase().includes(q)
    );
  }
  if (filtroEstado.value) {
    lista = lista.filter(b => b.estado?.nombre === filtroEstado.value);
  }
  return lista;
});

const totalActivos = computed(() =>
  bovinos.value.filter(b => b.estado?.nombre === 'Activo').length
);
const totalOtros = computed(() =>
  bovinos.value.filter(b => b.estado?.nombre !== 'Activo').length
);

const fechaHoy = () => new Date().toISOString().split('T')[0];

const exportarPDF = async () => {
  exportando.value = 'pdf';
  try {
    const doc = new jsPDF();
    doc.setFillColor(0, 109, 55);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('BovWeight CR — Inventario de Bovinos', 14, 12);

    autoTable(doc, {
      startY: 24,
      head: [['Arete', 'Nombre', 'Raza', 'Sexo', 'Estado', 'Finca', 'Último Peso (kg)']],
      body: bovinos.value.map(b => [
        b.arete,
        b.nombre || '—',
        b.raza?.nombre || '—',
        b.sexo?.nombre || '—',
        b.estado?.nombre || '—',
        b.finca?.nombre || '—',
        b.ultimo_peso ? b.ultimo_peso.peso.toFixed(1) : '—',
      ]),
      headStyles: { fillColor: [0, 109, 55] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    await guardarPDF(doc, `bovinos_${fechaHoy()}.pdf`);
  } finally {
    exportando.value = '';
  }
};

const exportarCSV = async () => {
  exportando.value = 'csv';
  try {
    const rows = [
      ['Arete', 'Nombre', 'Raza', 'Sexo', 'Estado', 'Finca', 'Último Peso (kg)'],
      ...bovinos.value.map(b => [
        b.arete, b.nombre || '', b.raza?.nombre || '', b.sexo?.nombre || '',
        b.estado?.nombre || '', b.finca?.nombre || '',
        b.ultimo_peso ? b.ultimo_peso.peso.toFixed(1) : '',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bovinos_${fechaHoy()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    exportando.value = '';
  }
};

const exportarExcel = async () => {
  exportando.value = 'excel';
  try {
    const filas = bovinos.value.map(b => ({
      Arete: b.arete,
      Nombre: b.nombre || '',
      Raza: b.raza?.nombre || '',
      Sexo: b.sexo?.nombre || '',
      Estado: b.estado?.nombre || '',
      Finca: b.finca?.nombre || '',
      'Último Peso (kg)': b.ultimo_peso ? b.ultimo_peso.peso.toFixed(1) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(filas);
    ws['!cols'] = [14, 18, 14, 10, 12, 18, 16].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bovinos');
    await guardarExcel(wb, `bovinos_${fechaHoy()}.xlsx`);
  } finally {
    exportando.value = '';
  }
};

const cargarBovinos = async () => {
  cargando.value = true;
  errorCarga.value = '';
  try {
    const res = await bovinoService.getAnimales();
    bovinos.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e: any) {
    errorCarga.value = e.response?.data?.message || 'No se pudieron cargar los bovinos. Verifica tu conexión.';
    bovinos.value = [];
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  await cargarBovinos();
});
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 100px;
}
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #6b7280;
}
.empty-card {
  text-align: center;
  margin-top: 24px;
}
.empty-icon {
  font-size: 72px;
  color: #9ca3af;
  display: block;
  margin-bottom: 16px;
}
.avatar-placeholder {
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #006d37;
}
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.search-filter-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.estado-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  margin-bottom: 4px;
}

.export-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin: 8px 0 4px;
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
  transition: opacity 0.2s;
}
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.export-btn ion-icon { font-size: 16px; }
.export-btn.pdf { background: #fef2f2; color: #991b1b; }
.export-btn.csv { background: #eff6ff; color: #1d4ed8; }
.export-btn.excel { background: #f0fdf4; color: #166534; }
</style>