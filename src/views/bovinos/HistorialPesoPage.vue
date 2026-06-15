<template>
  <ion-page>

    <AppHeader title="Historial de Peso" :show-back="true" default-href="/bovinos" />

    <ion-content>
      <div class="container">

        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando datos...</p>
        </div>

        <template v-else>

          <!-- Tarjeta del animal -->
          <BaseCard>
            <h2>{{ animal?.nombre || 'Sin nombre' }} <span class="arete">#{{ bovinoId }}</span></h2>
            <p class="subtitulo">
              {{ animal?.raza?.nombre }} · {{ animal?.sexo?.nombre }} · {{ animal?.finca?.nombre }}
            </p>

            <p class="label-peso">Último peso registrado</p>
            <h1 class="peso-actual">
              {{ ultimoPeso ? `${ultimoPeso.toFixed(1)} kg` : '-- kg' }}
            </h1>

            <!-- Registrar pesaje: solo Admin y Ganadero (vet bloqueado en backend) -->
            <ion-button v-if="puedeCrear" color="success" expand="block" @click="abrirFormularioPeso">
              <ion-icon slot="start" :icon="addCircleOutline" />
              Registrar Nuevo Peso
            </ion-button>

            <!-- Gestión del animal: solo Admin y Ganadero -->
            <div v-if="puedeEditar" class="gestion-btns">
              <ion-button fill="outline" color="success" size="small" @click="abrirFormEditar">
                <ion-icon slot="start" :icon="createOutline" />
                Editar
              </ion-button>
              <ion-button fill="outline" color="danger" size="small" @click="confirmarEliminarAnimal">
                <ion-icon slot="start" :icon="trashOutline" />
                Eliminar
              </ion-button>
            </div>
          </BaseCard>

          <!-- Formulario: registrar nuevo peso -->
          <BaseCard v-if="mostrarFormPeso && puedeCrear" class="mt form-card">
            <h3>Medidas del Animal</h3>
            <p class="hint">Fórmula: (torax² × largo) / 10840</p>

            <BaseInput v-model="formPeso.largo_cuerpo" label="Largo del cuerpo (cm)"
              type="number" placeholder="Ej: 165" />
            <BaseInput v-model="formPeso.altura" label="Altura (cm)"
              type="number" placeholder="Ej: 145" />
            <BaseInput v-model="formPeso.perimetro_toracico" label="Perímetro torácico (cm)"
              type="number" placeholder="Ej: 210" />

            <div v-if="errorPeso" class="error-msg">{{ errorPeso }}</div>

            <div class="btn-row">
              <ion-button fill="outline" color="medium" @click="mostrarFormPeso = false">Cancelar</ion-button>
              <ion-button color="success" @click="guardarPeso" :disabled="guardandoPeso">
                {{ guardandoPeso ? 'Guardando...' : 'Guardar' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- Formulario: editar animal -->
          <BaseCard v-if="mostrarFormEditar && puedeEditar" class="mt form-card">
            <h3>Editar Animal</h3>

            <BaseInput v-model="formEditar.nombre" label="Nombre (opcional)" placeholder="Ej: Valentina" />

            <ion-item class="select-item">
              <ion-label>Raza *</ion-label>
              <ion-select v-model="formEditar.id_raza" interface="action-sheet" placeholder="Seleccionar">
                <ion-select-option v-for="r in RAZAS" :key="r.id" :value="r.id">{{ r.nombre }}</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="select-item">
              <ion-label>Sexo *</ion-label>
              <ion-select v-model="formEditar.id_sexo" interface="action-sheet" placeholder="Seleccionar">
                <ion-select-option v-for="s in SEXOS" :key="s.id" :value="s.id">{{ s.nombre }}</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="select-item">
              <ion-label>Estado *</ion-label>
              <ion-select v-model="formEditar.id_estado" interface="action-sheet" placeholder="Seleccionar">
                <ion-select-option v-for="e in ESTADOS" :key="e.id" :value="e.id">{{ e.nombre }}</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="select-item">
              <ion-label>Finca *</ion-label>
              <ion-select v-model="formEditar.id_finca" interface="action-sheet" placeholder="Seleccionar">
                <ion-select-option v-for="f in fincasDisponibles" :key="f.id" :value="f.id">{{ f.nombre }}</ion-select-option>
              </ion-select>
            </ion-item>

            <div v-if="errorEditar" class="error-msg">{{ errorEditar }}</div>
            <div v-if="exitoEditar" class="exito-msg">Animal actualizado correctamente.</div>

            <div class="btn-row">
              <ion-button fill="outline" color="medium" @click="mostrarFormEditar = false">Cancelar</ion-button>
              <ion-button color="success" @click="guardarEdicion" :disabled="guardandoEdicion">
                {{ guardandoEdicion ? 'Guardando...' : 'Guardar cambios' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- Historial de pesajes -->
          <div class="hist-header mt">
            <h3>Historial de Pesajes</h3>
            <div v-if="historial.length > 0" class="export-row">
              <ion-button
                fill="outline"
                color="danger"
                size="small"
                :disabled="exportando === 'pdf'"
                @click="exportarPDF"
              >
                <ion-icon slot="start" :icon="documentOutline" />
                {{ exportando === 'pdf' ? '...' : 'PDF' }}
              </ion-button>
              <ion-button
                fill="outline"
                color="success"
                size="small"
                :disabled="exportando === 'excel'"
                @click="exportarExcel"
              >
                <ion-icon slot="start" :icon="gridOutline" />
                {{ exportando === 'excel' ? '...' : 'Excel' }}
              </ion-button>
            </div>
          </div>

          <BaseCard v-if="historial.length === 0" class="empty-hist">
            <p>No hay registros de peso aún.</p>
          </BaseCard>

          <ion-list v-else>
            <ion-item v-for="(registro, i) in historial" :key="registro.id">
              <ion-label>
                <h2>{{ formatFecha(registro.fecha) }}</h2>
                <p>{{ registro.peso.toFixed(1) }} kg
                  <span v-if="registro.imagen_url"> · 📷 Con foto</span>
                </p>
              </ion-label>
              <ion-badge slot="end" :color="colorDiff(registro.peso, i)">
                {{ textosDiff(registro.peso, i) }}
              </ion-badge>
              <!-- Eliminar pesaje: solo Admin y Ganadero -->
              <ion-button
                v-if="puedeEditar"
                slot="end"
                fill="clear"
                color="danger"
                size="small"
                @click="confirmarEliminarPesaje(registro.id)"
              >
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </ion-item>
          </ion-list>

        </template>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonButton,
  IonBadge, IonSpinner, IonIcon, IonSelect, IonSelectOption,
  alertController, useIonRouter
} from '@ionic/vue';
import { addCircleOutline, createOutline, trashOutline, documentOutline, gridOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService, type PesajeAPI } from '@/services/pesajeService';
import { fincaService } from '@/services/fincaService';
import { RAZAS, SEXOS, ESTADOS } from '@/services/catalogos';
import { useRol } from '@/composables/useRol';

const route = useRoute();
const router = useIonRouter();
const { puedeEditar, puedeCrear } = useRol();

const bovinoId = computed(() => route.params.id as string);

const animal = ref<AnimalAPI | null>(null);
const historial = ref<PesajeAPI[]>([]);
const cargando = ref(false);
const fincasDisponibles = ref<{ id: number; nombre: string }[]>([]);

const ultimoPeso = computed(() =>
  historial.value.length > 0 ? historial.value[0].peso : null
);

// ── Registrar nuevo pesaje ───────────────────────────────────────────────────
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

// ── Editar animal ────────────────────────────────────────────────────────────
const mostrarFormEditar = ref(false);
const guardandoEdicion = ref(false);
const errorEditar = ref('');
const exitoEditar = ref(false);
const formEditar = reactive({
  nombre: '',
  id_raza: 0,
  id_sexo: 0,
  id_estado: 0,
  id_finca: 0,
});

const abrirFormEditar = () => {
  formEditar.nombre = animal.value?.nombre ?? '';
  formEditar.id_raza = animal.value?.raza?.id ?? 0;
  formEditar.id_sexo = animal.value?.sexo?.id ?? 0;
  formEditar.id_estado = animal.value?.estado?.id ?? 0;
  formEditar.id_finca = animal.value?.finca?.id ?? 0;
  errorEditar.value = '';
  exitoEditar.value = false;
  mostrarFormEditar.value = true;
};

const guardarEdicion = async () => {
  errorEditar.value = '';
  exitoEditar.value = false;
  if (!formEditar.id_raza || !formEditar.id_sexo || !formEditar.id_estado || !formEditar.id_finca) {
    errorEditar.value = 'Completa todos los campos obligatorios';
    return;
  }
  guardandoEdicion.value = true;
  try {
    const res = await bovinoService.actualizarAnimal(bovinoId.value, {
      nombre: formEditar.nombre || null,
      id_raza: formEditar.id_raza,
      id_sexo: formEditar.id_sexo,
      id_estado: formEditar.id_estado,
      id_finca: formEditar.id_finca,
    });
    animal.value = res.data;
    exitoEditar.value = true;
    setTimeout(() => { mostrarFormEditar.value = false; }, 1500);
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    errorEditar.value = errors
      ? Object.values(errors).flat().join(' ')
      : e.response?.data?.message || 'Error al actualizar el animal';
  } finally {
    guardandoEdicion.value = false;
  }
};

// ── Eliminar animal ──────────────────────────────────────────────────────────
const confirmarEliminarAnimal = async () => {
  const alert = await alertController.create({
    header: 'Eliminar Animal',
    message: `¿Eliminar el animal #${bovinoId.value}? Esta acción no se puede deshacer.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        cssClass: 'btn-danger',
        handler: async () => {
          try {
            await bovinoService.eliminarAnimal(bovinoId.value);
            router.navigate('/bovinos', 'back');
          } catch (e: any) {
            const msg = e.response?.data?.message || 'Error al eliminar';
            const err = await alertController.create({
              header: 'Error', message: msg,
              buttons: ['OK']
            });
            await err.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

// ── Eliminar pesaje ──────────────────────────────────────────────────────────
const confirmarEliminarPesaje = async (id: number) => {
  const alert = await alertController.create({
    header: 'Eliminar Pesaje',
    message: '¿Eliminar este registro de peso? Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await pesajeService.eliminarPesaje(id);
            historial.value = historial.value.filter(p => p.id !== id);
          } catch (e: any) {
            const msg = e.response?.data?.message || 'Error al eliminar pesaje';
            const err = await alertController.create({
              header: 'Error', message: msg,
              buttons: ['OK']
            });
            await err.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

// ── Helpers de historial ─────────────────────────────────────────────────────
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

// ── Exportación ─────────────────────────────────────────────────────────────
const exportando = ref('');
const fechaHoy = () => new Date().toISOString().slice(0, 10);

const exportarPDF = async () => {
  exportando.value = 'pdf';
  try {
    const arete = bovinoId.value;
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(0, 109, 55);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BovWeight CR', 14, 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Historial de Peso — Arete #${arete}`, 14, 17);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Generado: ${fechaHoy()}`, 150, 17);

    // Info del animal
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const a = animal.value;
    doc.text(`Animal: ${a?.nombre || 'Sin nombre'}   Raza: ${a?.raza?.nombre || '—'}   Sexo: ${a?.sexo?.nombre || '—'}`, 14, 30);
    doc.text(`Estado: ${a?.estado?.nombre || '—'}   Finca: ${a?.finca?.nombre || '—'}   Último peso: ${ultimoPeso.value?.toFixed(1) ?? '—'} kg`, 14, 36);

    // Tabla de pesajes
    autoTable(doc, {
      startY: 42,
      head: [['#', 'Fecha', 'Peso (kg)', 'Diferencia', 'Tipo']],
      body: historial.value.map((p, i) => [
        historial.value.length - i,
        formatFecha(p.fecha),
        p.peso.toFixed(1),
        textosDiff(p.peso, i),
        p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
      ]),
      headStyles: { fillColor: [0, 109, 55], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 9 },
    });

    doc.save(`Historial_${arete}_${fechaHoy()}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarExcel = async () => {
  exportando.value = 'excel';
  try {
    const arete = bovinoId.value;
    const datos = historial.value.map((p, i) => ({
      '#': historial.value.length - i,
      Fecha: formatFecha(p.fecha),
      'Peso (kg)': p.peso,
      Diferencia: textosDiff(p.peso, i),
      Tipo: p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [6, 14, 12, 14, 12].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, `Arete ${arete}`);
    XLSX.writeFile(wb, `Historial_${arete}_${fechaHoy()}.xlsx`);
  } finally { exportando.value = ''; }
};

// ── Carga inicial ────────────────────────────────────────────────────────────
onMounted(async () => {
  cargando.value = true;
  try {
    const [animalRes, pesajesRes, fincasRes] = await Promise.all([
      bovinoService.getAnimal(bovinoId.value),
      pesajeService.getPesajes({ animal: bovinoId.value }),
      fincaService.getFincas(),
    ]);
    animal.value = animalRes.data;
    historial.value = pesajesRes.data;
    fincasDisponibles.value = fincasRes.data.map(f => ({ id: f.id, nombre: f.nombre }));
  } catch { /* mostrar vacío */ }
  finally { cargando.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.hist-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 8px;
}
.hist-header h3 { margin: 0; }
.export-row { display: flex; gap: 6px; }

.loading-box {
  display: flex; flex-direction: column;
  align-items: center; padding: 60px 0; color: #6b7280;
}

.arete { color: #6b7280; font-size: 16px; font-weight: normal; }
.subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
.label-peso { color: #6b7280; margin: 0; font-size: 13px; }

.peso-actual {
  color: #006d37; font-size: 42px;
  font-weight: bold; margin: 4px 0 16px;
}

.gestion-btns {
  display: flex; gap: 8px; margin-top: 10px;
}
.gestion-btns ion-button { flex: 1; }

.mt { margin-top: 16px; }

.form-card { border: 2px dashed #86efac; }

.select-item {
  --background: #ffffff;
  --border-color: #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.hint { color: #6b7280; font-size: 12px; margin-bottom: 8px; }

.btn-row { display: flex; gap: 8px; margin-top: 12px; }
.btn-row ion-button { flex: 1; }

.error-msg {
  color: #991b1b; background: #fee2e2;
  border-radius: 8px; padding: 8px 12px;
  font-size: 13px; margin: 8px 0;
}

.exito-msg {
  color: #166534; background: #dcfce7;
  border-radius: 8px; padding: 8px 12px;
  font-size: 13px; margin: 8px 0;
}

.empty-hist { color: #6b7280; text-align: center; padding: 20px; }
</style>
