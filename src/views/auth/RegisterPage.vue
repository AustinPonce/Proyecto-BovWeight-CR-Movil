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

      <div class="register-container">

        <ion-card class="register-card">

          <ion-card-content>

            <div class="header">

              <div class="logo">
                <ion-icon
                  :icon="personAddOutline"
                  class="logo-icon"
                />
              </div>

              <h1>Crear Cuenta</h1>

              <p>
                Únete a la gestión ganadera inteligente
              </p>

            </div>

            <BaseInput
              v-model="formulario.nombre"
              label="Nombre completo"
              placeholder="Ingrese su nombre"
            />

            <BaseInput
              v-model="formulario.correo"
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

            <BaseInput
              v-model="formulario.confirmarPassword"
              label="Confirmar contraseña"
              placeholder="••••••••"
              type="password"
            />

            <BaseButton 
              @click="registrar"
              :disabled="loading"
            >
              {{ loading ? 'Registrando...' : 'Registrarse' }}
            </BaseButton>

            <div class="login-link">

              <span>
                ¿Ya tienes una cuenta?
              </span>

              <router-link to="/login">
                Iniciar sesión
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
  IonIcon
} from '@ionic/vue';

import {
  personAddOutline
} from 'ionicons/icons';

import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
const formulario = reactive({
  nombre: '',
  correo: '',
  password: '',
  confirmarPassword: ''
});

const loading = ref(false);

// ============= FUNCIONES =============
const registrar = async () => {
  // Validaciones básicas
  if (!formulario.nombre || !formulario.correo || !formulario.password) {
    console.error('Por favor completa todos los campos');
    return;
  }

  if (formulario.password !== formulario.confirmarPassword) {
    console.error('Las contraseñas no coinciden');
    return;
  }

  loading.value = true;
  try {
    // TODO: API - Endpoint: POST /api/auth/register
    // Enviar: nombre, correo, password
    // Respuesta: token de autenticación
    // Guardar token en localStorage y redirigir a /dashboard
    console.log('📡 [PENDING API] POST /api/auth/register - Registrar nuevo usuario');
    console.log('Datos a enviar:', {
      nombre: formulario.nombre,
      correo: formulario.correo,
      password: '***'
    });
    
    // Después de registro exitoso:
    // localStorage.setItem('authToken', response.token);
    // router.push('/dashboard');
    
    // Mientras la API no esté lista, simulamos el registro (solo para desarrollo)
    setTimeout(() => {
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      router.push('/dashboard');
    }, 500);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.background {
  position: fixed;
  inset: 0;
  background-color: #ffffff;
}

.background img {
  display: none;
}

.overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 1;
}

.register-container {
  position: relative;
  z-index: 10;

  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
  background-color: #ffffff;
}

.register-card {
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
  font-size: 30px;
  font-weight: bold;
  color: #006d37;
  margin-bottom: 8px;
}

.header p {
  color: #374151;
}

.login-link {
  margin-top: 24px;
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
</style>