<template>
  <ion-page>

    <AppHeader title="Mis Fincas" />

    <ion-content>

      <!-- Carga -->
      <div v-if="cargando" class="loading-box">
        <ion-spinner color="success" name="crescent" />
        <p>Cargando fincas...</p>
      </div>

      <div v-else class="container">

        <!-- Sin fincas -->
        <BaseCard v-if="fincas.length === 0 && !mostrarFormCrear" class="empty-card">
          <div class="icon-circle">
            <ion-icon :icon="businessOutline" class="farm-icon" />
          </div>
          <h2>Comienza tu viaje</h2>
          <p>No hay fincas registradas en tu cuenta actualmente.</p>
          <BaseButton @click="abrirFormCrear">Registrar Finca</BaseButton>
        </BaseCard>

        <!-- Formulario inline: crear finca -->
        <BaseCard v-if="mostrarFormCrear" class="form-card">
          <h3 class="form-title">Nueva Finca</h3>

          <BaseInput
            v-model="formCrear.nombre"
            label="Nombre de la finca *"
            placeholder="Ej: Finca Los Alpes"
          />
          <BaseInput
            v-model="formCrear.ubicacion"
            label="Ubicación *"
            placeholder="Ej: Guanacaste, Costa Rica"
          />

          <div v-if="errorCrear" class="error-msg">{{ errorCrear }}</div>

          <div class="btn-row">
            <ion-button fill="outline" color="medium" @click="cerrarFormCrear">
              Cancelar
            </ion-button>
            <ion-button color="success" @click="guardarFinca" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </ion-button>
          </div>
        </BaseCard>

        <!-- Listado -->
        <ion-list v-if="fincas.length > 0">
          <ion-item
            v-for="finca in fincas"
            :key="finca.id"
            button
            @click="router.push(`/fincas/detalle/${finca.id}`)"
          >
            <ion-avatar slot="start" class="finca-avatar">
              <ion-icon :icon="businessOutline" />
            </ion-avatar>
            <ion-label>
              <h2>{{ finca.nombre }}</h2>
              <p>{{ finca.ubicacion }}</p>
            </ion-label>
            <ion-badge slot="end" color="success">
              {{ finca.animales_count ?? 0 }} bovinos
            </ion-badge>
          </ion-item>
        </ion-list>

      </div>

    </ion-content>

    <!-- FAB para agregar finca -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" style="margin-bottom: 70px">
      <ion-fab-button color="success" @click="abrirFormCrear">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonIcon, IonList, IonItem,
  IonLabel, IonAvatar, IonBadge, IonSpinner,
  IonFab, IonFabButton, IonButton
} from '@ionic/vue';
import { businessOutline, addOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import { fincaService, type FincaAPI } from '@/services/fincaService';

const router = useRouter();

const fincas = ref<FincaAPI[]>([]);
const cargando = ref(false);
const mostrarFormCrear = ref(false);
const guardando = ref(false);
const errorCrear = ref('');

const formCrear = reactive({ nombre: '', ubicacion: '' });

const abrirFormCrear = () => {
  formCrear.nombre = '';
  formCrear.ubicacion = '';
  errorCrear.value = '';
  mostrarFormCrear.value = true;
};

const cerrarFormCrear = () => {
  mostrarFormCrear.value = false;
};

const guardarFinca = async () => {
  errorCrear.value = '';
  if (!formCrear.nombre.trim()) { errorCrear.value = 'El nombre es obligatorio'; return; }
  if (!formCrear.ubicacion.trim()) { errorCrear.value = 'La ubicación es obligatoria'; return; }

  guardando.value = true;
  try {
    const res = await fincaService.crearFinca({
      nombre: formCrear.nombre.trim(),
      ubicacion: formCrear.ubicacion.trim(),
    });
    fincas.value.push(res.data);
    mostrarFormCrear.value = false;
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    errorCrear.value = errors
      ? Object.values(errors).flat().join(' ')
      : e.response?.data?.message || 'Error al crear la finca';
  } finally {
    guardando.value = false;
  }
};

onMounted(async () => {
  cargando.value = true;
  try {
    const res = await fincaService.getFincas();
    fincas.value = res.data;
  } catch {
    fincas.value = [];
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 80px; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #6b7280;
}

.empty-card { text-align: center; padding: 20px 16px; }
.icon-circle {
  width: 96px; height: 96px; border-radius: 50%;
  background: #dcfce7; display: flex;
  align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.farm-icon { font-size: 48px; color: #006d37; }

.form-card { border: 2px dashed #86efac; }
.form-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; }
.btn-row { display: flex; gap: 8px; margin-top: 12px; }
.btn-row ion-button { flex: 1; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 8px; color: #991b1b; font-size: 13px;
}

.finca-avatar {
  background: #d1fae5; display: flex;
  align-items: center; justify-content: center;
  font-size: 22px; color: #006d37;
}
</style>
