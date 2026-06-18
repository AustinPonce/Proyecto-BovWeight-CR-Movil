<template>
  <ion-page>

    <AppHeader title="BovWeight CR" />

    <ion-content fullscreen>
      <div class="content">

        <!-- Bienvenida -->
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
            <!-- Badge de rol -->
            <div class="rol-badge" :class="rolClass">
              <ion-icon :icon="rolIcon" />
              {{ nombreRol }}
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Estadísticas -->
        <div class="stats-row">
          <StatCard :title="isAdmin ? 'Total Bovinos' : 'Mis Bovinos'" :value="totalBovinos" />
          <StatCard :title="isAdmin ? 'Total Fincas' : isVeterinario ? 'Fincas Asignadas' : 'Mis Fincas'" :value="totalFincas" />
        </div>

        <!-- Panel Admin (solo Administrador) -->
        <div v-if="isAdmin" class="admin-banner" @click="router.push('/admin')">
          <ion-icon :icon="shieldCheckmarkOutline" class="admin-icon" />
          <div>
            <p class="admin-label">Acceso exclusivo</p>
            <h3>Panel Administrativo</h3>
          </div>
          <ion-icon :icon="chevronForwardOutline" class="arrow-icon" />
        </div>

        <!-- Accesos Rápidos para Ganadero -->
        <template v-if="!isAdmin && !isVeterinario">
          <h2 class="section-title">Accesos Rápidos</h2>
          <div class="grid">
            <QuickAccessCard title="Mis Fincas" :icon="locationOutline" @click="router.push('/fincas')" />
            <QuickAccessCard title="Mis Animales" :icon="pawOutline" @click="router.push('/bovinos')" />
            <QuickAccessCard title="Registrar Pesaje" :icon="cameraOutline" @click="router.push('/bovinos/registrar-pesaje')" />
            <QuickAccessCard title="Historial de Pesajes" :icon="barChartOutline" @click="router.push('/reportes')" />
            <QuickAccessCard title="Transacciones" :icon="swapHorizontalOutline" @click="router.push('/transacciones')" />
            <QuickAccessCard title="Calculadora de Dosis" :icon="medkitOutline" @click="router.push('/dosis')" />
          </div>
          <div class="aviso-legal">
            <ion-icon :icon="informationCircleOutline" />
            <span>Las estimaciones de peso son orientativas. No sustituyen la báscula oficial para transacciones comerciales legales (compra/venta de ganado en kilogramos en pie).</span>
          </div>
        </template>

        <!-- Accesos Rápidos para Veterinario -->
        <template v-if="isVeterinario">
          <h2 class="section-title">Accesos Rápidos</h2>
          <div class="grid">
            <QuickAccessCard title="Fincas Asignadas" :icon="businessOutline" @click="router.push('/fincas')" />
            <QuickAccessCard title="Bovinos Asignados" :icon="pawOutline" @click="router.push('/bovinos')" />
            <QuickAccessCard title="Calculadora de Dosis" :icon="medkitOutline" @click="router.push('/dosis')" />
          </div>
          <div class="aviso-legal">
            <ion-icon :icon="informationCircleOutline" />
            <span>Las estimaciones de peso son orientativas. No sustituyen la báscula oficial para transacciones comerciales legales (compra/venta de ganado en kilogramos en pie).</span>
          </div>
        </template>

        <!-- Accesos Rápidos para Administrador -->
        <template v-if="isAdmin">
          <h2 class="section-title">Gestión del Sistema</h2>
          <div class="grid">
            <QuickAccessCard
              title="Usuarios"
              :icon="peopleOutline"
              @click="router.push('/admin/usuarios')"
            />
            <QuickAccessCard
              title="Catálogos"
              :icon="listOutline"
              @click="router.push('/admin/catalogos')"
            />
            <QuickAccessCard
              title="Todas las Fincas"
              :icon="businessOutline"
              @click="router.push('/fincas')"
            />
            <QuickAccessCard
              title="Reportes Globales"
              :icon="barChartOutline"
              @click="router.push('/admin/reportes')"
            />
          </div>
        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonButton, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue';
import {
  personOutline, settingsOutline, cameraOutline,
  pawOutline, locationOutline, shieldCheckmarkOutline, chevronForwardOutline,
  medkitOutline, leafOutline,
  peopleOutline, listOutline, businessOutline, barChartOutline,
  swapHorizontalOutline, informationCircleOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import QuickAccessCard from '@/components/QuickAccessCard.vue';
import StatCard from '@/components/StatCard.vue';
import { useAuthStore } from '@/stores/authStore';
import { bovinoService } from '@/services/bovinoService';
import { fincaService } from '@/services/fincaService';
import { useRol } from '@/composables/useRol';

const router = useIonRouter();
const authStore = useAuthStore();
const { isAdmin, isVeterinario, nombreRol } = useRol();

const userName = ref('...');
const totalBovinos = ref('0');
const totalFincas = ref('0');

const rolClass = computed(() => ({
  'rol-admin': isAdmin.value,
  'rol-vet': isVeterinario.value,
  'rol-ganadero': !isAdmin.value && !isVeterinario.value,
}));

const rolIcon = computed(() =>
  isAdmin.value ? shieldCheckmarkOutline
  : isVeterinario.value ? medkitOutline
  : leafOutline
);

onIonViewWillEnter(async () => {
  userName.value = '...';
  totalBovinos.value = '0';
  totalFincas.value = '0';

  await authStore.cargarUsuario();
  userName.value = authStore.usuario?.nombre || 'Usuario';

  try {
    const [bovRes, fincaRes] = await Promise.all([
      bovinoService.getAnimales(),
      fincaService.getFincas(),
    ]);
    totalBovinos.value = String(bovRes.meta?.total ?? bovRes.data?.length ?? 0);
    totalFincas.value = String(fincaRes.meta?.total ?? fincaRes.data?.length ?? 0);
  } catch { /* no bloquear dashboard */ }
});
</script>

<style scoped>
.content {
  padding: 16px;
  padding-bottom: 80px;
}

.welcome-card { border-radius: 18px; }

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info { display: flex; gap: 12px; align-items: center; }

.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: #d1fae5; display: flex;
  justify-content: center; align-items: center;
  font-size: 24px; color: #006d37;
}

.subtitle { color: #6b7280; margin: 0; font-size: 13px; }

.rol-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.rol-admin { background: #dcfce7; color: #166534; }
.rol-ganadero { background: #dbeafe; color: #1e40af; }
.rol-vet { background: #fef9c3; color: #854d0e; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

/* Banner Admin */
.admin-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #006d37;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 16px;
  cursor: pointer;
  color: #ffffff;
}

.admin-icon { font-size: 32px; color: #86efac; flex-shrink: 0; }
.admin-label { margin: 0; font-size: 11px; color: #d1fae5; }
.admin-banner h3 { margin: 2px 0 0; font-size: 16px; font-weight: 600; color: #ffffff; }
.arrow-icon { margin-left: auto; font-size: 20px; color: #86efac; }

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

/* Aviso modo lectura */
.vet-notice {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
  padding: 12px 14px;
  margin-top: 16px;
  color: #854d0e;
  font-size: 13px;
}

.vet-notice ion-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.vet-notice p { margin: 0; line-height: 1.4; }

.aviso-legal {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 14px;
  margin-top: 16px;
  color: #92400e;
  font-size: 12px;
  line-height: 1.4;
}
.aviso-legal ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
</style>