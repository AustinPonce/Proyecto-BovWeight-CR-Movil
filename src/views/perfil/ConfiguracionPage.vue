<template>
  <ion-page>

    <AppHeader
      title="Configuración"
    />

    <ion-content>

      <div class="container">

        <h3>Seguridad</h3>
        <ion-list>

          <ion-item button @click="cambiarContrasena">
            <ion-icon
              :icon="lockClosedOutline"
              slot="start"
              color="success"
            />
            <ion-label>Cambiar contraseña</ion-label>
            <ion-icon
              slot="end"
              :icon="chevronForwardOutline"
            />
          </ion-item>

        </ion-list>

        <h3>Preferencias</h3>
        <ion-list>

          <ion-item @click="toggleNotificaciones">
            <ion-icon
              :icon="notificationsOutline"
              slot="start"
              color="success"
            />
            <ion-label>Notificaciones</ion-label>
            <ion-toggle
              slot="end"
              v-model="configuracion.notificacionesActivadas"
            />
          </ion-item>

          <ion-item @click="toggleModoOscuro">
            <ion-icon
              :icon="moonOutline"
              slot="start"
              color="success"
            />
            <ion-label>Modo oscuro</ion-label>
            <ion-toggle
              slot="end"
              v-model="configuracion.modoOscuro"
            />
          </ion-item>

        </ion-list>

        <h3>Acerca de</h3>
        <ion-list>

          <ion-item button @click="verInfo">
            <ion-icon
              :icon="informationCircleOutline"
              slot="start"
              color="success"
            />
            <ion-label>Información de la aplicación</ion-label>
            <ion-icon
              slot="end"
              :icon="chevronForwardOutline"
            />
          </ion-item>

        </ion-list>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle
} from '@ionic/vue';

import {
  lockClosedOutline,
  notificationsOutline,
  moonOutline,
  informationCircleOutline,
  chevronForwardOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
const configuracion = reactive({
  notificacionesActivadas: true,
  modoOscuro: false,
  idiomaActual: 'es'
});

// ============= FUNCIONES =============
const cambiarContrasena = async () => {
  // TODO: API - Endpoint: PUT /api/usuario/cambiar-contrasena
  // Mostrar modal para cambiar contraseña
  console.log('📡 [PENDING API] PUT /api/usuario/cambiar-contrasena - Cambiar contraseña');
};

const toggleNotificaciones = async () => {
  // TODO: API - Endpoint: PUT /api/usuario/configuracion/notificaciones
  // Actualizar preferencia de notificaciones
  console.log(`📡 [PENDING API] PUT /api/usuario/configuracion/notificaciones - ${configuracion.notificacionesActivadas ? 'Activar' : 'Desactivar'} notificaciones`);
};

const toggleModoOscuro = async () => {
  // TODO: Implementar lógica de modo oscuro localmente (no requiere API)
  // Aplicar tema oscuro/claro a la aplicación
  console.log(`🌙 Modo oscuro: ${configuracion.modoOscuro ? 'Activado' : 'Desactivado'}`);
};

const verInfo = async () => {
  // TODO: Mostrar información de versión, desarrollador, etc.
  console.log('ℹ️ Información de la aplicación: v1.0.0');
};

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/usuario/configuracion
  // Obtener: preferencias actuales del usuario
  // Reemplazar los valores en ref(configuracion)
  console.log('📡 [PENDING API] GET /api/usuario/configuracion - Cargar configuración');
});
</script>

<style scoped>
.container {
  padding: 16px;
}

h3 {
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

h3:first-child {
  margin-top: 0;
}
</style>
