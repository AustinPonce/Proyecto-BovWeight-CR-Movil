<template> 

  <ion-page> 

    <AppHeader title="Mis Fincas" /> 

 

    <ion-content> 

      <div v-if="loading" class="loading-container"> 

        <ion-spinner color="success" name="crescent"></ion-spinner> 

        <p>Cargando fincas...</p> 

      </div> 

 

      <div v-else class="container"> 

        <BaseCard v-if="fincas.length === 0" class="empty-card"> 

          <div class="icon-circle"> 

            <ion-icon :icon="businessOutline" class="farm-icon" /> 

          </div> 

 

          <h2>Comienza tu viaje</h2> 

          <p>No hay fincas registradas en tu cuenta actualmente.</p> 

 

          <BaseButton @click="crearFinca"> 

            Registrar Finca 

          </BaseButton> 

        </BaseCard> 

 

        <ion-list v-else class="fincas-list"> 

          <ion-item  

            v-for="finca in fincas" 

            :key="finca.id" 

            button 

            @click="router.push(`/fincas/detalle/${finca.id}`)" 

          > 

            <ion-avatar slot="start"> 

              <img :src="finca.imagen || 'https://via.placeholder.com/40'" alt="Finca" /> 

            </ion-avatar> 

            <ion-label> 

              <h2>{{ finca.nombre }}</h2> 

              <p>{{ finca.ubicacion }} | {{ finca.hectareas }} ha</p> 

            </ion-label> 

            <ion-badge slot="end" color="success"> 

              {{ finca.bovinosCount }} 

            </ion-badge> 

          </ion-item> 

        </ion-list> 

      </div> 

    </ion-content> 

  </ion-page> 

</template> 

 

<script setup lang="ts"> 

import { ref, onMounted } from 'vue'; 

import { useRouter } from 'vue-router'; 

import { 

  IonPage, 

  IonContent, 

  IonIcon, 

  IonList, 

  IonItem, 

  IonLabel, 

  IonAvatar, 

  IonBadge, 

  IonSpinner // Importamos el Spinner nativo de Ionic 

} from '@ionic/vue'; 

 

import { businessOutline } from 'ionicons/icons'; 

 

import AppHeader from '@/components/AppHeader.vue'; 

import BaseCard from '@/components/BaseCard.vue'; 

import BaseButton from '@/components/BaseButton.vue'; 

 

const router = useRouter(); 

 

// ============= ESTADO REACTIVO ============= 

interface Finca { 

  id: string; 

  nombre: string; 

  ubicacion: string; 

  hectareas: number; 

  imagen?: string; 

  bovinosCount: number; 

} 

 

const fincas = ref<Finca[]>([]); 

const loading = ref(true); // Iniciamos en true para evitar el pestañeo involuntario 

 

// ============= FUNCIONES ============= 

const crearFinca = async () => { 

  // TODO: API - Endpoint: POST /api/fincas 

  console.log('📡 [PENDING API] POST /api/fincas - Crear nueva finca'); 

}; 

 

// ============= CICLO DE VIDA ============= 

onMounted(async () => { 

  try { 

    loading.value = true; 

    // TODO: API - Endpoint: GET /api/fincas 

    console.log('📡 [PENDING API] GET /api/fincas - Cargar lista de fincas'); 

     

    // Simulación de carga/espera de la API (puedes borrar este setTimeout al conectar el Axios/Fetch) 

    await new Promise(resolve => setTimeout(resolve, 800)); 

     

    // Ejemplo de asignación cuando conectes el backend: 

    // fincas.value = response.data; 

     

  } catch (error) { 

    console.error('Error cargando las fincas:', error); 

  } finally { 

    // Apagamos el estado de carga pase lo que pase 

    loading.value = false; 

  } 

}); 

</script> 

 

<style scoped> 

.container { 

  padding: 16px; 

} 

 

/* Contenedor del Spinner centrado */ 

.loading-container { 

  display: flex; 

  flex-direction: column; 

  justify-content: center; 

  align-items: center; 

  min-height: 50vh; 

  color: #666; 

} 

 

/* Forzamos que solo el contenido de la tarjeta vacía se centre */ 

.empty-card { 

  text-align: center; 

  padding: 20px 16px; 

} 

 

.icon-circle { 

  width: 96px; 

  height: 96px; 

  border-radius: 50%; 

  background: #dcfce7; 

  display: flex; 

  align-items: center; 

  justify-content: center; 

  margin: 0 auto 20px; 

} 

 

.farm-icon { 

  font-size: 48px; 

  color: #006d37; 

} 

 

/* Aseguramos que los textos de la lista mantengan alineación natural a la izquierda */ 

.fincas-list { 

  text-align: left; 

} 

</style>