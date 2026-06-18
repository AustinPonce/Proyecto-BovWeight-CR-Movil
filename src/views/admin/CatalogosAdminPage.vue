<template>
  <ion-page>
    <AppHeader title="Catálogos del Sistema" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- ─── Medicamentos ─────────────────────────────── -->
        <div class="section-header">
          <h3>Medicamentos</h3>
          <button class="add-btn" @click="abrirFormMed()">
            <ion-icon :icon="addOutline" /> Agregar
          </button>
        </div>

        <div v-if="showMedForm" class="form-card">
          <h4 class="form-title">{{ editingMed ? 'Editar medicamento' : 'Nuevo medicamento' }}</h4>
          <BaseInput v-model="formMed.nombre"       label="Nombre *"       placeholder="Ej: Ivermectina" />
          <BaseInput v-model="formMed.dosis_por_kg" label="Dosis por kg *" placeholder="Ej: 0.2" type="number" />
          <BaseInput v-model="formMed.unidad"       label="Unidad *"       placeholder="Ej: ml" />
          <BaseInput v-model="formMed.descripcion"  label="Descripción"    placeholder="Opcional" />
          <div class="form-actions">
            <button class="btn-cancel" @click="cerrarFormMed">Cancelar</button>
            <button class="btn-save" @click="guardarMed" :disabled="guardandoMed">
              {{ guardandoMed ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>

        <div v-if="cargandoMed" class="loading-box">
          <ion-spinner name="crescent" color="success" />
        </div>
        <div v-else-if="errorMed" class="error-msg">{{ errorMed }}</div>

        <ion-list v-else-if="medicamentos.length > 0">
          <ion-item-sliding v-for="m in medicamentos" :key="m.id_medicamento">
            <ion-item>
              <ion-icon slot="start" :icon="medkitOutline" color="success" />
              <ion-label>
                <h2>{{ m.nombre }}</h2>
                <p>{{ m.dosis_por_kg }} {{ m.unidad }}/kg</p>
                <p v-if="m.descripcion" class="desc">{{ m.descripcion }}</p>
              </ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="warning" @click="abrirFormMed(m)">
                <ion-icon slot="icon-only" :icon="pencilOutline" />
              </ion-item-option>
              <ion-item-option color="danger" @click="confirmarEliminarMed(m)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        <p v-else-if="!cargandoMed && !errorMed" class="empty-msg">No hay medicamentos registrados</p>

        <!-- ─── Razas ─────────────────────────────────────── -->
        <div class="section-header mt">
          <h3>Razas</h3>
          <button class="add-btn" @click="abrirFormRaza()">
            <ion-icon :icon="addOutline" /> Agregar
          </button>
        </div>

        <div v-if="showRazaForm" class="form-card">
          <h4 class="form-title">{{ editingRaza ? 'Editar raza' : 'Nueva raza' }}</h4>
          <BaseInput v-model="formRaza.nombre" label="Nombre *" placeholder="Ej: Brahman" />
          <BaseInput
            v-model="formRaza.factor_correccion"
            label="Factor de corrección *"
            type="number"
            placeholder="Ej: 1.00 (sin ajuste), 0.95, 1.05"
          />
          <p class="field-hint">El factor ajusta el peso estimado por raza (1.00 = sin cambio).</p>
          <div class="form-actions">
            <button class="btn-cancel" @click="cerrarFormRaza">Cancelar</button>
            <button class="btn-save" @click="guardarRaza" :disabled="guardandoRaza">
              {{ guardandoRaza ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>

        <div v-if="cargandoRaza" class="loading-box">
          <ion-spinner name="crescent" color="success" />
        </div>

        <ion-list v-else-if="razas.length > 0">
          <ion-item-sliding v-for="r in razas" :key="r.id_raza">
            <ion-item>
              <ion-icon slot="start" :icon="pawOutline" color="success" />
              <ion-label>
                <h2>{{ r.raza }}</h2>
                <p>Factor de corrección: {{ r.factor_correccion ?? '1.00' }}</p>
              </ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="warning" @click="abrirFormRaza(r)">
                <ion-icon slot="icon-only" :icon="pencilOutline" />
              </ion-item-option>
              <ion-item-option color="danger" @click="confirmarEliminarRaza(r)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        <p v-else-if="!cargandoRaza" class="empty-msg">No hay razas registradas</p>

        <!-- ─── Estados de Animal ─────────────────────────── -->
        <div class="section-header mt">
          <h3>Estados de Animal</h3>
          <button class="add-btn" @click="mostrarFormEstado = !mostrarFormEstado">
            <ion-icon :icon="addOutline" /> Agregar
          </button>
        </div>

        <div v-if="mostrarFormEstado" class="form-card">
          <h4 class="form-title">Nuevo estado</h4>
          <BaseInput v-model="nuevoEstado" label="Nombre del estado *" placeholder="Ej: Cuarentena" />
          <div class="form-actions">
            <button class="btn-cancel" @click="mostrarFormEstado = false; nuevoEstado = ''">Cancelar</button>
            <button class="btn-save" @click="guardarEstado" :disabled="guardandoEstado">
              {{ guardandoEstado ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>

        <div v-if="cargandoEstado" class="loading-box">
          <ion-spinner name="crescent" color="success" />
        </div>

        <ion-list v-else-if="estados.length > 0">
          <ion-item-sliding v-for="e in estados" :key="e.id_estado">
            <ion-item>
              <ion-icon slot="start" :icon="ellipseOutline" color="success" />
              <ion-label>{{ e.estado }}</ion-label>
              <ion-badge slot="end" color="light">ID {{ e.id_estado }}</ion-badge>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click="confirmarEliminarEstado(e)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        <p v-else-if="!cargandoEstado" class="empty-msg">No hay estados registrados</p>

        <!-- ─── Roles de usuario (solo lectura) ──────────── -->
        <div class="section-header mt">
          <h3>Roles de usuario</h3>
        </div>
        <ion-list>
          <ion-item>
            <ion-label>Ganadero</ion-label>
            <ion-badge slot="end" color="primary">2</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Veterinario</ion-label>
            <ion-badge slot="end" color="warning">3</ion-badge>
          </ion-item>
        </ion-list>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonItemSliding,
  IonItemOptions, IonItemOption, IonLabel, IonBadge,
  IonIcon, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import {
  medkitOutline, addOutline, pencilOutline, trashOutline,
  pawOutline, ellipseOutline,
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseInput from '@/components/BaseInput.vue';
import { medicamentoService, type MedicamentoAPI } from '@/services/medicamentoService';
import { razaService, type RazaAPI } from '@/services/razaService';
import { estadoService, type EstadoAPI } from '@/services/estadoService';

// ── Medicamentos ────────────────────────────────────────────
const medicamentos  = ref<MedicamentoAPI[]>([]);
const cargandoMed   = ref(false);
const errorMed      = ref('');
const showMedForm   = ref(false);
const guardandoMed  = ref(false);
const editingMed    = ref<MedicamentoAPI | null>(null);
const formMed       = ref({ nombre: '', dosis_por_kg: '', unidad: '', descripcion: '' });

const cargarMeds = async () => {
  cargandoMed.value = true;
  errorMed.value = '';
  try {
    const res = await medicamentoService.getMedicamentos();
    medicamentos.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch {
    errorMed.value = 'No se pudieron cargar los medicamentos.';
  } finally {
    cargandoMed.value = false;
  }
};

const abrirFormMed = (med?: MedicamentoAPI) => {
  editingMed.value = med ?? null;
  formMed.value = {
    nombre:       med?.nombre       ?? '',
    dosis_por_kg: String(med?.dosis_por_kg ?? ''),
    unidad:       med?.unidad       ?? '',
    descripcion:  med?.descripcion  ?? '',
  };
  showMedForm.value = true;
};

const cerrarFormMed = () => {
  showMedForm.value = false;
  editingMed.value  = null;
};

const guardarMed = async () => {
  if (!formMed.value.nombre.trim() || !formMed.value.unidad.trim() || !formMed.value.dosis_por_kg) {
    const t = await toastController.create({
      message: 'Completá los campos obligatorios.', duration: 2000, color: 'warning', position: 'top',
    });
    return t.present();
  }
  guardandoMed.value = true;
  const datos = {
    nombre:       formMed.value.nombre.trim(),
    unidad:       formMed.value.unidad.trim(),
    dosis_por_kg: Number(formMed.value.dosis_por_kg),
    descripcion:  formMed.value.descripcion.trim() || undefined,
  };
  try {
    if (editingMed.value) {
      await medicamentoService.actualizarMedicamento(editingMed.value.id_medicamento, datos as any);
    } else {
      await medicamentoService.crearMedicamento(datos as any);
    }
    cerrarFormMed();
    await cargarMeds();
    const t = await toastController.create({ message: 'Medicamento guardado.', duration: 2000, color: 'success', position: 'top' });
    await t.present();
  } catch {
    const t = await toastController.create({ message: 'Error al guardar el medicamento.', duration: 2500, color: 'danger', position: 'top' });
    await t.present();
  } finally {
    guardandoMed.value = false;
  }
};

const confirmarEliminarMed = async (m: MedicamentoAPI) => {
  const alert = await alertController.create({
    header: 'Desactivar medicamento',
    message: `¿Desactivar "${m.nombre}"? Ya no aparecerá en la calculadora de dosis.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Desactivar', role: 'destructive',
        handler: async () => {
          try {
            await medicamentoService.eliminarMedicamento(m.id_medicamento);
            await cargarMeds();
            const t = await toastController.create({ message: 'Medicamento desactivado.', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          } catch {
            const t = await toastController.create({ message: 'No se pudo desactivar.', duration: 2000, color: 'danger', position: 'top' });
            await t.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

// ── Razas ───────────────────────────────────────────────────
const razas        = ref<RazaAPI[]>([]);
const cargandoRaza = ref(false);
const showRazaForm = ref(false);
const guardandoRaza = ref(false);
const editingRaza  = ref<RazaAPI | null>(null);
const formRaza     = ref({ nombre: '', factor_correccion: '1.00' });

const cargarRazas = async () => {
  cargandoRaza.value = true;
  try {
    const res = await razaService.getRazas();
    razas.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* silent */ } finally {
    cargandoRaza.value = false;
  }
};

const abrirFormRaza = (r?: RazaAPI) => {
  editingRaza.value = r ?? null;
  formRaza.value = {
    nombre:           r?.raza              ?? '',
    factor_correccion: String(r?.factor_correccion ?? '1.00'),
  };
  showRazaForm.value = true;
};

const cerrarFormRaza = () => {
  showRazaForm.value = false;
  editingRaza.value  = null;
};

const guardarRaza = async () => {
  if (!formRaza.value.nombre.trim() || !formRaza.value.factor_correccion) {
    const t = await toastController.create({
      message: 'Completá el nombre y el factor de corrección.', duration: 2000, color: 'warning', position: 'top',
    });
    return t.present();
  }
  guardandoRaza.value = true;
  const datos = {
    raza: formRaza.value.nombre.trim(),
    factor_correccion: Number(formRaza.value.factor_correccion),
  };
  try {
    if (editingRaza.value) {
      await razaService.actualizarRaza(editingRaza.value.id_raza, datos);
    } else {
      await razaService.crearRaza(datos);
    }
    cerrarFormRaza();
    await cargarRazas();
    const t = await toastController.create({ message: 'Raza guardada.', duration: 2000, color: 'success', position: 'top' });
    await t.present();
  } catch {
    const t = await toastController.create({ message: 'No se pudo guardar la raza.', duration: 2000, color: 'danger', position: 'top' });
    await t.present();
  } finally {
    guardandoRaza.value = false;
  }
};

const confirmarEliminarRaza = async (r: RazaAPI) => {
  const alert = await alertController.create({
    header: 'Eliminar Raza',
    message: `¿Eliminar la raza "${r.raza}"? Esta acción no se puede deshacer.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar', role: 'destructive',
        handler: async () => {
          try {
            await razaService.eliminarRaza(r.id_raza);
            await cargarRazas();
            const t = await toastController.create({ message: 'Raza eliminada.', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          } catch {
            const t = await toastController.create({ message: 'No se pudo eliminar.', duration: 2000, color: 'danger', position: 'top' });
            await t.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

// ── Estados ─────────────────────────────────────────────────
const estados         = ref<EstadoAPI[]>([]);
const cargandoEstado  = ref(false);
const mostrarFormEstado = ref(false);
const guardandoEstado = ref(false);
const nuevoEstado     = ref('');

const cargarEstados = async () => {
  cargandoEstado.value = true;
  try {
    const res = await estadoService.getEstados();
    estados.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* sin endpoint aún — lista vacía */ } finally {
    cargandoEstado.value = false;
  }
};

const guardarEstado = async () => {
  if (!nuevoEstado.value.trim()) {
    const t = await toastController.create({ message: 'Ingresa el nombre del estado.', duration: 2000, color: 'warning', position: 'top' });
    return t.present();
  }
  guardandoEstado.value = true;
  try {
    await estadoService.crearEstado(nuevoEstado.value.trim());
    nuevoEstado.value = '';
    mostrarFormEstado.value = false;
    await cargarEstados();
    const t = await toastController.create({ message: 'Estado agregado.', duration: 2000, color: 'success', position: 'top' });
    await t.present();
  } catch {
    const t = await toastController.create({ message: 'No se pudo agregar el estado.', duration: 2000, color: 'danger', position: 'top' });
    await t.present();
  } finally {
    guardandoEstado.value = false;
  }
};

const confirmarEliminarEstado = async (e: EstadoAPI) => {
  const alert = await alertController.create({
    header: 'Eliminar Estado',
    message: `¿Eliminar el estado "${e.estado}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar', role: 'destructive',
        handler: async () => {
          try {
            await estadoService.eliminarEstado(e.id_estado);
            await cargarEstados();
            const t = await toastController.create({ message: 'Estado eliminado.', duration: 2000, color: 'success', position: 'top' });
            await t.present();
          } catch {
            const t = await toastController.create({ message: 'No se pudo eliminar.', duration: 2000, color: 'danger', position: 'top' });
            await t.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

onMounted(async () => {
  await Promise.all([cargarMeds(), cargarRazas(), cargarEstados()]);
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.section-header h3 { font-size: 17px; font-weight: 600; color: #374151; margin: 0; }
.mt { margin-top: 28px; }

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #006d37;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.add-btn ion-icon { font-size: 16px; }

.form-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.form-title { font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 12px; }

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin: -4px 0 8px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}
.btn-cancel {
  background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
  border-radius: 8px; padding: 7px 16px; font-size: 13px; cursor: pointer;
}
.btn-save {
  background: #006d37; color: #fff; border: none;
  border-radius: 8px; padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-box { display: flex; justify-content: center; padding: 24px 0; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px; color: #991b1b; font-size: 13px;
}

.desc { font-style: italic; color: #9ca3af; font-size: 12px; }
.empty-msg { color: #9ca3af; font-size: 14px; padding: 12px 0; }
</style>
