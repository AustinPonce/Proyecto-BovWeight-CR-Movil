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

            <ion-button
              v-if="puedeEditar"
              expand="block"
              fill="outline"
              color="success"
              class="mt"
              @click="abrirFormEditar"
            >
              <ion-icon slot="start" :icon="createOutline" />
              Editar Finca
            </ion-button>
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

        </template>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonIcon, IonButton, IonSpinner, useIonRouter
} from '@ionic/vue';
import { businessOutline, pawOutline, createOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import { fincaService, type FincaAPI } from '@/services/fincaService';
import { useRol } from '@/composables/useRol';

const route = useRoute();
const router = useIonRouter();
const { puedeEditar } = useRol();
const fincaId = computed(() => Number(route.params.id));

const finca = ref<FincaAPI | null>(null);
const cargando = ref(false);
const mostrarFormEditar = ref(false);
const guardando = ref(false);
const errorEditar = ref('');
const exitoEditar = ref(false);

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
</style>
