<template>
  <ion-page>

    <AppHeader title="BovWeight CR" />

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
              <ion-button fill="clear" size="small" @click="router.push('/perfil')">
                <ion-icon :icon="settingsOutline" />
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="stats-row">
          <StatCard title="Total Bovinos" :value="totalBovinos" />
          <StatCard title="Total Fincas" :value="totalFincas" />
        </div>

        <h2 class="section-title">Accesos Rápidos</h2>

        <div class="grid">
          <QuickAccessCard
            title="Registrar por Foto"
            :icon="cameraOutline"
            @click="router.push('/bovinos/registrar-foto')"
          />
          <QuickAccessCard
            title="Registrar Manual"
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

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/vue';
import {
  personOutline, settingsOutline, cameraOutline,
  documentTextOutline, pawOutline, locationOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import QuickAccessCard from '@/components/QuickAccessCard.vue';
import StatCard from '@/components/StatCard.vue';
import { useAuthStore } from '@/stores/authStore';
import { bovinoService } from '@/services/bovinoService';
import { fincaService } from '@/services/fincaService';

const router = useRouter();
const authStore = useAuthStore();

const userName = ref('...');
const totalBovinos = ref('0');
const totalFincas = ref('0');

onMounted(async () => {
  // Cargar usuario si no está en store
  if (!authStore.usuario) {
    await authStore.cargarUsuario();
  }
  userName.value = authStore.usuario?.nombre || 'Usuario';

  // Cargar estadísticas en paralelo
  try {
    const [bovRes, fincaRes] = await Promise.all([
      bovinoService.getAnimales(),
      fincaService.getFincas(),
    ]);
    totalBovinos.value = String(bovRes.meta?.total ?? bovRes.data.length);
    totalFincas.value = String(fincaRes.meta?.total ?? fincaRes.data.length);
  } catch {
    // No bloquear el dashboard si falla
  }
});
</script>

<style scoped>
.background {
  position: fixed;
  inset: 0;
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLHZzUCL65MTgsR8GnutZns0aYdALA_kC4LqZEa0XVDkoRW4ws6UkiB4WMtT2BxwI1K_5iOaGcT8xpyWdnHEK9N2M6bDf7uNdUAE33hqtnNPqvTpBk-temHuiMUiIQtEZNb_lhKKZai4nEFOktu80B8f1TeCxL0sEwLFd6b-Ql7jLUxgOoi8OL7vC2lHV-qvMR8Wopcoq5W50R7z9NYrreOdbNCP9u32a7DmKccP_woZ3afcqagUm6NyqYmhlZKyvuEN-P08DM6MgK');
  background-size: cover;
  background-position: center;
  opacity: .10;
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
  background: #d1fae5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #006d37;
}
.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 13px;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.section-title {
  margin: 24px 0 16px;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
</style>
