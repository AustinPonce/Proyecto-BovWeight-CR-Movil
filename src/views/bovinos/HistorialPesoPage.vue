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

          <!-- ─── Tarjeta del animal ──────────────────────────────── -->
          <BaseCard>
            <h2>{{ animal?.nombre || 'Sin nombre' }} <span class="arete">#{{ bovinoId }}</span></h2>
            <p class="subtitulo">
              {{ animal?.raza?.nombre }} · {{ animal?.sexo?.nombre }} · {{ animal?.finca?.nombre }}
            </p>

            <p class="label-peso">Último peso registrado</p>
            <h1 class="peso-actual">
              {{ ultimoPeso ? `${ultimoPeso.toFixed(1)} kg` : '-- kg' }}
            </h1>

            <ion-button v-if="puedeCrear" color="success" expand="block" @click="abrirFormularioPeso">
              <ion-icon slot="start" :icon="addCircleOutline" />
              Registrar Nuevo Peso
            </ion-button>

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

          <!-- ─── Formulario: registrar nuevo peso ───────────────── -->
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

          <!-- ─── Formulario: editar animal ──────────────────────── -->
          <BaseCard v-if="mostrarFormEditar && puedeEditar" class="mt form-card">
            <h3>Editar Animal</h3>
            <BaseInput v-model="formEditar.nombre" label="Nombre (opcional)" placeholder="Ej: Valentina" />

            <ion-item class="select-item">
              <ion-label>Raza *</ion-label>
              <ion-select v-model="formEditar.id_raza" interface="action-sheet" placeholder="Seleccionar">
                <ion-select-option v-for="r in razasDisponibles" :key="r.id" :value="r.id">{{ r.nombre }}</ion-select-option>
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
                <ion-select-option v-for="e in estadosDisponibles" :key="e.id" :value="e.id">{{ e.nombre }}</ion-select-option>
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

          <!-- ─── Historial de pesajes ────────────────────────────── -->
          <div class="hist-header mt">
            <h3>Historial de Pesajes</h3>
            <div v-if="historial.length > 0" class="export-row">
              <ion-button fill="outline" color="danger" size="small"
                :disabled="exportando === 'pdf'" @click="exportarPDF">
                <ion-icon slot="start" :icon="documentOutline" />
                {{ exportando === 'pdf' ? '...' : 'PDF' }}
              </ion-button>
              <ion-button fill="outline" color="success" size="small"
                :disabled="exportando === 'excel'" @click="exportarExcel">
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
                <p>
                  {{ pesoBruto(registro).toFixed(1) }} kg
                  <span v-if="registro.peso_corregido != null && registro.peso_original != null"
                        class="peso-original-hint">
                    · orig: {{ registro.peso_original.toFixed(0) }} kg
                  </span>
                  <span v-if="registro.factor_raza != null && registro.factor_raza !== 1"
                        class="factor-hint">
                    × {{ registro.factor_raza }}
                  </span>
                  <span v-if="registro.imagen_url"> · 📷</span>
                </p>
              </ion-label>
              <ion-badge slot="end" :color="colorDiff(pesoBruto(registro), i)">
                {{ textosDiff(pesoBruto(registro), i) }}
              </ion-badge>
              <ion-button v-if="puedeEditar" slot="end" fill="clear" color="danger" size="small"
                @click="confirmarEliminarPesaje(registro.id)">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </ion-item>
          </ion-list>

          <!-- ─── Recordatorios de Re-pesaje ─────────────────────── -->
          <div class="hist-header mt">
            <h3>Recordatorios de Re-pesaje</h3>
            <button v-if="puedeEditar" class="add-rec-btn" @click="mostrarFormRec = !mostrarFormRec">
              <ion-icon :icon="alarmOutline" />
              Agregar
            </button>
          </div>

          <BaseCard v-if="mostrarFormRec && puedeEditar" class="form-card">
            <ion-item class="select-item">
              <ion-label>Frecuencia *</ion-label>
              <ion-select v-model="formRec.frecuencia" interface="action-sheet">
                <ion-select-option value="semanal">Semanal</ion-select-option>
                <ion-select-option value="quincenal">Quincenal</ion-select-option>
                <ion-select-option value="mensual">Mensual</ion-select-option>
                <ion-select-option value="trimestral">Trimestral</ion-select-option>
              </ion-select>
            </ion-item>
            <BaseInput v-model="formRec.fecha_inicio" label="Fecha de inicio *" type="date" />
            <div v-if="errorRec" class="error-msg">{{ errorRec }}</div>
            <div class="btn-row">
              <ion-button fill="outline" color="medium" @click="mostrarFormRec = false">Cancelar</ion-button>
              <ion-button color="success" @click="guardarRec" :disabled="guardandoRec">
                {{ guardandoRec ? 'Guardando...' : 'Guardar' }}
              </ion-button>
            </div>
          </BaseCard>

          <div v-if="cargandoRec" class="loading-box-sm">
            <ion-spinner name="crescent" color="success" />
          </div>

          <BaseCard v-else-if="recordatorios.length === 0" class="empty-hist">
            <p>Sin recordatorios configurados para este animal.</p>
          </BaseCard>

          <ion-list v-else>
            <ion-item v-for="r in recordatorios" :key="r.id_recordatorio">
              <ion-icon slot="start" :icon="alarmOutline" color="success" />
              <ion-label>
                <h2>{{ capitalize(r.frecuencia) }}</h2>
                <p>Desde: {{ formatFecha(r.fecha_inicio) }}</p>
              </ion-label>
              <ion-button v-if="puedeEditar" slot="end" fill="clear" color="danger" size="small"
                @click="confirmarEliminarRec(r.id_recordatorio)">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </ion-item>
          </ion-list>

          <!-- ─── Comentarios Veterinario ───────────────────────── -->
          <div class="hist-header mt">
            <h3>Comentarios Veterinario</h3>
          </div>

          <div v-if="cargandoComentarios" class="loading-box-sm">
            <ion-spinner name="crescent" color="success" />
          </div>

          <BaseCard v-else-if="comentarios.length === 0" class="empty-hist">
            <p>Sin comentarios veterinarios para este animal.</p>
          </BaseCard>

          <template v-else>
            <div class="comentario-card" v-for="c in comentarios" :key="c.id_comentario">
              <div class="com-header">
                <ion-icon :icon="medkitOutline" class="com-icon" />
                <span class="com-vet">{{ c.veterinario || 'Veterinario' }}</span>
                <span class="com-fecha">{{ formatFecha(c.fecha) }}</span>
              </div>
              <p class="com-texto">{{ c.comentario }}</p>
            </div>
          </template>

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
import {
  addCircleOutline, createOutline, trashOutline,
  documentOutline, gridOutline, alarmOutline,
  chatbubbleOutline, medkitOutline
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { guardarPDF, guardarExcel, cargarImagenBase64 } from '@/utils/exportHelpers';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';
import { pesajeService, type PesajeAPI } from '@/services/pesajeService';
import { fincaService } from '@/services/fincaService';
import { razaService } from '@/services/razaService';
import { estadoService } from '@/services/estadoService';
import { recordatorioService, type RecordatorioAPI } from '@/services/recordatorioService';
import { comentarioService, type ComentarioAPI } from '@/services/comentarioService';
import { SEXOS } from '@/services/catalogos';
import { useRol } from '@/composables/useRol';

const route = useRoute();
const router = useIonRouter();
const { puedeEditar, puedeCrear } = useRol();

const bovinoId = computed(() => route.params.id as string);

const animal    = ref<AnimalAPI | null>(null);
const historial = ref<PesajeAPI[]>([]);
const cargando  = ref(false);

const fincasDisponibles  = ref<{ id: number; nombre: string }[]>([]);
const razasDisponibles   = ref<{ id: number; nombre: string }[]>([]);
const estadosDisponibles = ref<{ id: number; nombre: string }[]>([]);

// Devuelve el peso corregido si existe, si no el peso base
const pesoBruto = (r: PesajeAPI) => r.peso_corregido ?? r.peso;

const ultimoPeso = computed(() =>
  historial.value.length > 0 ? pesoBruto(historial.value[0]) : null
);

// ── Registrar nuevo pesaje ────────────────────────────────────────────
const mostrarFormPeso = ref(false);
const guardandoPeso   = ref(false);
const errorPeso       = ref('');
const formPeso        = ref({ largo_cuerpo: '', altura: '', perimetro_toracico: '' });

const abrirFormularioPeso = () => {
  mostrarFormPeso.value = true;
  errorPeso.value = '';
  formPeso.value = { largo_cuerpo: '', altura: '', perimetro_toracico: '' };
};

const guardarPeso = async () => {
  errorPeso.value = '';
  const largo    = parseFloat(formPeso.value.largo_cuerpo);
  const altura   = parseFloat(formPeso.value.altura);
  const perimetro = parseFloat(formPeso.value.perimetro_toracico);
  if (!largo || !altura || !perimetro) {
    errorPeso.value = 'Completa todos los campos';
    return;
  }
  guardandoPeso.value = true;
  try {
    const res = await pesajeService.crearPesajeManual({
      arete: bovinoId.value, largo_cuerpo: largo, altura, perimetro_toracico: perimetro,
    });
    historial.value.unshift(res.data);
    mostrarFormPeso.value = false;
  } catch (e: any) {
    errorPeso.value = e.response?.data?.message || 'Error al guardar peso';
  } finally {
    guardandoPeso.value = false;
  }
};

// ── Editar animal ─────────────────────────────────────────────────────
const mostrarFormEditar  = ref(false);
const guardandoEdicion   = ref(false);
const errorEditar        = ref('');
const exitoEditar        = ref(false);
const formEditar = reactive({ nombre: '', id_raza: 0, id_sexo: 0, id_estado: 0, id_finca: 0 });

const abrirFormEditar = () => {
  formEditar.nombre   = animal.value?.nombre ?? '';
  formEditar.id_raza  = animal.value?.raza?.id ?? 0;
  formEditar.id_sexo  = animal.value?.sexo?.id ?? 0;
  formEditar.id_estado = animal.value?.estado?.id ?? 0;
  formEditar.id_finca = animal.value?.finca?.id ?? 0;
  errorEditar.value   = '';
  exitoEditar.value   = false;
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

// ── Eliminar animal ───────────────────────────────────────────────────
const confirmarEliminarAnimal = async () => {
  const alert = await alertController.create({
    header: 'Eliminar Animal',
    message: `¿Eliminar el animal #${bovinoId.value}? Esta acción no se puede deshacer.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar', role: 'destructive',
        handler: async () => {
          try {
            await bovinoService.eliminarAnimal(bovinoId.value);
            router.navigate('/bovinos', 'back');
          } catch (e: any) {
            const msg = e.response?.data?.message || 'Error al eliminar';
            const err = await alertController.create({ header: 'Error', message: msg, buttons: ['OK'] });
            await err.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

// ── Eliminar pesaje ───────────────────────────────────────────────────
const confirmarEliminarPesaje = async (id: number) => {
  const alert = await alertController.create({
    header: 'Eliminar Pesaje',
    message: '¿Eliminar este registro de peso? Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar', role: 'destructive',
        handler: async () => {
          try {
            await pesajeService.eliminarPesaje(id);
            historial.value = historial.value.filter(p => p.id !== id);
          } catch (e: any) {
            const msg = e.response?.data?.message || 'Error al eliminar pesaje';
            const err = await alertController.create({ header: 'Error', message: msg, buttons: ['OK'] });
            await err.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

// ── Comentarios veterinario ───────────────────────────────────────────
const comentarios = ref<ComentarioAPI[]>([]);
const cargandoComentarios = ref(false);

// ── Recordatorios ─────────────────────────────────────────────────────
const recordatorios   = ref<RecordatorioAPI[]>([]);
const cargandoRec     = ref(false);
const mostrarFormRec  = ref(false);
const guardandoRec    = ref(false);
const errorRec        = ref('');
const formRec         = ref({ frecuencia: 'mensual', fecha_inicio: '' });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const cargarRecordatorios = async () => {
  cargandoRec.value = true;
  try {
    const res = await recordatorioService.getRecordatorios(bovinoId.value);
    recordatorios.value = res.data;
  } catch { /* sin endpoint aún */ } finally {
    cargandoRec.value = false;
  }
};

const guardarRec = async () => {
  errorRec.value = '';
  if (!formRec.value.frecuencia || !formRec.value.fecha_inicio) {
    errorRec.value = 'Completa todos los campos';
    return;
  }
  guardandoRec.value = true;
  try {
    const res = await recordatorioService.crearRecordatorio(bovinoId.value, {
      frecuencia: formRec.value.frecuencia,
      fecha_inicio: formRec.value.fecha_inicio,
    });
    recordatorios.value.push(res.data);
    mostrarFormRec.value = false;
    formRec.value = { frecuencia: 'mensual', fecha_inicio: '' };
  } catch (e: any) {
    errorRec.value = e.response?.data?.message || 'Error al guardar el recordatorio';
  } finally {
    guardandoRec.value = false;
  }
};

const confirmarEliminarRec = async (id: number) => {
  const alert = await alertController.create({
    header: 'Eliminar Recordatorio',
    message: '¿Eliminar este recordatorio? Ya no recibirás avisos de re-pesaje.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar', role: 'destructive',
        handler: async () => {
          try {
            await recordatorioService.eliminarRecordatorio(bovinoId.value, id);
            recordatorios.value = recordatorios.value.filter(r => r.id_recordatorio !== id);
          } catch { /* silent */ }
        },
      },
    ],
  });
  await alert.present();
};

// ── Helpers del historial ─────────────────────────────────────────────
const formatFecha = (f: string) => new Date(f).toLocaleDateString('es-CR');

const textosDiff = (peso: number, i: number) => {
  if (i === historial.value.length - 1) return 'Inicial';
  const prev = pesoBruto(historial.value[i + 1]);
  if (prev === undefined) return '';
  const d = peso - prev;
  return d >= 0 ? `+${d.toFixed(1)} kg` : `${d.toFixed(1)} kg`;
};

const colorDiff = (peso: number, i: number) => {
  if (i === historial.value.length - 1) return 'medium';
  const prev = pesoBruto(historial.value[i + 1]);
  if (prev === undefined) return 'primary';
  return peso - prev >= 0 ? 'success' : 'danger';
};

// ── Exportación ───────────────────────────────────────────────────────
const exportando = ref('');
const fechaHoy = () => new Date().toISOString().slice(0, 10);

const exportarPDF = async () => {
  exportando.value = 'pdf';
  try {
    const arete = bovinoId.value;
    const doc = new jsPDF();
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
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const a = animal.value;
    doc.text(`Animal: ${a?.nombre || 'Sin nombre'}   Raza: ${a?.raza?.nombre || '—'}   Sexo: ${a?.sexo?.nombre || '—'}`, 14, 30);
    doc.text(`Estado: ${a?.estado?.nombre || '—'}   Finca: ${a?.finca?.nombre || '—'}   Último peso: ${ultimoPeso.value?.toFixed(1) ?? '—'} kg`, 14, 36);
    autoTable(doc, {
      startY: 42,
      head: [['#', 'Fecha', 'Peso (kg)', 'Peso Original', 'Factor', 'Diferencia', 'Tipo']],
      body: historial.value.map((p, i) => [
        historial.value.length - i,
        formatFecha(p.fecha),
        pesoBruto(p).toFixed(1),
        p.peso_original != null ? p.peso_original.toFixed(1) : '—',
        p.factor_raza != null ? p.factor_raza : '—',
        textosDiff(pesoBruto(p), i),
        p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
      ]),
      headStyles: { fillColor: [0, 109, 55], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 8 },
    });

    const pesajesFoto = historial.value.filter(p => p.imagen_url);
    if (pesajesFoto.length > 0) {
      doc.addPage();
      doc.setFillColor(0, 109, 55);
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
        doc.text(`${formatFecha(p.fecha)}  —  ${pesoBruto(p).toFixed(1)} kg`, x, y);
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

    await guardarPDF(doc, `Historial_${arete}_${fechaHoy()}.pdf`);
  } finally { exportando.value = ''; }
};

const exportarExcel = async () => {
  exportando.value = 'excel';
  try {
    const arete = bovinoId.value;
    const datos = historial.value.map((p, i) => ({
      '#': historial.value.length - i,
      Fecha: formatFecha(p.fecha),
      'Peso (kg)': pesoBruto(p),
      'Peso Original': p.peso_original ?? '',
      'Factor Raza': p.factor_raza ?? '',
      Diferencia: textosDiff(pesoBruto(p), i),
      Tipo: p.tipo_pesaje_id === 1 ? 'Manual' : 'Foto IA',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [6, 14, 12, 14, 12, 14, 12].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, `Arete ${arete}`);
    await guardarExcel(wb, `Historial_${arete}_${fechaHoy()}.xlsx`);
  } finally { exportando.value = ''; }
};

// ── Carga inicial ─────────────────────────────────────────────────────
onMounted(async () => {
  cargando.value = true;
  try {
    const [animalRes, pesajesRes, fincasRes, razasRes, estadosRes] = await Promise.allSettled([
      bovinoService.getAnimal(bovinoId.value),
      pesajeService.getPesajes({ animal: bovinoId.value }),
      fincaService.getFincas(),
      razaService.getRazas(),
      estadoService.getEstados(),
    ]);

    if (animalRes.status === 'fulfilled')  animal.value   = animalRes.value.data;
    if (pesajesRes.status === 'fulfilled') historial.value = pesajesRes.value.data;
    if (fincasRes.status === 'fulfilled')
      fincasDisponibles.value = fincasRes.value.data.map(f => ({ id: f.id, nombre: f.nombre }));

    if (razasRes.status === 'fulfilled')
      razasDisponibles.value = razasRes.value.data.map(r => ({ id: r.id_raza, nombre: r.raza }));

    if (estadosRes.status === 'fulfilled' && estadosRes.value.data.length > 0)
      estadosDisponibles.value = estadosRes.value.data.map(e => ({ id: e.id_estado, nombre: e.estado }));
    else
      // Fallback a los estados base si el endpoint no existe aún
      estadosDisponibles.value = [
        { id: 1, nombre: 'Activo' },
        { id: 2, nombre: 'Vendido' },
        { id: 3, nombre: 'Fallecido' },
      ];
  } finally {
    cargando.value = false;
  }

  await cargarRecordatorios();

  cargandoComentarios.value = true;
  try {
    const comRes = await comentarioService.getComentarios(bovinoId.value);
    comentarios.value = Array.isArray(comRes) ? comRes : (comRes.data ?? []);
  } catch { /* sin permiso o sin endpoint */ }
  finally { cargandoComentarios.value = false; }
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

.loading-box-sm {
  display: flex; justify-content: center; padding: 20px 0;
}

.arete { color: #6b7280; font-size: 16px; font-weight: normal; }
.subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
.label-peso { color: #6b7280; margin: 0; font-size: 13px; }

.peso-actual {
  color: #006d37; font-size: 42px;
  font-weight: bold; margin: 4px 0 16px;
}

.gestion-btns { display: flex; gap: 8px; margin-top: 10px; }
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
  border-radius: 8px; padding: 8px 12px; font-size: 13px; margin: 8px 0;
}

.exito-msg {
  color: #166534; background: #dcfce7;
  border-radius: 8px; padding: 8px 12px; font-size: 13px; margin: 8px 0;
}

.peso-original-hint {
  font-size: 11px; color: #9ca3af;
}

.factor-hint {
  font-size: 11px; color: #6b7280;
}

.empty-hist { color: #6b7280; text-align: center; padding: 20px; }

.comentario-card {
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;
}
.com-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.com-icon { font-size: 16px; color: #006d37; }
.com-vet { font-weight: 600; font-size: 13px; color: #111827; }
.com-fecha { margin-left: auto; font-size: 11px; color: #9ca3af; }
.com-texto { color: #374151; font-size: 13px; line-height: 1.5; margin: 0; }

.add-rec-btn {
  display: flex; align-items: center; gap: 4px;
  background: #006d37; color: #fff; border: none;
  border-radius: 8px; padding: 6px 12px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.add-rec-btn ion-icon { font-size: 16px; }
</style>
