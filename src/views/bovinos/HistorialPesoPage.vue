<template>
  <ion-page>

    <AppHeader
      title="Historial de Peso"
    />

    <ion-content>

      <div class="container">

        <BaseCard>

          <h2>{{ bovino.nombre }} (#{{ bovino.id }})</h2>

          <p>Peso Actual</p>

          <h1 class="peso">
            {{ bovinoActual?.peso }} kg
          </h1>

          <ion-button 
            color="success" 
            expand="block"
            @click="agregarPeso"
          >
            + Registrar Nuevo Peso
          </ion-button>

        </BaseCard>

        <h3 class="mt">Historial</h3>

        <ion-list>

          <ion-item 
            v-for="registro in historialPeso"
            :key="registro.id"
          >
            <ion-label>
              <h2>{{ formatearFecha(registro.fecha) }}</h2>
              <p>{{ registro.peso }} kg</p>
            </ion-label>
            <ion-badge slot="end" color="primary">
              {{ calcularDiferencia(registro.peso) }}
            </ion-badge>
          </ion-item>

        </ion-list>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonBadge
} from '@ionic/vue';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';

const route = useRoute();
const bovinoId = computed(() => route.params.id as string);

// ============= ESTADO REACTIVO =============
interface Bovino {
  id: string;
  nombre: string;
  rebano: string;
  peso: number;
}

interface RegistroPeso {
  id: string;
  peso: number;
  fecha: string;
}

const bovino = ref<Bovino>({
  id: '',
  nombre: '',
  rebano: '',
  peso: 0
});

const historialPeso = ref<RegistroPeso[]>([]);

// ============= PROPIEDADES COMPUTADAS =============
const bovinoActual = computed(() => {
  if (historialPeso.value.length === 0) return null;
  return historialPeso.value[0]; // El primero es el más reciente
});

// ============= FUNCIONES =============
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString();
};

const calcularDiferencia = (peso: number) => {
  if (!bovinoActual.value) return '';
  const diff = peso - bovinoActual.value.peso;
  return diff > 0 ? `+${diff}kg` : `${diff}kg`;
};

const agregarPeso = async () => {
  // TODO: API - Endpoint: POST /api/bovinos/:id/peso
  // Crear nuevo registro de peso para el bovino
  // Recargar historialPeso después
  console.log(`📡 [PENDING API] POST /api/bovinos/${bovinoId.value}/peso - Registrar nuevo peso`);
};

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/bovinos/:id
  // Obtener: datos del bovino específico
  // Reemplazar los valores en ref(bovino)
  console.log(`📡 [PENDING API] GET /api/bovinos/${bovinoId.value} - Cargar datos del bovino`);

  // TODO: API - Endpoint: GET /api/bovinos/:id/historial-peso
  // Obtener: historial de pesos del bovino
  // Reemplazar los valores en ref(historialPeso)
  // Campos esperados: id, peso, fecha
  console.log(`📡 [PENDING API] GET /api/bovinos/${bovinoId.value}/historial-peso - Cargar historial de pesos`);
});
</script>

<style scoped>
.container {
  padding: 16px;
}

.mt {
  margin-top: 16px;
}

.peso {
  color: #006d37;
  font-size: 42px;
  font-weight: bold;
}
</style>
