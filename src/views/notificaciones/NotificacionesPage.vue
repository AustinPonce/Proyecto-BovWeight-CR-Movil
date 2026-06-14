<template>
  <ion-page>

    <AppHeader title="Notificaciones" />

    <ion-content>

      <div class="container">

        <!-- Mostrar mensaje vacío si no hay notificaciones -->
        <BaseCard v-if="notificaciones.length === 0">

          <ion-icon
            :icon="notificationsOffOutline"
            class="notification-icon"
          />

          <h2>No tienes notificaciones</h2>

          <p>
            Te avisaremos cuando haya novedades importantes.
          </p>

        </BaseCard>

        <!-- Listado de notificaciones -->
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

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import {
  IonPage,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/vue';

import { notificationsOffOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';

// ============= ESTADO REACTIVO =============
interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  fecha: string;
  leida: boolean;
}

const notificaciones = ref<Notificacion[]>([]);
const loading = ref(false);

// ============= FUNCIONES =============
const formatearFecha = (fecha: string) => {
  // TODO: Implementar formateo de fecha según locale
  return new Date(fecha).toLocaleDateString();
};

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/notificaciones
  // Obtener: lista de notificaciones del usuario
  // Reemplazar los valores en ref(notificaciones)
  // Campos esperados: id, titulo, mensaje, tipo, fecha, leida
  console.log('📡 [PENDING API] GET /api/notificaciones - Cargar notificaciones');
});
</script>

<style scoped>
.container {
  padding: 16px;
  text-align: center;
}

.notification-icon {
  font-size: 72px;
  color: #9ca3af;
}

.fecha {
  font-size: 12px;
  color: #9ca3af;
}
</style>