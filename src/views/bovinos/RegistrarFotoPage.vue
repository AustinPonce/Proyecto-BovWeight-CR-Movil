<template>
  <ion-page>
    <AppHeader title="Historial de Peso" />

    <ion-content>
      <div class="container">
        <BaseCard>
          <h2>{{ bovino?.nombre || 'Cargando...' }} {{ bovino?.id ? `(#${bovino.id})` : '' }}</h2>
          <p>Peso Actual</p>
          <h1 class="peso">
            {{ bovinoActual?.peso ? `${bovinoActual.peso} kg` : '-- kg' }}
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
            v-for="(registro, index) in historialPeso"
            :key="registro.id"
          >
            <ion-label>
              <h2>{{ formatearFecha(registro.fecha) }}</h2>
              <p>{{ registro.peso }} kg</p>
            </ion-label>
            <ion-badge slot="end" :color="obtenerColorBadge(registro.peso, index)">
              {{ calcularDiferencia(registro.peso, index) }}
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

// ============= CONFIGURACIÓN DEL ROUTER =============
const route = useRoute();
const bovinoId = computed(() => route.params.id as string);

// ============= INTERFACES DE TIPOS =============
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

// ============= ESTADO REACTIVO =============
const bovino = ref<Bovino>({
  id: '',
  nombre: '',
  rebano: '',
  peso: 0
});

const historialPeso = ref<RegistroPeso[]>([]);

// ============= PROPIEDADES COMPUTADAS =============
// El primer elemento de la lista representa el pesaje más reciente de la API
const bovinoActual = computed(() => {
  if (historialPeso.value.length === 0) return null;
  return historialPeso.value[0];
});

// ============= MÉTODOS Y LÓGICA =============
const formatearFecha = (fecha: string) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString();
};

/**
 * Calcula la ganancia o pérdida de peso comparando el registro actual
 * con el registro cronológicamente anterior (index + 1)
 */
const calcularDiferencia = (pesoActual: number, index: number) => {
  // Si es el último elemento del arreglo, representa el pesaje inicial registrado
  if (index === historialPeso.value.length - 1) {
    return 'Inicial';
  }

  const pesoAnterior = historialPeso.value[index + 1]?.peso;
  if (pesoAnterior === undefined) return '';

  const diff = pesoActual - pesoAnterior;
  return diff >= 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
};

/**
 * Devuelve un color semántico para el badge según el rendimiento del animal
 */
const obtenerColorBadge = (pesoActual: number, index: number) => {
  if (index === historialPeso.value.length - 1) return 'medium'; // Color gris para el registro base
  
  const pesoAnterior = historialPeso.value[index + 1]?.peso;
  if (pesoAnterior === undefined) return 'primary';

  return pesoActual - pesoAnterior >= 0 ? 'success' : 'danger';
};

const agregarPeso = async () => {
  // TODO: API - Endpoint: POST /api/bovinos/:id/peso
  console.log(`📡 [PENDING API] POST /api/bovinos/${bovinoId.value}/peso - Registrar nuevo peso`);
};

// ============= CICLO DE VIDA (CARGA DE DATOS) =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/bovinos/:id
  console.log(`📡 [PENDING API] GET /api/bovinos/${bovinoId.value} - Cargar datos del bovino`);

  // TODO: API - Endpoint: GET /api/bovinos/:id/historial-peso
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
