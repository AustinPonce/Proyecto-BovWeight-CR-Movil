<template>
  <ion-page>

    <AppHeader
      title="Perfil"
    />

    <ion-content fullscreen>

      <div class="background"></div>

      <div class="container">

        <ion-card class="profile-card">

          <ion-card-content>

            <div class="profile-header">

              <div class="avatar-container">

                <img
                  :src="usuario.avatar || 'https://via.placeholder.com/128'"
                  class="avatar"
                />

                <div class="verified-badge">
                  <ion-icon :icon="checkmarkCircle" />
                </div>

              </div>

              <h2>{{ usuario.nombre }}</h2>

              <p>{{ usuario.email }}</p>

              <ion-button color="success" @click="editarPerfil">
                <ion-icon
                  slot="start"
                  :icon="createOutline"
                />
                Editar Perfil
              </ion-button>

            </div>

          </ion-card-content>

        </ion-card>

        <div class="stats-grid">

          <ion-card>
            <ion-card-content>

              <ion-icon
                :icon="serverOutline"
                class="stat-icon purple"
              />

              <p class="stat-label">
                BOVINOS
              </p>

              <h3 class="stat-value">
                {{ usuario.totalBovinos }}
              </h3>

            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-content>

              <ion-icon
                :icon="leafOutline"
                class="stat-icon green"
              />

              <p class="stat-label">
                FINCAS
              </p>

              <h3 class="stat-value">
                {{ usuario.totalFincas }}
              </h3>

            </ion-card-content>
          </ion-card>

        </div>

        <ion-list class="menu-list">

          <ion-item button @click="verHistorial">
            <ion-icon
              slot="start"
              :icon="timeOutline"
              color="success"
            />

            <ion-label>
              Historial de Actividad
            </ion-label>

            <ion-icon
              slot="end"
              :icon="chevronForwardOutline"
            />
          </ion-item>

          <ion-item button @click="router.push('/configuracion')">
            <ion-icon
              slot="start"
              :icon="notificationsOutline"
              color="success"
            />

            <ion-label>
              Configuración
            </ion-label>

            <ion-icon
              slot="end"
              :icon="chevronForwardOutline"
            />
          </ion-item>

          <ion-item button color="danger" @click="cerrarSesion">
            <ion-icon
              slot="start"
              :icon="logOutOutline"
              color="danger"
            />

            <ion-label>
              Cerrar Sesión
            </ion-label>
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
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';

import {
  checkmarkCircle,
  createOutline,
  serverOutline,
  leafOutline,
  timeOutline,
  notificationsOutline,
  chevronForwardOutline,
  logOutOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  totalBovinos: number;
  totalFincas: number;
}

const usuario = ref<Usuario>({
  id: '',
  nombre: 'Austin Ponce',
  email: 'ponceaustin@gmail.com',
  totalBovinos: 0,
  totalFincas: 0
});

// ============= FUNCIONES =============
const editarPerfil = () => {
  // TODO: API - Endpoint: PUT /api/usuario/perfil
  // Permitir edición de: nombre, email, avatar
  console.log('📡 [PENDING API] PUT /api/usuario/perfil - Actualizar perfil');
};

const verHistorial = () => {
  // TODO: API - Endpoint: GET /api/usuario/historial
  // Obtener: historial de actividades del usuario
  console.log('📡 [PENDING API] GET /api/usuario/historial - Cargar historial de actividad');
};

const cerrarSesion = () => {
  // TODO: API - Endpoint: POST /api/auth/logout
  // Hacer logout: limpiar token, redirigir a login
  localStorage.removeItem('authToken');
  router.push('/login');
};

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/usuario/perfil
  // Obtener: datos del perfil del usuario
  // Reemplazar los valores en ref(usuario)
  // Campos esperados: id, nombre, email, avatar, totalBovinos, totalFincas
  console.log('📡 [PENDING API] GET /api/usuario/perfil - Cargar datos del perfil');
});
</script>

<style scoped>
.background {
  position: fixed;
  inset: 0;
  background-color: #ffffff;
}

.container {
  position: relative;
  z-index: 10;
  padding: 16px;
  background-color: #ffffff;
}

.profile-card {
  border-radius: 20px;
  background: #ffffff !important;
}

.profile-header {
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 128px;
  margin: auto;
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  right: 0;
  bottom: 0;

  background: #16a34a;
  color: white;

  width: 34px;
  height: 34px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-grid {
  margin-top: 16px;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.green {
  color: #16a34a;
}

.purple {
  color: #9333ea;
}

.stat-label {
  color: #6b7280;
  font-size: 12px;
  margin-top: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.menu-list {
  margin-top: 16px;
  border-radius: 16px;
  overflow: hidden;
}
</style>
