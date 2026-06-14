<template>
  <ion-page>

    <AppHeader
      title="Registrar Vaca"
    />

    <ion-content>

      <div class="container">

        <BaseCard>

          <h2>General</h2>

          <BaseInput
            v-model="formulario.arete"
            label="Número de Arete"
            placeholder="Ej: 12345"
          />

          <BaseInput
            v-model="formulario.nombre"
            label="Nombre del Bovino"
            placeholder="Ej: Bella"
          />

          <BaseInput
            v-model="formulario.raza"
            label="Raza"
            placeholder="Ej: Brahman, Angus"
          />

          <BaseInput
            v-model="formulario.edad"
            label="Edad (años)"
            type="number"
            placeholder="Ej: 3"
          />

          <BaseInput
            v-model="formulario.sexo"
            label="Sexo"
            placeholder="Ej: Hembra, Macho"
          />

        </BaseCard>

        <BaseCard class="mt">

          <h2>Medidas</h2>

          <BaseInput
            v-model="formulario.peso"
            label="Peso (kg)"
            type="number"
            placeholder="Ej: 450"
          />

          <BaseInput
            v-model="formulario.largo"
            label="Largo del cuerpo (cm)"
            type="number"
            placeholder="Ej: 165"
          />

          <BaseInput
            v-model="formulario.altura"
            label="Altura (cm)"
            type="number"
            placeholder="Ej: 145"
          />

          <BaseInput
            v-model="formulario.perimetro"
            label="Perímetro torácico (cm)"
            type="number"
            placeholder="Ej: 210"
          />

        </BaseCard>

        <BaseCard class="mt">

          <h2>Ubicación</h2>

          <BaseInput
            v-model="formulario.finca"
            label="Finca"
            placeholder="Seleccionar finca"
          />

          <BaseInput
            v-model="formulario.fecha"
            type="date"
            label="Fecha"
          />

        </BaseCard>

        <BaseButton 
          color="success"
          expand="block"
          class="mt"
          @click="guardarBovino"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Guardar Bovino' }}
        </BaseButton>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent
} from '@ionic/vue';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
const formulario = reactive({
  arete: '',
  nombre: '',
  raza: '',
  edad: '',
  sexo: '',
  peso: '',
  largo: '',
  altura: '',
  perimetro: '',
  finca: '',
  fecha: new Date().toISOString().split('T')[0]
});

const loading = ref(false);

// ============= FUNCIONES =============
const guardarBovino = async () => {
  // Validación básica
  if (!formulario.arete || !formulario.raza || !formulario.peso) {
    console.error('Por favor completa los campos obligatorios');
    return;
  }

  loading.value = true;
  try {
    // TODO: API - Endpoint: POST /api/bovinos/registrar-manual
    // Enviar: todos los datos del formulario
    // Campos: arete, nombre, raza, edad, sexo, peso, largo, altura, perimetro, finca, fecha
    // Después: redirigir a /bovinos
    console.log('📡 [PENDING API] POST /api/bovinos/registrar-manual - Registrar bovino manualmente');
    console.log('Datos a enviar:', formulario);
    
    // Descomenta cuando tengas la API lista:
    // const response = await api.post('/bovinos/registrar-manual', formulario);
    // console.log('Bovino creado:', response.data);
    
    // Redirigir tras éxito
    router.push('/bovinos');
  } catch (error) {
    console.error('Error al guardar bovino:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  padding: 16px;
}

.mt {
  margin-top: 16px;
}
</style>
