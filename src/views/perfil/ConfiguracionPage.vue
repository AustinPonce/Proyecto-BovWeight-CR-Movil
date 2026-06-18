<template>
  <ion-page>

    <AppHeader title="Configuración" :show-back="true" default-href="/perfil" />

    <ion-content>
      <div class="container">

        <h3>Seguridad</h3>
        <ion-list>

          <ion-item button @click="mostrarFormPwd = !mostrarFormPwd">
            <ion-icon :icon="lockClosedOutline" slot="start" color="success" />
            <ion-label>Cambiar contraseña</ion-label>
            <ion-icon slot="end" :icon="mostrarFormPwd ? chevronDownOutline : chevronForwardOutline" />
          </ion-item>

        </ion-list>

        <!-- Formulario cambiar contraseña -->
        <div v-if="mostrarFormPwd" class="pwd-form">
          <BaseInput
            v-model="formPwd.actual"
            label="Contraseña actual *"
            :type="mostrarTexto ? 'text' : 'password'"
            placeholder="Tu contraseña actual"
          />
          <BaseInput
            v-model="formPwd.nueva"
            label="Nueva contraseña *"
            :type="mostrarTexto ? 'text' : 'password'"
            placeholder="Mínimo 8 caracteres"
          />
          <BaseInput
            v-model="formPwd.confirmacion"
            label="Confirmar nueva contraseña *"
            :type="mostrarTexto ? 'text' : 'password'"
            placeholder="Repite la nueva contraseña"
          />

          <ion-item lines="none" class="toggle-item">
            <ion-label>Mostrar contraseñas</ion-label>
            <ion-toggle slot="end" v-model="mostrarTexto" color="success" />
          </ion-item>

          <div v-if="errorPwd" class="error-msg">{{ errorPwd }}</div>
          <div v-if="exitoPwd" class="exito-msg">¡Contraseña actualizada correctamente!</div>

          <div class="pwd-btns">
            <button class="btn-cancel" @click="cerrarFormPwd">Cancelar</button>
            <button class="btn-save" @click="cambiarContrasena" :disabled="guardandoPwd">
              {{ guardandoPwd ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </div>

        <h3>Preferencias</h3>
        <ion-list>

          <ion-item>
            <ion-icon :icon="notificationsOutline" slot="start" color="success" />
            <ion-label>Notificaciones</ion-label>
            <ion-toggle
              slot="end"
              v-model="configuracion.notificacionesActivadas"
              color="success"
            />
          </ion-item>

          <ion-item>
            <ion-icon :icon="moonOutline" slot="start" color="success" />
            <ion-label>Modo oscuro</ion-label>
            <ion-toggle
              slot="end"
              v-model="configuracion.modoOscuro"
              color="success"
              @ionChange="toggleModoOscuro"
            />
          </ion-item>

        </ion-list>

        <h3>Acerca de</h3>
        <ion-list>

          <ion-item>
            <ion-icon :icon="informationCircleOutline" slot="start" color="success" />
            <ion-label>
              <h2>BovWeight CR</h2>
              <p>Versión 1.0.0 · IF7100 UCR</p>
            </ion-label>
          </ion-item>

        </ion-list>

      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonToggle
} from '@ionic/vue';
import {
  lockClosedOutline, notificationsOutline, moonOutline,
  informationCircleOutline, chevronForwardOutline, chevronDownOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BaseInput from '@/components/BaseInput.vue';
import { authService } from '@/services/authService';

// ── Cambiar contraseña ─────────────────────────────────────
const mostrarFormPwd  = ref(false);
const mostrarTexto    = ref(false);
const guardandoPwd    = ref(false);
const errorPwd        = ref('');
const exitoPwd        = ref(false);
const formPwd = reactive({ actual: '', nueva: '', confirmacion: '' });

const cerrarFormPwd = () => {
  mostrarFormPwd.value = false;
  formPwd.actual = '';
  formPwd.nueva = '';
  formPwd.confirmacion = '';
  errorPwd.value = '';
  exitoPwd.value = false;
};

const cambiarContrasena = async () => {
  errorPwd.value = '';
  exitoPwd.value = false;

  if (!formPwd.actual || !formPwd.nueva || !formPwd.confirmacion) {
    errorPwd.value = 'Completa todos los campos.';
    return;
  }
  if (formPwd.nueva.length < 8) {
    errorPwd.value = 'La nueva contraseña debe tener al menos 8 caracteres.';
    return;
  }
  if (formPwd.nueva !== formPwd.confirmacion) {
    errorPwd.value = 'Las contraseñas no coinciden.';
    return;
  }

  guardandoPwd.value = true;
  try {
    await authService.cambiarContrasena(
      formPwd.actual,
      formPwd.nueva,
      formPwd.confirmacion,
    );
    exitoPwd.value = true;
    formPwd.actual = '';
    formPwd.nueva = '';
    formPwd.confirmacion = '';
    setTimeout(() => {
      exitoPwd.value = false;
      mostrarFormPwd.value = false;
    }, 2500);
  } catch (e: any) {
    errorPwd.value = e.response?.data?.message || 'No se pudo cambiar la contraseña.';
  } finally {
    guardandoPwd.value = false;
  }
};

// ── Preferencias ───────────────────────────────────────────
const savedDark = localStorage.getItem('modoOscuro') === 'true';
if (savedDark) document.documentElement.classList.add('ion-palette-dark');

const configuracion = reactive({
  notificacionesActivadas: true,
  modoOscuro: savedDark,
});

const toggleModoOscuro = () => {
  document.documentElement.classList.toggle('ion-palette-dark', configuracion.modoOscuro);
  document.body.classList.toggle('dark', configuracion.modoOscuro);
  localStorage.setItem('modoOscuro', String(configuracion.modoOscuro));
};
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 80px;
}

h3 {
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

h3:first-child { margin-top: 0; }

.pwd-form {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
}

.toggle-item {
  --min-height: 40px;
  --padding-start: 0;
  margin-bottom: 8px;
}

.error-msg {
  background: #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 10px;
}

.exito-msg {
  background: #dcfce7;
  border-radius: 8px;
  padding: 10px 12px;
  color: #166534;
  font-size: 13px;
  margin-bottom: 10px;
}

.pwd-btns {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel {
  background: #f3f4f6; color: #374151;
  border: 1px solid #d1d5db; border-radius: 8px;
  padding: 7px 16px; font-size: 13px; cursor: pointer;
}

.btn-save {
  background: #006d37; color: #fff;
  border: none; border-radius: 8px;
  padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
}

.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
