<template>
  <ion-page>
    <ion-content fullscreen>

      <div class="register-container">
        <ion-card class="register-card">
          <ion-card-content>

            <div class="header">
              <div class="logo">
                <ion-icon :icon="personAddOutline" class="logo-icon" />
              </div>
              <h1>Crear Cuenta</h1>
              <p>Únete a la gestión ganadera inteligente</p>
            </div>

            <BaseInput
              v-model="formulario.cedula"
              label="Cédula *"
              placeholder="Ej: 123456789"
            />

            <BaseInput
              v-model="formulario.nombre"
              label="Nombre completo *"
              placeholder="Ingrese su nombre"
            />

            <BaseInput
              v-model="formulario.correo"
              label="Correo electrónico *"
              placeholder="ejemplo@correo.com"
              type="email"
            />

            <div class="field-group">
              <label class="field-label">Tipo de usuario *</label>
              <select v-model="formulario.id_tipo_usuario" class="native-select">
                <option :value="0" disabled>Seleccione un rol</option>
                <option v-for="t in TIPOS_USUARIO" :key="t.id" :value="t.id">
                  {{ t.nombre }}
                </option>
              </select>
            </div>

            <BaseInput
              v-model="formulario.contrasena"
              label="Contraseña *"
              placeholder="Mínimo 8 caracteres"
              type="password"
            />

            <BaseInput
              v-model="formulario.contrasena_confirmation"
              label="Confirmar contraseña *"
              placeholder="Repite la contraseña"
              type="password"
            />

            <div v-if="error" class="error-message">{{ error }}</div>

            <BaseButton @click="registrar" :disabled="loading">
              {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
            </BaseButton>

            <div class="login-link">
              <span>¿Ya tienes una cuenta?</span>
              <router-link to="/login">Iniciar sesión</router-link>
            </div>

          </ion-card-content>
        </ion-card>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonIcon, useIonRouter } from '@ionic/vue';
import { personAddOutline } from 'ionicons/icons';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { TIPOS_USUARIO } from '@/services/catalogos';

const router = useIonRouter();
const authStore = useAuthStore();

const formulario = reactive({
  cedula: '',
  nombre: '',
  correo: '',
  id_tipo_usuario: 0,
  contrasena: '',
  contrasena_confirmation: '',
});

const loading = ref(false);
const error = ref('');

const registrar = async () => {
  error.value = '';
  if (!formulario.cedula || !formulario.nombre || !formulario.correo ||
      !formulario.contrasena || !formulario.id_tipo_usuario) {
    error.value = 'Por favor completa todos los campos obligatorios';
    return;
  }
  if (formulario.contrasena !== formulario.contrasena_confirmation) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  if (formulario.contrasena.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  loading.value = true;
  try {
    const data = await authService.registrar({
      cedula: formulario.cedula,
      nombre: formulario.nombre,
      correo: formulario.correo,
      contrasena: formulario.contrasena,
      contrasena_confirmation: formulario.contrasena_confirmation,
      id_tipo_usuario: formulario.id_tipo_usuario,
    });
    authStore.setToken(data.token);
    authStore.setUsuario(data.usuario);
    router.navigate('/dashboard', 'root');
  } catch (err: any) {
    const errors = err.response?.data?.errors;
    if (errors) {
      const primer = Object.values(errors)[0] as string[];
      error.value = primer[0] || 'Error al registrar';
    } else {
      error.value = err.response?.data?.message || 'Error al crear la cuenta';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafb;
}
.register-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  background: #ffffff !important;
}
.header {
  text-align: center;
  margin-bottom: 20px;
}
.logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.logo-icon {
  font-size: 32px;
  color: #006d37;
}
.header h1 {
  font-size: 26px;
  font-weight: bold;
  color: #006d37;
  margin-bottom: 4px;
}
.header p {
  color: #374151;
  font-size: 14px;
}
.field-group {
  margin: 12px 0;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.native-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
  background: #fff;
  appearance: auto;
}
.native-select:focus {
  outline: none;
  border-color: #006d37;
}
.login-link {
  margin-top: 20px;
  text-align: center;
}
.login-link span {
  color: #374151;
}
.login-link a {
  margin-left: 6px;
  color: #006d37;
  font-weight: 600;
  text-decoration: none;
}
.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 10px 0;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
}
</style>
