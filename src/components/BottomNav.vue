<template>
  <div class="bottom-nav-wrapper">
    <ion-tab-bar slot="bottom" class="custom-tab-bar">

      <ion-tab-button
        tab="dashboard"
        @click="router.push('/dashboard')"
        class="tab-button"
        :class="{ active: isActive('/dashboard') }"
      >
        <ion-icon :icon="homeOutline" />
        <ion-label>Inicio</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="notificaciones"
        @click="router.push('/notificaciones')"
        class="tab-button"
        :class="{ active: isActive('/notificaciones') }"
      >
        <ion-icon :icon="notificationsOutline" />
        <ion-label>Alertas</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="reportes"
        @click="router.push('/reportes')"
        class="tab-button"
        :class="{ active: isActive('/reportes') }"
      >
        <ion-icon :icon="barChartOutline" />
        <ion-label>Informes</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="perfil"
        @click="router.push('/perfil')"
        class="tab-button"
        :class="{ active: isActive('/perfil') }"
      >
        <ion-icon :icon="personOutline" />
        <ion-label>Perfil</ion-label>
      </ion-tab-button>

    </ion-tab-bar>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/vue';

import {
  homeOutline,
  notificationsOutline,
  barChartOutline,
  personOutline
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style scoped>
.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.custom-tab-bar {
  --background: #ffffff;
  --border-color: #e5e7eb;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  height: 60px;
  --padding-bottom: env(safe-area-inset-bottom);
}

.tab-button {
  --color: #9ca3af;
  --color-selected: #16a34a;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 12px;
}

.tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tab-button ion-label {
  display: block;
  font-weight: 500;
}

/* Estado activo */
.tab-button.active {
  --color: #16a34a;
  color: #16a34a;
}

.tab-button.active ion-icon {
  color: #16a34a;
}

.tab-button[aria-selected="true"] {
  --color: #16a34a;
}

.tab-button[aria-selected="true"] ion-icon {
  color: #16a34a;
}
</style>