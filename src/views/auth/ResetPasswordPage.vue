<template>
  <ion-page>

    <AppHeader title="Nueva Contraseña" :show-back="true" default-href="/forgot-password" />

    <ion-content class="ion-padding">
      <div class="container">

        <div class="info-box">
          <ion-icon :icon="mailOutline" class="mail-icon" />
          <h2>Restablecer contraseña</h2>
          <p>Ingresa el código que recibiste en tu correo y tu nueva contraseña.</p>
        </div>

        <BaseInput
          v-model="form.email"
          label="Correo electrónico *"
          type="email"
          placeholder="ejemplo@correo.com"
        />

        <BaseInput
          v-model="form.token"
          label="Código de verificación *"
          placeholder="Código recibido por correo"
        />

        <BaseInput
          v-model="form.password"
          label="Nueva contraseña *"
          :type="mostrarPwd ? 'text' : 'password'"
          placeholder="Mínimo 8 caracteres"
        />

        <BaseInput
          v-model="form.password_confirmation"
          label="Confirmar nueva contraseña *"
          :type="mostrarPwd ? 'text' : 'password'"
          placeholder="Repite la contraseña"
        />

        <ion-item lines="none" class="toggle-item">
          <ion-label>Mostrar contraseñas</ion-label>
          <ion-toggle slot="end" v-model="mostrarPwd" color="success" />
        </ion-item>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="exito" class="exito-msg">
          ¡Contraseña actualizada! Redirigiendo al inicio de sesión...
        </div>

        <ion-button
          expand="block"
          color="success"
          class="btn-submit"
          :disabled="cargando || exito"
          @click="enviar"
        >
          {{ cargando ? 'Actualizando...' : 'Actualizar Contraseña' }}
        </ion-button>

        <p class="footer-link" @click="router.navigate('/login', 'root')">
          Volver al inicio de sesión
        </p>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon,
  IonItem, IonLabel, IonToggle, useIonRouter
} from '@ionic/vue';
import { mailOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseInput from '@/components/BaseInput.vue';
import { authService } from '@/services/authService';

const router = useIonRouter();
const cargando = ref(false);
const error = ref('');
const exito = ref(false);
const mostrarPwd = ref(false);

const form = reactive({
  email: '',
  token: '',
  password: '',
  password_confirmation: '',
});

const enviar = async () => {
  error.value = '';

  if (!form.email || !form.token || !form.password || !form.password_confirmation) {
    error.value = 'Completa todos los campos.';
    return;
  }
  if (form.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }
  if (form.password !== form.password_confirmation) {
    error.value = 'Las contraseñas no coinciden.';
    return;
  }

  cargando.value = true;
  try {
    await authService.resetPassword({
      email: form.email,
      token: form.token,
      password: form.password,
      password_confirmation: form.password_confirmation,
    });
    exito.value = true;
    setTimeout(() => router.navigate('/login', 'root'), 2500);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'No se pudo restablecer la contraseña.';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 440px;
  margin: 0 auto;
  padding: 16px 0 80px;
}

.info-box {
  text-align: center;
  margin-bottom: 28px;
  padding: 0 8px;
}

.mail-icon {
  font-size: 52px;
  color: #006d37;
  display: block;
  margin: 0 auto 12px;
}

.info-box h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.info-box p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.toggle-item {
  --min-height: 44px;
  --padding-start: 0;
  margin-bottom: 8px;
}

.error-msg {
  background: #fee2e2;
  border-radius: 10px;
  padding: 12px 14px;
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 12px;
}

.exito-msg {
  background: #dcfce7;
  border-radius: 10px;
  padding: 12px 14px;
  color: #166534;
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-submit {
  margin-top: 8px;
}

.footer-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #006d37;
  cursor: pointer;
  text-decoration: underline;
}
</style>
