<template>
  <ion-page>

    <AppHeader title="Detalle de Finca" :show-back="true" default-href="/fincas" />

    <ion-content>
      <div class="container">

        <!-- Carga -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner color="success" name="crescent" />
          <p>Cargando...</p>
        </div>

        <template v-else>

          <!-- Tarjeta principal -->
          <BaseCard>
            <div class="finca-header">
              <div class="finca-avatar">
                <ion-icon :icon="businessOutline" />
              </div>
              <div>
                <h2>{{ finca?.nombre }}</h2>
                <p class="ubicacion">{{ finca?.ubicacion }}</p>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-box">
                <ion-icon :icon="pawOutline" class="stat-icon" />
                <span class="stat-value">{{ finca?.animales_count ?? 0 }}</span>
                <span class="stat-label">Bovinos</span>
              </div>
            </div>

            <div v-if="puedeEditar" class="accion-btns">
              <ion-button expand="block" fill="outline" color="success" @click="abrirFormEditar">
                <ion-icon slot="start" :icon="createOutline" />
                Editar Finca
              </ion-button>
              <ion-button expand="block" fill="outline" color="danger" @click="confirmarEliminarFinca">
                <ion-icon slot="start" :icon="trashOutline" />
                Eliminar Finca
              </ion-button>
            </div>
          </BaseCard>

          <!-- Formulario de edición inline -->
          <BaseCard v-if="mostrarFormEditar" class="form-card mt">
            <h3 class="form-title">Editar Finca</h3>

            <BaseInput
              v-model="formEditar.nombre"
              label="Nombre de la finca *"
              placeholder="Ej: Finca Los Alpes"
            />
            <BaseInput
              v-model="formEditar.ubicacion"
              label="Ubicación *"
              placeholder="Ej: Guanacaste, Costa Rica"
            />

            <div v-if="errorEditar" class="error-msg">{{ errorEditar }}</div>
            <div v-if="exitoEditar" class="exito-msg">Finca actualizada correctamente.</div>

            <div class="btn-row">
              <ion-button fill="outline" color="medium" @click="cerrarFormEditar">
                Cancelar
              </ion-button>
              <ion-button color="success" @click="guardarEdicion" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
              </ion-button>
            </div>
          </BaseCard>

          <!-- Acceso rápido: ver bovinos de esta finca -->
          <BaseCard class="mt">
            <h3>Animales en esta Finca</h3>
            <p class="hint">Accede al listado completo de bovinos registrados aquí.</p>
            <ion-button
              expand="block"
              color="success"
              @click="router.push('/bovinos')"
            >
              <ion-icon slot="start" :icon="pawOutline" />
              Ver Bovinos
            </ion-button>
          </BaseCard>

          <!-- Veterinarios asignados (solo Admin/Ganadero) -->
          <BaseCard v-if="!isVeterinario" class="mt">
            <h3>Veterinarios Asignados</h3>

            <div v-if="cargandoVets" class="loading-box-sm">
              <ion-spinner name="crescent" color="success" />
            </div>

            <p v-else-if="veterinarios.length === 0" class="hint">
              Sin veterinarios asignados a esta finca.
            </p>

            <ion-list v-else>
              <ion-item v-for="v in veterinarios" :key="v.cedula">
                <ion-icon slot="start" :icon="medkitOutline" color="success" />
                <ion-label>
                  <h2>{{ v.nombre }}</h2>
                  <p>Cédula: {{ v.cedula }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </BaseCard>

        </template>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonIcon, IonButton, IonSpinner,
  IonList, IonItem, IonLabel, useIonRouter, alertController
} from '@ionic/vue';
import { businessOutline, pawOutline, createOutline, trashOutline, medkitOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { fincaService, type FincaAPI } from '@/services/fincaService';
import { veterinarioService } from '@/services/veterinarioService';
import { useRol } from '@/composables/useRol';

const route = useRoute();
const router = useIonRouter();
const { puedeEditar, isVeterinario } = useRol();
const fincaId = computed(() => Number(route.params.id));

const finca = ref<FincaAPI | null>(null);
const cargando = ref(false);
const mostrarFormEditar = ref(false);
const guardando = ref(false);
const errorEditar = ref('');
const exitoEditar = ref(false);

const veterinarios   = ref<any[]>([]);
const cargandoVets   = ref(false);

const formEditar = reactive({ nombre: '', ubicacion: '' });

const abrirFormEditar = () => {
  formEditar.nombre = finca.value?.nombre ?? '';
  formEditar.ubicacion = finca.value?.ubicacion ?? '';
  errorEditar.value = '';
  exitoEditar.value = false;
  mostrarFormEditar.value = true;
};

const cerrarFormEditar = () => {
  mostrarFormEditar.value = false;
};

const confirmarEliminarFinca = async () => {
  const alert = await alertController.create({
    header: 'Eliminar Finca',
    message: `¿Eliminar la finca "${finca.value?.nombre}"? Esta acción no se puede deshacer.`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await fincaService.eliminarFinca(fincaId.value);
            router.navigate('/fincas', 'back');
          } catch (e: any) {
            const msg = e.response?.data?.message || 'Error al eliminar la finca';
            const err = await alertController.create({
              header: 'Error', message: msg, buttons: ['OK']
            });
            await err.present();
          }
        }
      }
    ]
  });
  await alert.present();
};

