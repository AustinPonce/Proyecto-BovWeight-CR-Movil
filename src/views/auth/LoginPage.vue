<template>
  <ion-page>
    <ion-content fullscreen>

      <div class="background">
        <div class="overlay"></div>

        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLHZzUCL65MTgsR8GnutZns0aYdALA_kC4LqZEa0XVDkoRW4ws6UkiB4WMtT2BxwI1K_5iOaGcT8xpyWdnHEK9N2M6bDf7uNdUAE33hqtnNPqvTpBk-temHuiMUiIQtEZNb_lhKKZai4nEFOktu80B8f1TeCxL0sEwLFd6b-Ql7jLUxgOoi8OL7vC2lHV-qvMR8Wopcoq5W50R7z9NYrreOdbNCP9u32a7DmKccP_woZ3afcqagUm6NyqYmhlZKyvuEN-P08DM6MgK"
          alt="Ganadería"
        />
      </div>

      <div class="login-container">

        <ion-card class="login-card">

          <ion-card-content>

            <div class="header">

              <div class="logo">
                <ion-icon
                  :icon="leafOutline"
                  class="logo-icon"
                />
              </div>

              <h1>Ganadería</h1>

              <p>Iniciar sesión</p>

            </div>

            <BaseInput
              v-model="formulario.email"
              label="Correo electrónico"
              placeholder="ejemplo@correo.com"
              type="email"
            />

            <BaseInput
              v-model="formulario.password"
              label="Contraseña"
              placeholder="••••••••"
              type="password"
            />

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="forgot-password">

              <ion-button
                fill="clear"
                size="small"
                @click="router.push('/forgot-password')"
              >
                ¿Olvidaste tu contraseña?
              </ion-button>

            </div>

            <BaseButton 
              @click="login"
              :disabled="loading"
            >
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </BaseButton>

            <div class="register-link">

              <span>
                ¿No tienes una cuenta?
              </span>

              <router-link to="/register">
                Regístrate
              </router-link>

            </div>

          </ion-card-content>

        </ion-card>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/vue';

import { leafOutline } from 'ionicons/icons';

import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import api from '@/services/api';

const router = useRouter();

// ============= ESTADO REACTIVO =============
const formulario = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

// ============= FUNCIONES =============
const login = async () => {
  error.value = '';
  
  if (!formulario.email || !formulario.password) {
    error.value = 'Por favor completa todos los campos';
    return;
  }

  loading.value = true;
  try {
    // 🔌 API - Endpoint: POST /api/login
    // Enviar: email (o cédula) y password
    // Respuesta esperada: { token: "..." }
    const response = await api.post('/login', {
      email: formulario.email,
      password: formulario.password
      // Si tu API usa 'cedula' en lugar de 'email', cambia aquí:
      // cedula: formulario.email,
      // password: formulario.password
    });

    // Guardar token en localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      console.log('✅ Login exitoso');
      router.push('/dashboard');
    } else {
      error.value = 'No se recibió token del servidor';
    }
    
  } catch (err: any) {
    console.error('Error en login:', err);
    error.value = err.response?.data?.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.background {
  position: fixed;
  inset: 0;
}

.background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, .25);
  z-index: 1;
}

.login-container {
  position: relative;
  z-index: 10;

  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;

  border-radius: 24px;
  background: #ffffff !important;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  width: 64px;
  height: 64px;

  border-radius: 50%;

  background: #d1fae5;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 16px;
}

.logo-icon {
  font-size: 32px;
  color: #006d37;
}

.header h1 {
  color: #006d37;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.header p {
  color: #374151;
}

.forgot-password {
  text-align: right;
  margin: 12px 0;
}

.forgot-password ion-button {
  color: #006d37;
}

.register-link {
  margin-top: 24px;
  padding-top: 16px;

  border-top: 1px solid #e5e7eb;

  text-align: center;
}

.register-link span {
  color: #374151;
}

.register-link a {
  margin-left: 6px;
  color: #006d37;
  font-weight: 600;
  text-decoration: none;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
}
</style>