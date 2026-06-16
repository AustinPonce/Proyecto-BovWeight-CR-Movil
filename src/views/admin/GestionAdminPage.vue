<template>
  <ion-page>

    <AppHeader title="Panel Administrativo" />

    <ion-content>
      <div class="container">

        <div v-if="cargando" class="loading-box">
          <ion-spinner color="success" name="crescent" />
          <p>Cargando...</p>
        </div>

        <template v-else>

          <!-- Badge de rol -->
          <div class="rol-banner">
            <ion-icon :icon="shieldCheckmarkOutline" class="shield-icon" />
            <div>
              <p class="rol-label">Sesión activa como</p>
              <h2 class="rol-nombre">Administrador</h2>
            </div>
          </div>

          <!-- Estadísticas globales -->
          <h3 class="section-title">Resumen del Sistema</h3>
          <div class="stats-grid">
            <StatCard title="Total Fincas" :value="totalFincas" />
            <StatCard title="Total Bovinos" :value="totalBovinos" />
          </div>

          <!-- Gestión de usuarios y catálogos -->
          <h3 class="section-title">Administración</h3>
          <ion-list class="menu-list">

            <ion-item button @click="router.push('/admin/usuarios')">
              <ion-icon slot="start" :icon="peopleOutline" color="success" />
              <ion-label>
                <h2>Gestión de Usuarios</h2>
                <p>Ver, buscar y gestionar cuentas de usuario</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" color="medium" />
            </ion-item>

            <ion-item button @click="router.push('/admin/catalogos')">
              <ion-icon slot="start" :icon="listOutline" color="success" />
              <ion-label>
                <h2>Catálogos</h2>
                <p>Medicamentos, razas y otros catálogos del sistema</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" color="medium" />
            </ion-item>

            <ion-item button @click="router.push('/veterinario/asignar')">
              <ion-icon slot="start" :icon="medkitOutline" color="success" />
              <ion-label>
                <h2>Asignar Veterinarios</h2>
                <p>Asignar veterinarios a fincas del sistema</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" color="medium" />
            </ion-item>

          </ion-list>

          <!-- Inventario y reportes -->
          <h3 class="section-title">Inventario y Reportes</h3>
          <ion-list class="menu-list">

            <ion-item button @click="router.push('/fincas')">
              <ion-icon slot="start" :icon="businessOutline" color="success" />
              <ion-label>
                <h2>Todas las Fincas</h2>
                <p>Ver y gestionar fincas del sistema</p>
              </ion-label>
              <ion-badge slot="end" color="success">{{ totalFincas }}</ion-badge>
            </ion-item>

            <ion-item button @click="router.push('/bovinos')">
              <ion-icon slot="start" :icon="pawOutline" color="success" />
              <ion-label>
                <h2>Todos los Bovinos</h2>
                <p>Ver y gestionar animales del sistema</p>
              </ion-label>
              <ion-badge slot="end" color="success">{{ totalBovinos }}</ion-badge>
            </ion-item>

            <ion-item button @click="router.push('/admin/reportes')">
              <ion-icon slot="start" :icon="barChartOutline" color="success" />
              <ion-label>
                <h2>Reportes Globales</h2>
                <p>Exportar reportes PDF/Excel del sistema completo</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" color="medium" />
            </ion-item>

          </ion-list>

          <!-- Info -->
          <ion-card class="info-card">
            <ion-card-content>
              <ion-icon :icon="informationCircleOutline" class="info-icon" />
              <p>Como administrador tienes visibilidad completa de todas las fincas, animales y pesajes registrados en el sistema.</p>
            </ion-card-content>
          </ion-card>

        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonCard, IonCardContent, IonSpinner,
  useIonRouter
} from '@ionic/vue';
import {
  shieldCheckmarkOutline, businessOutline, pawOutline,
  barChartOutline, informationCircleOutline, peopleOutline,
  listOutline, medkitOutline, chevronForwardOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import StatCard from '@/components/StatCard.vue';
import { useAuthStore } from '@/stores/authStore';
import { bovinoService } from '@/services/bovinoService';
import { fincaService } from '@/services/fincaService';
import { ROL_ADMIN } from '@/composables/useRol';

const router = useIonRouter();
const authStore = useAuthStore();

const cargando = ref(false);
const totalFincas = ref('0');
const totalBovinos = ref('0');

onMounted(async () => {
  if (!authStore.usuario) {
    await authStore.cargarUsuario();
  }

  if (authStore.usuario?.id_tipo_usuario !== ROL_ADMIN) {
    router.navigate('/dashboard', 'root');
    return;
  }

  cargando.value = true;
  try {
    const [fincaRes, bovRes] = await Promise.all([
      fincaService.getFincas(),
      bovinoService.getAnimales(),
    ]);
    totalFincas.value = String(fincaRes.meta?.total ?? fincaRes.data?.length ?? 0);
    totalBovinos.value = String(bovRes.meta?.total ?? bovRes.data?.length ?? 0);
  } catch { /* mostrar ceros */ }
  finally { cargando.value = false; }
});
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 80px;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #6b7280;
}

.rol-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #006d37;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #ffffff;
}

.shield-icon {
  font-size: 40px;
  color: #86efac;
  flex-shrink: 0;
}

.rol-label {
  margin: 0;
  font-size: 12px;
  color: #d1fae5;
  letter-spacing: 0.05em;
}

.rol-nombre {
  margin: 2px 0 0;
  font-size: 22px;
  font-weight: bold;
  color: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.menu-list {
  border-radius: 16px;
  overflow: hidden;
}

.info-card {
  margin-top: 20px;
  border-radius: 14px;
  --background: #f0fdf4;
}

.info-icon {
  font-size: 24px;
  color: #16a34a;
  display: block;
  margin-bottom: 8px;
}

.info-card ion-card-content p {
  color: #166534;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}
</style>