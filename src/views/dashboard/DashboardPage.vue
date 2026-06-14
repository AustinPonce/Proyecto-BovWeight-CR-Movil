<template>
  <ion-page>

    <AppHeader
      title="Ganadería"
    />

    <ion-content fullscreen>

      <div class="background"></div>

      <div class="content">

        <ion-card class="welcome-card">

          <ion-card-content>

            <div class="welcome-header">

              <div class="user-info">

                <div class="avatar">
                  <ion-icon :icon="personOutline" />
                </div>

                <div>
                  <p class="subtitle">Bienvenido</p>
                  <h2>{{ userName }}</h2>
                </div>

              </div>

              <ion-button
                fill="clear"
                size="small"
                @click="router.push('/perfil')"
              >
                <ion-icon :icon="settingsOutline" />
              </ion-button>

            </div>

          </ion-card-content>

        </ion-card>

        <StatCard
          :title="'Estado del Ganado'"
          :value="totalGanado"
          :badge="estadoGanado"
        />

        <h2 class="section-title">
          Accesos Rápidos
        </h2>

        <div class="grid">

          <QuickAccessCard
            title="Registrar Bovino por Foto"
            :icon="cameraOutline"
            @click="router.push('/bovinos/registrar-foto')"
          />

          <QuickAccessCard
            title="Registrar Bovino Manual"
            :icon="documentTextOutline"
            @click="router.push('/bovinos/registrar-manual')"
          />

          <QuickAccessCard
            title="Mis Bovinos"
            :icon="pawOutline"
            @click="router.push('/bovinos')"
          />

          <QuickAccessCard
            title="Mis Fincas"
            :icon="locationOutline"
            @click="router.push('/fincas')"
          />

        </div>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/vue';

import { useRouter } from 'vue-router';

import {
  personOutline,
  settingsOutline,
  cameraOutline,
  documentTextOutline,
  pawOutline,
  locationOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import QuickAccessCard from '@/components/QuickAccessCard.vue';
import StatCard from '@/components/StatCard.vue';

const router = useRouter();

// ============= ESTADO REACTIVO =============
const userName = ref('Austin Ponce');
const totalGanado = ref('124');
const estadoGanado = ref('Sano');

// ============= CICLO DE VIDA =============
onMounted(async () => {
  // TODO: API - Endpoint: GET /api/dashboard/resumen
  // Obtener: nombre de usuario, total de ganado, estado general
  // Reemplazar los valores en ref(userName), ref(totalGanado), ref(estadoGanado)
  console.log('📡 [PENDING API] GET /api/dashboard/resumen - Cargar datos del dashboard');
});
</script>

<style scoped>
.background {
  position: fixed;
  inset: 0;

  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLHZzUCL65MTgsR8GnutZns0aYdALA_kC4LqZEa0XVDkoRW4ws6UkiB4WMtT2BxwI1K_5iOaGcT8xpyWdnHEK9N2M6bDf7uNdUAE33hqtnNPqvTpBk-temHuiMUiIQtEZNb_lhKKZai4nEFOktu80B8f1TeCxL0sEwLFd6b-Ql7jLUxgOoi8OL7vC2lHV-qvMR8Wopcoq5W50R7z9NYrreOdbNCP9u32a7DmKccP_woZ3afcqagUm6NyqYmhlZKyvuEN-P08DM6MgK');
  background-size: cover;
  background-position: center;
  opacity: .12;
}

.content {
  position: relative;
  z-index: 10;
  padding: 16px;
}

.welcome-card {
  border-radius: 18px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;

  border-radius: 50%;
  background: #e5e7eb;

  display: flex;
  justify-content: center;
  align-items: center;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.section-title {
  margin: 24px 0 16px;
  color: #374151;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
</style>