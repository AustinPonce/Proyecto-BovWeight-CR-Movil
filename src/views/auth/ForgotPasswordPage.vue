<template>
  <ion-page>

    <AppHeader
      title="Recuperar Contraseña"
    />

    <ion-content>

      <div class="container">

        <BaseCard>

          <h2>¿Olvidaste tu contraseña?</h2>

          <p class="description">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <BaseInput
            v-model="correo"
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
          />

          <div class="button-container">
            <BaseButton 
              @click="enviarEnlace"
              :disabled="loading"
            >
              {{ loading ? 'Enviando...' : 'Enviar enlace' }}
            </BaseButton>
          </div>

          <p v-if="mensajeExito" class="mensaje-exito">
            ✓ {{ mensajeExito }}
          </p>

        </BaseCard>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
const correo = ref('');
const loading = ref(false);
const mensajeExito = ref('');

// ============= FUNCIONES =============
const enviarEnlace = async () => {
  if (!correo.value) {
    console.error('Por favor ingresa tu correo');
    return;
  }

  loading.value = true;
  mensajeExito.value = '';
  
  try {
    // TODO: API - Endpoint: POST /api/auth/forgot-password
    // Enviar: correo
    // Respuesta: confirmación de envío de enlace
    console.log('📡 [PENDING API] POST /api/auth/forgot-password - Enviar enlace de recuperación');
    console.log('Correo:', correo.value);
    
    // Después de envío exitoso:
    // mensajeExito.value = 'Enlace enviado a tu correo';
    // setTimeout(() => router.push('/login'), 2000);
    
    // Simulación mientras la API no esté lista
    setTimeout(() => {
      mensajeExito.value = 'Enlace de recuperación enviado a tu correo';
      setTimeout(() => router.push('/login'), 2000);
    }, 1000);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  padding: 16px;
  background-color: #ffffff;
}

.description {
  color: #374151;
  margin-bottom: 20px;
}

.button-container {
  margin-top: 20px;
}

.mensaje-exito {
  color: #16a34a;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}
</style>