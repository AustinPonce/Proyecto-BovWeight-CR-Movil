<template>
  <ion-page>
    <AppHeader title="Asignar Veterinario" :show-back="true" default-href="/fincas" />

    <ion-content>
      <div class="container">

        <!-- Seleccionar finca -->
        <BaseCard>
          <h3 class="card-title">
            <ion-icon :icon="businessOutline" class="title-icon" />
            Seleccionar Finca
          </h3>

          <div v-if="cargandoFincas" class="loading-row">
            <ion-spinner name="crescent" color="success" />
            <span>Cargando fincas...</span>
          </div>

          <div v-else class="field-group">
            <label class="field-label">Finca *</label>
            <select v-model="idFinca" class="native-select" @change="cargarVeterinariosAsignados">
              <option :value="0" disabled>Seleccione una finca</option>
              <option v-for="f in fincas" :key="f.id" :value="f.id">{{ f.nombre }}</option>
            </select>
          </div>
        </BaseCard>

        <!-- Buscar veterinario -->
        <BaseCard class="mt">
          <h3 class="card-title">
            <ion-icon :icon="searchOutline" class="title-icon" />
            Buscar Veterinario
          </h3>

          <div class="search-row">
            <BaseInput v-model="buscar" placeholder="Nombre o cédula..." />
            <BaseButton @click="buscarVets" :disabled="buscando">
              {{ buscando ? '...' : 'Buscar' }}
            </BaseButton>
          </div>

          <!-- Resultados búsqueda -->
          <div v-if="vets.length > 0" class="vet-list">
            <div class="vet-item" v-for="v in vets" :key="v.cedula">
              <div class="vet-info">
                <p class="vet-nombre">{{ v.nombre }}</p>
                <p class="vet-cedula">{{ v.cedula }} · {{ v.correo }}</p>
              </div>
              <button
                class="asignar-btn"
                @click="asignar(v)"
                :disabled="asignando === v.cedula || !idFinca"
              >
                {{ asignando === v.cedula ? '...' : 'Asignar' }}
              </button>
            </div>
          </div>

          <p v-else-if="buscado" class="no-results">No se encontraron veterinarios con esa búsqueda.</p>
        </BaseCard>

        <!-- Veterinarios asignados a la finca -->
        <div v-if="idFinca" class="mt">
          <h3 class="section-label">Veterinarios asignados a esta finca</h3>

          <div v-if="cargandoAsignados" class="loading-row">
            <ion-spinner name="crescent" color="success" />
          </div>

          <div v-else-if="asignados.length === 0" class="empty-hint">
            Ningún veterinario asignado aún.
          </div>

          <div v-else class="vet-list assigned">
            <div class="vet-item" v-for="v in asignados" :key="v.cedula">
              <ion-icon :icon="checkmarkCircleOutline" class="assigned-icon" />
              <div class="vet-info">
                <p class="vet-nombre">{{ v.nombre }}</p>
                <p class="vet-cedula">{{ v.cedula }}</p>
              </div>
              <button class="remove-btn" @click="desasignar(v)">
                <ion-icon :icon="trashOutline" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mensajes -->
        <div v-if="mensajeOk" class="success-msg">{{ mensajeOk }}</div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import {
  businessOutline, searchOutline, checkmarkCircleOutline, trashOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { fincaService, type FincaAPI } from '@/services/fincaService';
import { veterinarioService, type VeterinarioAPI } from '@/services/veterinarioService';

const fincas = ref<FincaAPI[]>([]);
const cargandoFincas = ref(false);
const idFinca = ref(0);

const buscar = ref('');
const vets = ref<VeterinarioAPI[]>([]);
const buscando = ref(false);
const buscado = ref(false);

const asignados = ref<VeterinarioAPI[]>([]);
const cargandoAsignados = ref(false);
const asignando = ref<string | null>(null);

const mensajeOk = ref('');
const errorMsg = ref('');

const clearMessages = () => { mensajeOk.value = ''; errorMsg.value = ''; };

const buscarVets = async () => {
  clearMessages();
  buscando.value = true;
  buscado.value = false;
  try {
    const res = await veterinarioService.getVeterinarios(buscar.value.trim() || undefined);
    vets.value = Array.isArray(res) ? res : (res.data ?? []);
    buscado.value = true;
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || 'No se pudo realizar la búsqueda.';
  } finally {
    buscando.value = false;
  }
};

const cargarVeterinariosAsignados = async () => {
  if (!idFinca.value) return;
  clearMessages();
  cargandoAsignados.value = true;
  try {
    const res = await veterinarioService.getVeterinariosAsignados(idFinca.value);
    asignados.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* silent */ }
  finally { cargandoAsignados.value = false; }
};

const asignar = async (vet: VeterinarioAPI) => {
  if (!idFinca.value) { errorMsg.value = 'Selecciona una finca primero'; return; }
  clearMessages();
  asignando.value = vet.cedula;
  try {
    await veterinarioService.asignarVeterinario(idFinca.value, vet.cedula);
    if (!asignados.value.find(a => a.cedula === vet.cedula)) {
      asignados.value.push(vet);
    }
    mensajeOk.value = `${vet.nombre} asignado exitosamente.`;
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || 'No se pudo asignar el veterinario.';
  } finally {
    asignando.value = null;
  }
};

const desasignar = async (vet: VeterinarioAPI) => {
  clearMessages();
  try {
    await veterinarioService.desasignarVeterinario(idFinca.value, vet.cedula);
    asignados.value = asignados.value.filter(a => a.cedula !== vet.cedula);
    mensajeOk.value = `${vet.nombre} removido de la finca.`;
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || 'No se pudo remover el veterinario.';
  }
};

onMounted(async () => {
  cargandoFincas.value = true;
  try {
    const res = await fincaService.getFincas();
    fincas.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch { /* silent */ }
  finally { cargandoFincas.value = false; }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 16px; }

.card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px;
}
.title-icon { color: #006d37; font-size: 20px; }

.loading-row {
  display: flex; align-items: center; gap: 10px; color: #6b7280; font-size: 14px;
}

.field-group { margin: 8px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.native-select {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 15px; color: #111827; background: #fff;
}
.native-select:focus { outline: none; border-color: #006d37; }

.search-row { display: flex; gap: 10px; align-items: flex-end; }

.vet-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.vet-item {
  display: flex; align-items: center; gap: 10px;
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 10px; padding: 10px 12px;
}
.vet-info { flex: 1; }
.vet-nombre { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #111827; }
.vet-cedula { margin: 0; font-size: 12px; color: #6b7280; }

.asignar-btn {
  background: #006d37; color: #fff;
  border: none; border-radius: 8px;
  padding: 6px 14px; font-size: 13px; font-weight: 600;
  cursor: pointer;
}
.asignar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.assigned { background: #f0fdf4; }
.assigned-icon { font-size: 20px; color: #16a34a; flex-shrink: 0; }
.remove-btn {
  background: none; border: none; color: #ef4444; font-size: 20px; cursor: pointer;
}

.section-label {
  font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 10px;
}
.no-results, .empty-hint { font-size: 13px; color: #9ca3af; padding: 12px 0; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 12px; color: #991b1b; font-size: 13px;
}
.success-msg {
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 12px; color: #166534; font-size: 13px;
}
</style>