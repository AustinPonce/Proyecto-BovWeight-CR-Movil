<template> 

  <ion-page> 

 

    <AppHeader 

      title="Detalle de Finca" 

    /> 

 

    <ion-content> 

 

      <div class="container"> 

 

        <BaseCard> 

 

          <h2>{{ finca.nombre }}</h2> 

 

          <p> 

            {{ finca.ubicacion }} 

          </p> 

 

          <ion-chip color="success"> 

            {{ finca.hectareas }} Hectáreas 

          </ion-chip> 

 

        </BaseCard> 

 

        <BaseCard class="mt"> 

 

          <h3>Bovinos Registrados</h3> 

 

          <h1>{{ finca.bovinosCount }}</h1> 

 

        </BaseCard> 

 

        <BaseButton  

          class="mt" 

          @click="editarFinca" 

        > 

          Editar Finca 

        </BaseButton> 

 

      </div> 

 

    </ion-content> 

 

  </ion-page> 

</template> 

 

<script setup lang="ts"> 

import { ref, computed, onMounted } from 'vue'; 

import { useRoute } from 'vue-router'; 

import { 

  IonPage, 

  IonContent, 

  IonChip 

} from '@ionic/vue'; 

 

import AppHeader from '@/components/AppHeader.vue'; 

import BaseCard from '@/components/BaseCard.vue'; 

import BaseButton from '@/components/BaseButton.vue'; 

 

const route = useRoute(); 

const fincaId = computed(() => route.params.id as string); 

 

// ============= ESTADO REACTIVO ============= 

interface Finca { 

  id: string; 

  nombre: string; 

  ubicacion: string; 

  hectareas: number; 

  bovinosCount: number; 

} 

 

const finca = ref<Finca>({ 

  id: '', 

  nombre: '', 

  ubicacion: '', 

  hectareas: 0, 

  bovinosCount: 0 

}); 

 

// ============= FUNCIONES ============= 

const editarFinca = async () => { 

  // TODO: API - Endpoint: PUT /api/fincas/:id 

  // Actualizar datos de la finca 

  console.log(`📡 [PENDING API] PUT /api/fincas/${fincaId.value} - Actualizar finca`); 

}; 

 

// ============= CICLO DE VIDA ============= 

onMounted(async () => { 

  // TODO: API - Endpoint: GET /api/fincas/:id 

  // Obtener: datos de la finca específica 

  // Reemplazar los valores en ref(finca) 

  // Campos esperados: id, nombre, ubicacion, hectareas, bovinosCount 

  console.log(`📡 [PENDING API] GET /api/fincas/${fincaId.value} - Cargar datos de la finca`); 

}); 

</script> 

 

<style scoped> 

.container { 

  padding: 16px; 

} 

 

.mt { 

  margin-top: 16px; 

} 

</style> 