<template>
  <ion-page>
    <AppHeader title="Comentario veterinario" :show-back="true" default-href="/notificaciones" />

    <ion-content>
      <div class="container">

        <div v-if="!comentario" class="empty-box">
          <p>No se pudo cargar el comentario.</p>
        </div>

        <template v-else>
          <!-- Cabecera animal -->
          <BaseCard class="animal-card">
            <div class="animal-header">
              <ion-icon :icon="pawOutline" class="animal-icon" />
              <div>
                <p class="animal-label">Animal</p>
                <h2 class="animal-nombre">
                  {{ comentario.animal?.nombre || 'Sin nombre' }}
                  <span class="animal-arete">#{{ comentario.arete }}</span>
                </h2>
              </div>
            </div>
          </BaseCard>

          <!-- Info veterinario -->
          <BaseCard class="mt">
            <div class="info-row">
              <ion-icon :icon="medkitOutline" class="info-icon vet" />
              <div>
                <p class="info-label">Veterinario</p>
                <p class="info-valor">{{ comentario.veterinario || 'Veterinario' }}</p>
                <p class="info-cedula">Cédula: {{ comentario.cedula_veterinario }}</p>
              </div>
            </div>
            <div class="divider" />
            <div class="info-row">
              <ion-icon :icon="calendarOutline" class="info-icon fecha" />
              <div>
                <p class="info-label">Fecha</p>
                <p class="info-valor">{{ formatFechaLarga(comentario.fecha) }}</p>
              </div>
            </div>
          </BaseCard>

          <!-- Texto del comentario -->
          <BaseCard class="mt comentario-card">
            <div class="com-titulo">
              <ion-icon :icon="chatbubbleOutline" class="com-titulo-icon" />
              <span>Observación clínica</span>
            </div>
            <p class="com-texto">{{ comentario.comentario }}</p>
          </BaseCard>

          <!-- Botón ver historial -->
          <ion-button
            expand="block"
            fill="outline"
            color="success"
            class="mt"
            @click="verHistorial"
          >
            <ion-icon slot="start" :icon="barChartOutline" />
            Ver historial de peso del animal
          </ion-button>
        </template>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonPage, IonContent, IonIcon, IonButton, useIonRouter } from '@ionic/vue';
import {
  pawOutline, medkitOutline, calendarOutline,
  chatbubbleOutline, barChartOutline,
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import type { ComentarioAPI } from '@/services/comentarioService';

const router = useIonRouter();

// El comentario viene pasado por history.state desde NotificacionesPage
const comentario = computed<ComentarioAPI | null>(() => {
  const s = (history.state as any)?.comentario;
  return s ?? null;
});

const formatFechaLarga = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const verHistorial = () => {
  if (!comentario.value?.arete) return;
  router.push(`/bovinos/detalle/${comentario.value.arete}`);
};
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 40px;
}

.mt { margin-top: 14px; }

.empty-box {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
}

/* Animal header */
.animal-card { border-left: 4px solid #006d37; }
.animal-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.animal-icon {
  font-size: 32px;
  color: #006d37;
  flex-shrink: 0;
}
.animal-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 2px;
}
.animal-nombre {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.animal-arete {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 6px;
}

/* Info rows */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.info-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}
.info-icon.vet  { color: #7c3aed; }
.info-icon.fecha { color: #0284c7; }

.info-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 2px;
}
.info-valor {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.info-cedula {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0;
}
.divider {
  height: 1px;
  background: #f3f4f6;
  margin: 14px 0;
}

/* Comentario */
.comentario-card { border-top: 3px solid #7c3aed; }
.com-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 10px;
}
.com-titulo-icon { font-size: 18px; }
.com-texto {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}
</style>
