<template>
  <ion-page>

    <AppHeader title="Perfil" />

    <ion-content fullscreen>

      <div class="container">

        <ion-card class="profile-card">
          <ion-card-content>
            <div class="profile-header">
              <div class="avatar-container">
                <div class="avatar-circle">
                  <ion-icon :icon="personCircleOutline" class="avatar-icon" />
                </div>
              </div>
              <h2>{{ usuario.nombre }}</h2>
              <p class="email">{{ usuario.correo }}</p>
              <p class="rol">{{ usuario.tipoUsuario?.nombre_tipo || '' }}</p>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="stats-grid">
          <ion-card>
            <ion-card-content>
              <ion-icon :icon="pawOutline" class="stat-icon green" />
              <p class="stat-label">BOVINOS</p>
              <h3 class="stat-value">{{ totalBovinos }}</h3>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-icon :icon="businessOutline" class="stat-icon blue" />
              <p class="stat-label">FINCAS</p>
              <h3 class="stat-value">{{ totalFincas }}</h3>
            </ion-card-content>
          </ion-card>
        </div>

        <ion-list class="menu-list">

          <ion-item button @click="router.push('/configuracion')">
            <ion-icon slot="start" :icon="settingsOutline" color="success" />
            <ion-label>Configuración</ion-label>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item button @click="cerrarSesion">
            <ion-icon slot="start" :icon="logOutOutline" color="danger" />
            <ion-label color="danger">Cerrar Sesión</ion-label>
          </ion-item>

        </ion-list>

      </div>

    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonCard, IonCardContent,
  IonIcon, IonList, IonItem, IonLabel
} from '@ionic/vue';
import {
  personCircleOutline, pawOutline, businessOutline,
  settingsOutline, chevronForwardOutline, logOutOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import { useAuthStore } from '@/stores/authStore';
import { bovinoService } from '@/services/bovinoService';
import { fincaService } from '@/services/fincaService';

const router = useRouter();
const authStore = useAuthStore();

const usuario = reactive({
  nombre: '...',
  correo: '',
  tipoUsuario: null as any,
});

const totalBovinos = ref('0');
const totalFincas = ref('0');

const cerrarSesion = async () => {
  await authStore.logout();
  router.replace('/login');
};

onMounted(async () => {
  const data = await authStore.cargarUsuario();
  if (data) {
    usuario.nombre = data.nombre;
    usuario.correo = data.correo;
    usuario.tipoUsuario = data.tipoUsuario;
  }

  try {
    const [bovRes, fincaRes] = await Promise.all([
      bovinoService.getAnimales(),
      fincaService.getFincas(),
    ]);
    totalBovinos.value = String(bovRes.meta?.total ?? bovRes.data.length);
    totalFincas.value = String(fincaRes.meta?.total ?? fincaRes.data.length);
  } catch { /* ignorar */ }
});
</script>

<style scoped>
.container {
  padding: 16px;
}
.profile-card {
  border-radius: 20px;
}
.profile-header {
  text-align: center;
  padding: 8px 0;
}
.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-icon {
  font-size: 60px;
  color: #006d37;
}
.email {
  color: #6b7280;
  margin: 4px 0;
  font-size: 14px;
}
.rol {
  color: #006d37;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}
.stats-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.stat-icon {
  font-size: 28px;
}
.green { color: #16a34a; }
.blue { color: #2563eb; }
.stat-label {
  color: #6b7280;
  font-size: 11px;
  margin-top: 6px;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 4px 0 0;
}
.menu-list {
  margin-top: 16px;
  border-radius: 16px;
  overflow: hidden;
}
</style>
