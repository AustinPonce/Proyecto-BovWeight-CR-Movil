<template>
  <ion-page>
    <AppHeader title="Catálogos del Sistema" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- Aviso: gestión desde backend -->
        <div class="aviso">
          <ion-icon :icon="informationCircleOutline" />
          <span>La creación y edición de medicamentos se realiza desde el panel web del administrador.</span>
        </div>

        <!-- Sección Medicamentos -->
        <div class="section-header">
          <h3>Medicamentos activos</h3>
          <button class="reload-btn" @click="cargar">
            <ion-icon :icon="refreshOutline" />
          </button>
        </div>

        <!-- Spinner -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorCarga" class="error-msg">{{ errorCarga }}</div>

        <!-- Lista medicamentos -->
        <ion-list v-else-if="medicamentos.length > 0">
          <ion-item v-for="m in medicamentos" :key="m.id_medicamento">
            <ion-icon slot="start" :icon="medkitOutline" color="success" />
            <ion-label>
              <h2>{{ m.nombre }}</h2>
              <p>{{ m.dosis_por_kg }} {{ m.unidad }}/kg</p>
              <p v-if="m.descripcion" class="desc">{{ m.descripcion }}</p>
            </ion-label>
            <ion-badge slot="end" color="success">ID {{ m.id_medicamento }}</ion-badge>
          </ion-item>
        </ion-list>

        <BaseCard v-else class="center-card">
          <ion-icon :icon="medkitOutline" style="font-size:64px;color:#9ca3af;display:block;margin-bottom:8px;" />
          <p>No hay medicamentos activos registrados</p>
        </BaseCard>

        <!-- Sección Razas (estáticas) -->
        <div class="section-header mt">
          <h3>Razas</h3>
        </div>
        <ion-list>
          <ion-item v-for="r in RAZAS" :key="r.id">
            <ion-label>{{ r.nombre }}</ion-label>
            <ion-badge slot="end" color="success">ID {{ r.id }}</ion-badge>
          </ion-item>
        </ion-list>

        <!-- Sección Tipos de usuario -->
        <div class="section-header mt">
          <h3>Roles de usuario</h3>
        </div>
        <ion-list>
          <ion-item>
            <ion-label>Administrador</ion-label>
            <ion-badge slot="end" color="danger">1</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Ganadero</ion-label>
            <ion-badge slot="end" color="primary">2</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Veterinario</ion-label>
            <ion-badge slot="end" color="warning">3</ion-badge>
          </ion-item>
        </ion-list>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonSpinner
} from '@ionic/vue';
import { medkitOutline, informationCircleOutline, refreshOutline } from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import { medicamentoService, type MedicamentoAPI } from '@/services/medicamentoService';
import { RAZAS } from '@/services/catalogos';

const medicamentos = ref<MedicamentoAPI[]>([]);
const cargando = ref(false);
const errorCarga = ref('');

const cargar = async () => {
  cargando.value = true;
  errorCarga.value = '';
  try {
    const res = await medicamentoService.getMedicamentos();
    medicamentos.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e: any) {
    errorCarga.value = e.response?.data?.message || 'No se pudieron cargar los medicamentos.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.aviso {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #92400e;
}
.aviso ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.section-header h3 { font-size: 17px; font-weight: 600; color: #374151; margin: 0; }
.mt { margin-top: 28px; }

.reload-btn {
  background: none; border: none; font-size: 22px; color: #006d37; cursor: pointer;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #6b7280;
}

.error-msg {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  color: #991b1b;
  font-size: 13px;
  margin: 8px 0;
}

.center-card { text-align: center; margin-top: 16px; }

.desc { font-style: italic; color: #9ca3af; }
</style>