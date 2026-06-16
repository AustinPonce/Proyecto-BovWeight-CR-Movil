<template>
  <ion-page>
    <AppHeader title="Calculadora de Dosis" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- Formulario -->
        <BaseCard>
          <h3 class="card-title">
            <ion-icon :icon="medkitOutline" class="title-icon" />
            Datos del Cálculo
          </h3>

          <!-- Arete -->
          <BaseInput
            v-model="form.arete"
            label="Arete del animal *"
            placeholder="Ej: CR-12345"
          />

          <!-- Medicamento -->
          <div v-if="cargandoMeds" class="loading-row">
            <ion-spinner name="crescent" color="success" />
            <span>Cargando medicamentos...</span>
          </div>
          <div v-else-if="errorMeds" class="error-msg">{{ errorMeds }}</div>
          <div v-else class="field-group">
            <label class="field-label">Medicamento *</label>
            <select v-model="form.id_medicamento" class="native-select">
              <option :value="0" disabled>Seleccione un medicamento</option>
              <option v-for="m in medicamentos" :key="m.id_medicamento" :value="m.id_medicamento">
                {{ m.nombre }} ({{ m.dosis_por_kg }} {{ m.unidad }}/kg)
              </option>
            </select>
          </div>

          <!-- Peso manual (opcional) -->
          <BaseInput
            v-model="form.pesoStr"
            label="Peso de referencia (kg) — opcional"
            placeholder="Si se omite, usa el último pesaje del animal"
            type="number"
          />

          <!-- Comentario (solo vet) -->
          <div v-if="isVeterinario" class="field-group">
            <label class="field-label">Agregar nota al comentario (opcional)</label>
            <textarea
              v-model="form.comentario"
              class="textarea"
              rows="3"
              placeholder="Observación, indicación de aplicación..."
            />
            <p class="hint">Si agregas una nota, se guardará automáticamente como comentario en el historial del animal.</p>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <BaseButton @click="calcular" :disabled="calculando">
            {{ calculando ? 'Calculando...' : 'Calcular Dosis' }}
          </BaseButton>
        </BaseCard>

        <!-- Resultado -->
        <BaseCard v-if="resultado" class="mt resultado-card">
          <div class="resultado-header">
            <ion-icon :icon="checkmarkCircleOutline" class="resultado-icon" />
            <h3>Dosis Calculada</h3>
          </div>

          <div class="resultado-dato">
            <span class="dato-label">Animal</span>
            <span class="dato-valor">{{ resultado.animal.arete }}{{ resultado.animal.nombre ? ` — ${resultado.animal.nombre}` : '' }}</span>
          </div>
          <div class="resultado-dato">
            <span class="dato-label">Medicamento</span>
            <span class="dato-valor">{{ resultado.medicamento.nombre }}</span>
          </div>
          <div class="resultado-dato">
            <span class="dato-label">Peso utilizado</span>
            <span class="dato-valor">{{ resultado.peso_kg }} kg</span>
          </div>

          <div class="dosis-grande">
            {{ resultado.dosis_total }}
            <span class="unidad-label">{{ resultado.unidad }}</span>
          </div>

          <div class="formula-hint">{{ resultado.formula }}</div>

          <div v-if="form.comentario && isVeterinario" class="comment-saved">
            <ion-icon :icon="chatbubbleOutline" />
            Comentario guardado en el historial del animal
          </div>
        </BaseCard>

        <!-- Aviso -->
        <div class="aviso">
          <ion-icon :icon="informationCircleOutline" />
          <span>Esta calculadora es orientativa. Consulta siempre con el protocolo veterinario oficial.</span>
        </div>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import {
  medkitOutline, checkmarkCircleOutline,
  chatbubbleOutline, informationCircleOutline
} from 'ionicons/icons';
import api from '@/services/api';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { medicamentoService, type MedicamentoAPI } from '@/services/medicamentoService';
import { useRol } from '@/composables/useRol';

const { isVeterinario } = useRol();

const medicamentos = ref<MedicamentoAPI[]>([]);
const cargandoMeds = ref(false);
const errorMeds = ref('');

const form = reactive({
  arete: '',
  id_medicamento: 0,
  pesoStr: '',
  comentario: '',
});

const calculando = ref(false);
const error = ref('');
const resultado = ref<{
  animal: { arete: string; nombre?: string };
  medicamento: { nombre: string; unidad: string };
  peso_kg: number;
  dosis_total: number;
  unidad: string;
  formula: string;
} | null>(null);

const calcular = async () => {
  error.value = '';
  resultado.value = null;

  if (!form.arete.trim()) { error.value = 'Ingresa el arete del animal'; return; }
  if (!form.id_medicamento) { error.value = 'Selecciona un medicamento'; return; }

  calculando.value = true;
  try {
    const payload: Record<string, any> = {
      arete: form.arete.trim(),
      id_medicamento: form.id_medicamento,
    };
    if (form.pesoStr) payload.peso_referencia = parseFloat(form.pesoStr);
    if (form.comentario.trim()) payload.comentario = form.comentario.trim();

    const res = await api.post('/dosis/calcular', payload);
    resultado.value = res.data.data;
  } catch (e: any) {
    error.value = e.response?.data?.mensaje || e.response?.data?.message || 'No se pudo calcular la dosis. Verifica el arete del animal.';
  } finally {
    calculando.value = false;
  }
};

onMounted(async () => {
  cargandoMeds.value = true;
  try {
    const res = await medicamentoService.getMedicamentos();
    medicamentos.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e: any) {
    errorMeds.value = e.response?.data?.message || 'No se pudieron cargar los medicamentos.';
  } finally {
    cargandoMeds.value = false;
  }
});
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }
.mt { margin-top: 16px; }

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 14px;
}
.title-icon { color: #006d37; font-size: 20px; }

.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
  padding: 8px 0;
}

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.native-select {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 15px; color: #111827; background: #fff;
}
.native-select:focus { outline: none; border-color: #006d37; }

.textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  resize: vertical; box-sizing: border-box;
}
.hint { font-size: 11px; color: #9ca3af; margin-top: 5px; }

/* Resultado */
.resultado-card { border: 2px solid #16a34a; }
.resultado-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.resultado-icon { font-size: 22px; color: #16a34a; }
.resultado-header h3 { margin: 0; font-size: 17px; font-weight: 600; color: #166534; }

.resultado-dato {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}
.dato-label { color: #6b7280; }
.dato-valor { font-weight: 600; color: #111827; text-align: right; flex: 1; margin-left: 16px; }

.dosis-grande {
  font-size: 52px;
  font-weight: bold;
  color: #006d37;
  text-align: center;
  margin: 16px 0 4px;
}
.unidad-label { font-size: 20px; font-weight: normal; color: #6b7280; }

.formula-hint {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.comment-saved {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #166534;
}

.aviso {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #92400e;
}
.aviso ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 10px; color: #991b1b; font-size: 13px;
}
</style>