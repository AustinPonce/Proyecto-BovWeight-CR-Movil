<template>
  <ion-page>
    <AppHeader title="Gestión de Usuarios" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- Búsqueda + filtro -->
        <div class="toolbar">
          <BaseInput v-model="buscar" placeholder="Buscar por nombre o cédula..." />
          <div class="filter-row">
            <button
              v-for="f in filtros"
              :key="f.id"
              class="filter-chip"
              :class="{ active: filtroActivo === f.id }"
              @click="filtroActivo = f.id"
            >{{ f.label }}</button>
          </div>
        </div>

        <!-- Spinner -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error -->
        <BaseCard v-else-if="errorCarga" class="center-card">
          <ion-icon :icon="alertCircleOutline" style="font-size:48px;color:#ef4444;display:block;margin-bottom:8px;" />
          <p>{{ errorCarga }}</p>
          <BaseButton @click="cargar">Reintentar</BaseButton>
        </BaseCard>

        <!-- Lista -->
        <ion-list v-else-if="usuariosFiltrados.length > 0">
          <ion-item v-for="u in usuariosFiltrados" :key="u.id">
            <ion-avatar slot="start" class="avatar">
              <ion-icon :icon="personCircleOutline" />
            </ion-avatar>
            <ion-label>
              <h2>{{ u.nombre }}</h2>
              <p>{{ u.cedula }} · {{ u.correo }}</p>
            </ion-label>
            <ion-badge slot="end" :color="badgeColor(u.id_tipo_usuario)">
              {{ tipoNombre(u.id_tipo_usuario) }}
            </ion-badge>
          </ion-item>
        </ion-list>

        <BaseCard v-else class="center-card">
          <ion-icon :icon="peopleOutline" style="font-size:64px;color:#9ca3af;display:block;margin-bottom:8px;" />
          <p>No se encontraron usuarios</p>
        </BaseCard>

        <!-- Total -->
        <p v-if="!cargando && !errorCarga" class="total-label">
          {{ usuariosFiltrados.length }} usuario(s) encontrado(s)
        </p>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonAvatar, IonBadge, IonIcon, IonSpinner, useIonRouter
} from '@ionic/vue';
import { alertCircleOutline, personCircleOutline, peopleOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import { adminService, type UsuarioAPI } from '@/services/adminService';

const router = useIonRouter();

const usuarios = ref<UsuarioAPI[]>([]);
const buscar = ref('');
const filtroActivo = ref(0);
const cargando = ref(false);
const errorCarga = ref('');

const filtros = [
  { id: 0, label: 'Todos' },
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Ganadero' },
  { id: 3, label: 'Veterinario' },
];

const tipoNombre = (id: number) => {
  if (id === 1) return 'Admin';
  if (id === 2) return 'Ganadero';
  if (id === 3) return 'Veterinario';
  return 'N/A';
};

const badgeColor = (id: number) => {
  if (id === 1) return 'success';
  if (id === 2) return 'primary';
  return 'warning';
};

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value;
  if (filtroActivo.value !== 0) {
    lista = lista.filter(u => u.id_tipo_usuario === filtroActivo.value);
  }
  const q = buscar.value.toLowerCase();
  if (q) {
    lista = lista.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.cedula.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q)
    );
  }
  return lista;
});

const cargar = async () => {
  cargando.value = true;
  errorCarga.value = '';
  try {
    const res = await adminService.getUsuarios();
    usuarios.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e: any) {
    errorCarga.value = e.response?.data?.message || 'No se pudieron cargar los usuarios.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.toolbar { margin-bottom: 12px; }

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.filter-chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
}
.filter-chip.active {
  background: #006d37;
  border-color: #006d37;
  color: #fff;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #6b7280;
}

.center-card { text-align: center; margin-top: 24px; }

.avatar {
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #006d37;
}

.total-label {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-top: 16px;
}
</style>