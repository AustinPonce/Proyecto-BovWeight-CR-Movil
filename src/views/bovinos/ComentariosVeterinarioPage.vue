<template>
  <ion-page>
    <AppHeader title="Comentarios Veterinario" :show-back="true" default-href="/bovinos" />

    <ion-content>
      <div class="container">

        <!-- Buscar por arete -->
        <BaseCard>
          <h3 class="card-title">
            <ion-icon :icon="searchOutline" class="title-icon" />
            Buscar Animal
          </h3>
          <div class="search-row">
            <BaseInput v-model="arete" placeholder="Número de arete (Ej: CR-12345)" />
            <BaseButton @click="cargarComentarios" :disabled="cargando">
              {{ cargando ? '...' : 'Buscar' }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Spinner -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando comentarios...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorCarga" class="error-msg">{{ errorCarga }}</div>

        <!-- Sin comentarios -->
        <BaseCard v-else-if="buscado && comentarios.length === 0" class="center-card">
          <ion-icon :icon="chatbubbleOutline" style="font-size:64px;color:#9ca3af;display:block;margin-bottom:8px;" />
          <h3>Sin comentarios</h3>
          <p>No hay comentarios veterinarios para el bovino <strong>{{ arete }}</strong>.</p>
        </BaseCard>

        <!-- Lista de comentarios -->
        <template v-else-if="comentarios.length > 0">
          <h3 class="section-label">Comentarios para {{ arete }}</h3>
          <div class="comentario-card" v-for="c in comentarios" :key="c.id_comentario">
            <div class="com-header">
              <ion-icon :icon="medkitOutline" class="com-icon" />
              <span class="com-vet">{{ c.veterinario || 'Veterinario' }}</span>
              <span class="com-fecha">{{ formatFecha(c.fecha) }}</span>
            </div>
            <p class="com-texto">{{ c.comentario }}</p>
            <button
              v-if="isVeterinario || isAdmin"
              class="delete-btn"
              @click="eliminar(c.id_comentario)"
            >
              <ion-icon :icon="trashOutline" />
            </button>
          </div>
        </template>

        <!-- Formulario nuevo comentario (solo veterinario) -->
        <BaseCard v-if="isVeterinario" class="mt">
          <h3 class="card-title">
            <ion-icon :icon="addCircleOutline" class="title-icon" />
            Nuevo Comentario
          </h3>

          <BaseInput v-model="nuevoArete" label="Arete del animal *" placeholder="Ej: CR-12345" />

          <div class="field-group">
            <label class="field-label">Comentario * (mínimo 5 caracteres)</label>
            <textarea v-model="nuevoComentario" class="textarea" rows="4"
              placeholder="Observaciones, diagnóstico, tratamiento recomendado..." />
          </div>

          <div v-if="errorForm" class="error-msg">{{ errorForm }}</div>

          <BaseButton @click="guardar" :disabled="guardando || !nuevoComentario.trim()">
            {{ guardando ? 'Guardando...' : 'Agregar Comentario' }}
          </BaseButton>

          <div v-if="mensajeOk" class="success-msg">{{ mensajeOk }}</div>
        </BaseCard>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import {
  searchOutline, chatbubbleOutline, medkitOutline,
  trashOutline, addCircleOutline
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { comentarioService, type ComentarioAPI } from '@/services/comentarioService';
import { useRol } from '@/composables/useRol';

const { isVeterinario, isAdmin } = useRol();

const arete = ref('');
const comentarios = ref<ComentarioAPI[]>([]);
const cargando = ref(false);
const errorCarga = ref('');
const buscado = ref(false);

const nuevoArete = ref('');
const nuevoComentario = ref('');
const guardando = ref(false);
const errorForm = ref('');
const mensajeOk = ref('');

const formatFecha = (f: string) => {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const cargarComentarios = async () => {
  if (!arete.value.trim()) return;
  cargando.value = true;
  errorCarga.value = '';
  buscado.value = false;
  try {
    const res = await comentarioService.getComentarios(arete.value.trim());
    comentarios.value = Array.isArray(res) ? res : (res.data ?? []);
    buscado.value = true;
  } catch (e: any) {
    errorCarga.value = e.response?.data?.message || 'No se pudieron cargar los comentarios.';
  } finally {
    cargando.value = false;
  }
};

const guardar = async () => {
  errorForm.value = '';
  mensajeOk.value = '';
  if (!nuevoArete.value.trim()) { errorForm.value = 'Ingresa el arete del animal'; return; }
  if (nuevoComentario.value.trim().length < 5) { errorForm.value = 'El comentario debe tener al menos 5 caracteres'; return; }

  guardando.value = true;
  try {
    // POST /api/animales/{arete}/comentarios  body: { comentario }
    const res = await comentarioService.crearComentario(
      nuevoArete.value.trim(),
      nuevoComentario.value.trim()
    );
    comentarios.value.unshift(res.data);
    nuevoComentario.value = '';
    nuevoArete.value = '';
    mensajeOk.value = 'Comentario guardado exitosamente';
  } catch (e: any) {
    errorForm.value = e.response?.data?.mensaje || e.response?.data?.message || 'No se pudo guardar el comentario.';
  } finally {
    guardando.value = false;
  }
};

const eliminar = async (idComentario: number) => {
  const areteTarget = arete.value.trim() || nuevoArete.value.trim();
  if (!areteTarget) return;
  try {
    // DELETE /api/animales/{arete}/comentarios/{id_comentario}
    await comentarioService.eliminarComentario(areteTarget, idComentario);
    comentarios.value = comentarios.value.filter(c => c.id_comentario !== idComentario);
  } catch (e: any) {
    alert(e.response?.data?.mensaje || e.response?.data?.message || 'No se pudo eliminar.');
  }
};
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
  margin-bottom: 12px;
}
.title-icon { color: #006d37; font-size: 20px; }

.search-row { display: flex; gap: 10px; align-items: flex-end; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #6b7280;
}

.center-card { text-align: center; margin-top: 16px; }

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.comentario-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  position: relative;
}
.com-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.com-icon { font-size: 18px; color: #006d37; }
.com-vet { font-weight: 600; font-size: 14px; color: #111827; }
.com-fecha { margin-left: auto; font-size: 12px; color: #9ca3af; }
.com-texto { color: #374151; font-size: 14px; line-height: 1.5; margin: 0; padding-right: 28px; }

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.field-group { margin: 10px 0; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  resize: vertical; box-sizing: border-box;
}

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 10px; color: #991b1b; font-size: 13px;
}
.success-msg {
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 10px 14px;
  margin-top: 10px; color: #166534; font-size: 13px;
}
</style>