const guardarEdicion = async () => {
  errorEditar.value = '';
  exitoEditar.value = false;
  if (!formEditar.nombre.trim()) { errorEditar.value = 'El nombre es obligatorio'; return; }
  if (!formEditar.ubicacion.trim()) { errorEditar.value = 'La ubicación es obligatoria'; return; }

  guardando.value = true;
  try {
    const res = await fincaService.actualizarFinca(fincaId.value, {
      nombre: formEditar.nombre.trim(),
      ubicacion: formEditar.ubicacion.trim(),
    });
    finca.value = { ...finca.value!, ...res.data };
    exitoEditar.value = true;
    setTimeout(() => { mostrarFormEditar.value = false; }, 1500);
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    errorEditar.value = errors
      ? Object.values(errors).flat().join(' ')
      : e.response?.data?.message || 'Error al actualizar la finca';
  } finally {
    guardando.value = false;
  }
};

onMounted(async () => {
  cargando.value = true;
  try {
    const res = await fincaService.getFinca(fincaId.value);
    finca.value = res.data;
  } catch {
    /* mostrar vacío */
  } finally {
    cargando.value = false;
  }

  cargandoVets.value = true;
  try {
    const vetsRes = await veterinarioService.getVeterinariosAsignados(fincaId.value);
    veterinarios.value = Array.isArray(vetsRes) ? vetsRes : (vetsRes.data ?? []);
  } catch { /* sin vets o sin permiso */ } finally {
    cargandoVets.value = false;
  }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 32px; }
.mt { margin-top: 16px; }

.loading-box {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 50vh; color: #6b7280;
}

.finca-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
}
.finca-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: #d1fae5; display: flex;
  align-items: center; justify-content: center;
  font-size: 28px; color: #006d37; flex-shrink: 0;
}
.finca-header h2 { margin: 0 0 4px; font-size: 20px; }
.ubicacion { margin: 0; color: #6b7280; font-size: 13px; }

.stats-row {
  display: flex; gap: 12px; margin-top: 8px;
}
.stat-box {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  background: #f0fdf4; border-radius: 12px;
  padding: 10px 20px;
}
.stat-icon { font-size: 22px; color: #16a34a; }
.stat-value { font-size: 22px; font-weight: bold; color: #006d37; }
.stat-label { font-size: 11px; color: #6b7280; }

.accion-btns { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }

.form-card { border: 2px dashed #86efac; }
.form-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; }
.btn-row { display: flex; gap: 8px; margin-top: 12px; }
.btn-row ion-button { flex: 1; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 8px; color: #991b1b; font-size: 13px;
}
.exito-msg {
  background: #dcfce7; border: 1px solid #86efac;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 8px; color: #166534; font-size: 13px;
}

.hint { color: #6b7280; font-size: 13px; margin-bottom: 12px; }

.loading-box-sm { display: flex; justify-content: center; padding: 16px 0; }
</style>
