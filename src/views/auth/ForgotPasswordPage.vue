<template>
  <ion-page>

    <AppHeader title="Recuperar Contraseña" :show-back="true" default-href="/login" />

    <ion-content>
      <div class="container">

        <BaseCard>

          <div class="icon-row">
            <div class="icon-circle">
              <ion-icon :icon="lockClosedOutline" />
            </div>
          </div>

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

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="button-container">
            <BaseButton
              @click="enviarEnlace"
              :disabled="loading"
            >
              {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
            </BaseButton>
          </div>

          <div v-if="mensajeExito" class="mensaje-exito">
            <ion-icon :icon="checkmarkCircleOutline" />
            <p>{{ mensajeExito }}</p>
          </div>

        </BaseCard>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/vue';
import { lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { authService } from '@/services/authService';

const router = useIonRouter();

const correo = ref('');
const loading = ref(false);
const error = ref('');
const mensajeExito = ref('');

const enviarEnlace = async () => {
  error.value = '';
  mensajeExito.value = '';

  if (!correo.value.trim()) {
    error.value = 'Por favor ingresa tu correo electrónico';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo.value)) {
    error.value = 'Ingresa un correo electrónico válido';
    return;
  }

  loading.value = true;
  try {
    await authService.forgotPassword(correo.value.trim());
    mensajeExito.value = 'Si el correo está registrado, recibirás un enlace en tu bandeja de entrada.';
    setTimeout(() => router.push('/login'), 3500);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'No se pudo enviar el correo. Verifica la dirección e intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  padding: 16px;
}

.icon-row {
  text-align: center;
  margin-bottom: 16px;
}

.icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #d1fae5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #006d37;
}

h2 {
  text-align: center;
  color: #111827;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.description {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
}

.button-container {
  margin-top: 20px;
}

.error-msg {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  color: #991b1b;
  font-size: 13px;
}

.mensaje-exito {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 14px;
  margin-top: 16px;
  color: #166534;
}

.mensaje-exito ion-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 1px;
}

.mensaje-exito p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
</style>