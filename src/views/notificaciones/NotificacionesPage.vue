<template>
  <ion-page>

    <AppHeader title="Notificaciones" :show-back="true" default-href="/dashboard" />

    <ion-content>
      <div class="container">

        <!-- Cargando -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando...</p>
        </div>

        <!-- Sin nada -->
        <BaseCard
          v-else-if="notificaciones.length === 0 && comentarios.length === 0"
          class="empty-card"
        >
          <div class="icon-circle">
            <ion-icon :icon="notificationsOffOutline" class="notification-icon" />
          </div>
          <h2>Sin notificaciones</h2>
          <p>Aquí aparecerán los avisos de re-pesaje y los comentarios del veterinario.</p>
        </BaseCard>

        <template v-else>

          <!-- ── Recordatorios de re-pesaje ─────────────────────────── -->
          <div class="section-header">
            <ion-icon :icon="alarmOutline" class="section-icon warn" />
            <span>Re-pesajes programados</span>
            <span class="badge warn">{{ notificaciones.length }}</span>
          </div>

          <BaseCard v-if="notificaciones.length === 0" class="empty-sec">
            <p>Sin recordatorios de re-pesaje.</p>
          </BaseCard>

          <ion-list v-else class="ion-list-card">
            <ion-item
              v-for="n in notificaciones"
              :key="n.id_notificacion"
            >
              <ion-icon slot="start" :icon="alarmOutline" color="warning" />
              <ion-label>
                <h2>Re-pesaje programado</h2>
                <p>{{ n.mensaje }}</p>
                <p v-if="n.recordatorio" class="hint-animal">
                  Animal: #{{ n.recordatorio.arete }}
                  <span v-if="n.recordatorio.animal?.nombre"> — {{ n.recordatorio.animal.nombre }}</span>
                </p>
                <p class="fecha">{{ formatFecha(n.fecha_envio) }}</p>
              </ion-label>
              <ion-badge v-if="n.recordatorio" slot="end" color="warning">
                {{ n.recordatorio.frecuencia }}
              </ion-badge>
            </ion-item>
          </ion-list>

          <!-- ── Comentarios veterinarios ────────────────────────────── -->
          <div class="section-header mt">
            <ion-icon :icon="medkitOutline" class="section-icon vet" />
            <span>Comentarios del veterinario</span>
            <span class="badge vet">{{ comentarios.length }}</span>
          </div>

          <BaseCard v-if="comentarios.length === 0" class="empty-sec">
            <p>Sin comentarios veterinarios.</p>
          </BaseCard>

          <div
            v-else
            v-for="c in comentarios"
            :key="c.id_comentario"
            class="comentario-item"
            @click="verDetalle(c)"
          >
            <div class="com-left">
              <div class="com-avatar">
                <ion-icon :icon="medkitOutline" />
              </div>
            </div>
            <div class="com-body">
              <div class="com-top">
                <span class="com-vet">{{ c.veterinario || 'Veterinario' }}</span>
                <span class="com-fecha">{{ formatFecha(c.fecha) }}</span>
              </div>
              <p class="com-animal">
                <ion-icon :icon="pawOutline" class="inline-icon" />
                {{ c.animal?.nombre || c.arete }}
                <span class="com-arete">#{{ c.arete }}</span>
              </p>
              <p class="com-texto">{{ truncar(c.comentario) }}</p>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="com-arrow" />
          </div>

        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonIcon, IonList, IonItem,
  IonLabel, IonBadge, IonSpinner, useIonRouter,
} from '@ionic/vue';
import {
  notificationsOffOutline, alarmOutline,
  medkitOutline, pawOutline, chevronForwardOutline,
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseCard from '@/components/BaseCard.vue';
import { notificacionService, type NotificacionAPI } from '@/services/notificacionService';
import { comentarioService, type ComentarioAPI } from '@/services/comentarioService';

const router = useIonRouter();

const notificaciones = ref<NotificacionAPI[]>([]);
const comentarios     = ref<ComentarioAPI[]>([]);
const cargando        = ref(false);

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const truncar = (texto: string, max = 100) =>
  texto.length > max ? texto.slice(0, max) + '…' : texto;

const verDetalle = (c: ComentarioAPI) => {
  router.push({ path: `/notificaciones/comentario/${c.id_comentario}`, state: { comentario: c } } as any);
};

onMounted(async () => {
  cargando.value = true;
  try {
    const [notifRes, comRes] = await Promise.allSettled([
      notificacionService.getNotificaciones(),
      comentarioService.getComentariosGlobales(),
    ]);

    if (notifRes.status === 'fulfilled') notificaciones.value = notifRes.value.data;
    if (comRes.status === 'fulfilled')   comentarios.value    = comRes.value.data;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.container {
  padding: 16px;
  padding-bottom: 80px;
}

.mt { margin-top: 20px; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #6b7280;
}

.empty-card {
  text-align: center;
  margin-top: 24px;
}
.icon-circle {
  width: 96px; height: 96px; border-radius: 50%;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.notification-icon { font-size: 48px; color: #9ca3af; }
.empty-card h2 { font-size: 18px; color: #374151; margin: 0 0 8px; }
.empty-card p  { color: #9ca3af; font-size: 14px; margin: 0; }

/* Section headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 10px;
}
.section-icon { font-size: 20px; }
.section-icon.warn { color: #f59e0b; }
.section-icon.vet  { color: #7c3aed; }

.badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  color: #fff;
}
.badge.warn { background: #f59e0b; }
.badge.vet  { background: #7c3aed; }

/* Re-pesajes */
.ion-list-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.empty-sec {
  padding: 12px 16px;
}
.empty-sec p { font-size: 13px; color: #9ca3af; margin: 0; }

.hint-animal { color: #6b7280; font-size: 12px; }
.fecha { font-size: 12px; color: #9ca3af; margin-top: 4px; }

/* Comentarios */
.comentario-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  cursor: pointer;
  transition: background 0.15s;
}
.comentario-item:active { background: #f9fafb; }

.com-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #f3e8ff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.com-avatar ion-icon { font-size: 20px; color: #7c3aed; }

.com-body { flex: 1; min-width: 0; }

.com-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.com-vet  { font-size: 13px; font-weight: 700; color: #374151; }
.com-fecha { font-size: 11px; color: #9ca3af; }

.com-animal {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #006d37;
  font-weight: 600;
  margin: 0 0 6px;
}
.inline-icon { font-size: 13px; }
.com-arete   { font-size: 11px; color: #9ca3af; font-weight: 400; margin-left: 2px; }

.com-texto {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.com-arrow {
  font-size: 16px;
  color: #d1d5db;
  flex-shrink: 0;
  margin-top: 4px;
}
</style>
