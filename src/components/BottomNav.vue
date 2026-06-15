<template>
  <div class="bottom-nav">
    <button
      v-for="item in items"
      :key="item.path"
      class="nav-btn"
      :class="{ active: isActive(item.path) }"
      @click="navegar(item.path)"
    >
      <ion-icon :icon="item.icon" />
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useIonRouter, IonIcon } from '@ionic/vue';
import { useRoute } from 'vue-router';
import {
  homeOutline,
  notificationsOutline,
  barChartOutline,
  personOutline
} from 'ionicons/icons';

const ionRouter = useIonRouter();
const route = useRoute();

const items = [
  { path: '/dashboard',      icon: homeOutline,          label: 'Inicio' },
  { path: '/notificaciones', icon: notificationsOutline, label: 'Alertas' },
  { path: '/reportes',       icon: barChartOutline,      label: 'Informes' },
  { path: '/perfil',         icon: personOutline,        label: 'Perfil' },
];

const isActive = (path: string) =>
  route.path === path || route.path.startsWith(path + '/');

const navegar = (path: string) => {
  ionRouter.push(path);
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
  color: #9ca3af;
  transition: color 0.15s;
}

.nav-btn ion-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

.nav-btn.active {
  color: #16a34a;
}
</style>
