<template>
  <ion-page>

    <AppHeader title="Mis Bovinos" />

    <ion-content>

      <div class="container">

        <BaseInput
          v-model="buscar"
          placeholder="Buscar ID, Rebaño o Arete..."
        />

        <!-- Mostrar mensaje vacío si no hay bovinos -->
        <BaseCard v-if="bovinos.length === 0" class="empty-card">

          <ion-icon
            :icon="leafOutline"
            class="empty-icon"
          />

          <h2>Sin registros aún</h2>

          <p>
            No hay ganado registrado actualmente en su inventario.
          </p>

          <BaseButton @click="router.push('/bovinos/registrar-manual')">
            Agregar Bovino
          </BaseButton>

        </BaseCard>

        <!-- Listado de bovinos -->
        <ion-list v-else>
          <ion-item 
            v-for="bovino in bovinosFiltrados" 
            :key="bovino.id"
            button
            @click="router.push(`/bovinos/detalle/${bovino.id}`)"
          >
            <ion-avatar slot="start">
              <img :src="bovino.foto || 'https://via.placeholder.com/40'" />
            </ion-avatar>
            <ion-label>
              <h2>{{ bovino.id }} - {{ bovino.nombre }}</h2>
              <p>Rebaño: {{ bovino.rebano }} | Peso: {{ bovino.peso }}kg</p>
            </ion-label>
            <ion-badge slot="end" :color="bovino.estado === 'activo' ? 'success' : 'warning'">
              {{ bovino.estado }}
            </ion-badge>
          </ion-item>
        </ion-list>

        <div class="stats">

          <StatCard
            title="ACTIVOS"
            :value="totalActivos.toString()"
          />

          <StatCard
            title="CUARENTENA"
            :value="totalCuarentena.toString()"
          />

        </div>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge
} from '@ionic/vue';

import { leafOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import StatCard from '@/components/StatCard.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
interface Bovino {
  id: string;
  nombre: string;
  rebano: string;
  peso: number;
  foto?: string;
  estado: 'activo' | 'cuarentena' | 'vendido';
}

const buscar = ref('');
const bovinos = ref<Bovino[]>([]);

// ============= PROPIEDADES COMPUTADAS =============
const bovinosFiltrados = computed(() => {
  return bovinos.value.filter(bovino =>
    bovino.id.toLowerCase().includes(buscar.value.toLowerCase()) ||
    bovino.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
    bovino.rebano.toLowerCase().includes(buscar.value.toLowerCase())
  );
});

const totalActivos = computed(() => 
  bovinos.value.filter(b => b.estado === 'activo').length
);

const totalCuarentena = computed(() =>
  bovinos.value.filter(b => b.estado === 'cuarentena').length
);

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/bovinos
  // Obtener: lista de bovinos del usuario
  // Reemplazar los valores en ref(bovinos)
  // Campos esperados: id, nombre, rebano, peso, foto, estado
  console.log('📡 [PENDING API] GET /api/bovinos - Cargar lista de bovinos');
  
  // Ejemplo de datos para desarrollo (eliminar cuando API esté lista)
  // bovinos.value = [
  //   { id: 'BOV001', nombre: 'Bella', rebano: 'Rebaño A', peso: 450, estado: 'activo' },
  //   { id: 'BOV002', nombre: 'Negrita', rebano: 'Rebaño B', peso: 380, estado: 'cuarentena' }
  // ];
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

.empty-icon {
  font-size: 72px;
  color: #9ca3af;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
  margin-top: 16px;
}
</style>
