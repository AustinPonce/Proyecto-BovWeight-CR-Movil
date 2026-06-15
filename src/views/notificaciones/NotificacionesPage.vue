<template>
  <ion-page>

    <AppHeader title="Notificaciones" />

    <ion-content>
      <div class="container">

        <!-- Sin notificaciones -->
        <BaseCard v-if="notificaciones.length === 0" class="empty-card">
          <div class="icon-circle">
            <ion-icon :icon="notificationsOffOutline" class="notification-icon" />
          </div>
          <h2>Sin notificaciones</h2>
          <p>Te avisaremos cuando haya novedades importantes.</p>
        </BaseCard>

        <!-- Listado -->
        <ion-list v-else>
          <ion-item
            v-for="notificacion in notificaciones"
            :key="notificacion.id"
            button
          >
            <ion-label>
              <h2>{{ notificacion.titulo }}</h2>
              <p>{{ notificacion.mensaje }}</p>
              <p class="fecha">{{ formatearFecha(notificacion.fecha) }}</p>
            </ion-label>
            <ion-badge slot="end" color="warning">{{ notificacion.tipo }}</ion-badge>
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
  IonPage, IonContent, IonIcon,
  IonList, IonItem, IonLabel, IonBadge
} from '@ionic/vue';
import { notificationsOffOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  fecha: string;
  leida: boolean;
}

const notificaciones = ref<Notificacion[]>([]);

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CR');

onMounted(async () => {
  // Sin endpoint de notificaciones en el API actual — lista vacía por ahora
});
</script>

<style scoped>
.container {
  padding: 16px;
}

.empty-card {
  text-align: center;
  margin-top: 24px;
}

.icon-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.notification-icon {
  font-size: 48px;
  color: #9ca3af;
}

.fecha {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
</style>
