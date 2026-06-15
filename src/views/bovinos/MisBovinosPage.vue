<template>
  <ion-page>

    <AppHeader title="Mis Bovinos" :show-back="true" default-href="/dashboard" />

    <ion-content>

      <div class="container">

        <BaseInput v-model="buscar" placeholder="Buscar por arete o nombre..." />

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
import { leafOutline, pawOutline, addOutline, alertCircleOutline } from 'ionicons/icons';

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
const bovinos = ref<AnimalAPI[]>([]);
const cargando = ref(false);
const errorCarga = ref('');

const bovinosFiltrados = computed(() => {
  const q = buscar.value.toLowerCase();
  if (!q) return bovinos.value;
  return bovinos.value.filter(b =>
    b.arete.toLowerCase().includes(q) ||
    (b.nombre ?? '').toLowerCase().includes(q)
  );
});

const totalActivos = computed(() =>
  bovinos.value.filter(b => b.estado?.nombre === 'Activo').length
);
const totalOtros = computed(() =>
  bovinos.value.filter(b => b.estado?.nombre !== 'Activo').length
);

const cargarBovinos = async () => {
  cargando.value = true;
  errorCarga.value = '';
  try {
    const res = await bovinoService.getAnimales();
    // Maneja tanto { data: [...] } como respuesta directa [...]
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
</style>
