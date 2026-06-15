<template>
  <ion-page>

    <AppHeader title="Reportes" :show-back="true" default-href="/dashboard" />

    <ion-content>

      <div class="container">

        <ion-card>
          <ion-card-content>

            <h2 class="title">
              Resumen Mensual
            </h2>

            <p>
              Monitorea el desempeño de tu ganadería de manera eficiente.
            </p>

          </ion-card-content>
        </ion-card>

        <ion-list>

          <ion-item button @click="verReporte('peso')">
            <ion-icon
              slot="start"
              :icon="barChartOutline"
              color="success"
            />

            <ion-label>
              <h2>Reporte de peso</h2>
              <p>Análisis detallado de ganancia de masa corporal.</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="verReporte('produccion')">
            <ion-icon
              slot="start"
              :icon="trendingUpOutline"
              color="tertiary"
            />

            <ion-label>
              <h2>Producción</h2>
              <p>Métricas de producción láctea y derivados.</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="verReporte('historial')">
            <ion-icon
              slot="start"
              :icon="calendarOutline"
              color="tertiary"
            />

            <ion-label>
              <h2>Historial</h2>
              <p>Registro cronológico de eventos y manejos.</p>
            </ion-label>
          </ion-item>

        </ion-list>

      </div>

    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/vue';

import {
  barChartOutline,
  trendingUpOutline,
  calendarOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';

// ============= FUNCIONES =============
const verReporte = async (tipo: 'peso' | 'produccion' | 'historial') => {
  // TODO: API - Endpoint: GET /api/reportes/:tipo
  // Obtener: datos del reporte específico según el tipo
  // Tipos: peso, produccion, historial
  console.log(`📡 [PENDING API] GET /api/reportes/${tipo} - Cargar reporte de ${tipo}`);
};

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/reportes/resumen
  // Obtener: resumen mensual de reportes
  console.log('📡 [PENDING API] GET /api/reportes/resumen - Cargar resumen de reportes');
});
</script>

<style scoped>
.container {
  padding: 16px;
}

.title {
  color: #006d37;
  font-weight: bold;
}
</style>