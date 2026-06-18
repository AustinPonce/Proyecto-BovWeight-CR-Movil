<template>
  <ion-page>

    <AppHeader title="Auditoría del Sistema" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- Filtros -->
        <div class="filter-row">
          <select v-model="filtro.modulo" class="filter-select" @change="resetYCargar">
            <option value="">Todos los módulos</option>
            <option v-for="m in MODULOS" :key="m" :value="m">{{ m }}</option>
          </select>
          <select v-model="filtro.accion" class="filter-select" @change="resetYCargar">
            <option value="">Todas las acciones</option>
            <option v-for="a in ACCIONES" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>

        <!-- Spinner -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando registros...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-msg">{{ error }}</div>

        <!-- Lista -->
        <template v-else>

          <p v-if="registros.length === 0" class="empty-msg">
            No hay registros de auditoría.
          </p>

          <div v-for="r in registros" :key="r.id_auditoria" class="audit-card">
            <div class="audit-top">
              <span :class="['badge-accion', colorAccion(r.accion)]">{{ r.accion }}</span>
              <span class="badge-modulo">{{ r.modulo }}</span>
              <span class="fecha-txt">{{ formatFecha(r.created_at) }}</span>
            </div>
            <p class="desc-txt">{{ r.descripcion }}</p>
            <p class="user-txt">
              Por: {{ r.usuario?.nombre || r.cedula_usuario || 'Sistema' }}
            </p>
          </div>

          <!-- Paginación -->
          <div v-if="meta && meta.last_page > 1" class="pagination">
            <ion-button
              fill="outline"
              color="success"
              size="small"
              :disabled="pagina <= 1"
              @click="cambiarPagina(pagina - 1)"
            >
              Anterior
            </ion-button>
            <span class="pag-info">{{ pagina }} / {{ meta.last_page }}</span>
            <ion-button
              fill="outline"
              color="success"
              size="small"
              :disabled="pagina >= meta.last_page"
              @click="cambiarPagina(pagina + 1)"
            >
              Siguiente
            </ion-button>
          </div>

        </template>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonSpinner, IonButton } from '@ionic/vue';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import { auditoriaService, type AuditoriaAPI } from '@/services/auditoriaService';

const MODULOS = ['Animal', 'Pesaje', 'Finca', 'Usuario', 'Transaccion', 'Medicamento', 'Raza'];
const ACCIONES = ['crear', 'actualizar', 'eliminar', 'login', 'logout'];

const registros = ref<AuditoriaAPI[]>([]);
const meta = ref<{ last_page: number } | null>(null);
const cargando = ref(false);
const error = ref('');
const pagina = ref(1);
const filtro = ref({ modulo: '', accion: '' });

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const res = await auditoriaService.getAuditoria({
      modulo: filtro.value.modulo || undefined,
      accion: filtro.value.accion || undefined,
      page: pagina.value,
    });
    registros.value = res.data;
    meta.value = res.meta ?? null;
  } catch {
    error.value = 'No se pudo cargar la auditoría. Verifica que el endpoint /api/admin/auditoria esté disponible.';
  } finally {
    cargando.value = false;
  }
};

const resetYCargar = () => {
  pagina.value = 1;
  cargar();
};

const cambiarPagina = (n: number) => {
  pagina.value = n;
  cargar();
};

const formatFecha = (f: string) =>
  new Date(f).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });

const colorAccion = (accion: string): string => {
  const mapa: Record<string, string> = {
    crear: 'verde',
    actualizar: 'azul',
    eliminar: 'rojo',
    login: 'gris',
    logout: 'gris',
  };
  return mapa[accion.toLowerCase()] ?? 'gris';
};

onMounted(cargar);
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-select {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  color: #374151;
  outline: none;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: #6b7280;
}

.error-msg {
  background: #fee2e2;
  border-radius: 10px;
  padding: 12px 14px;
  color: #991b1b;
  font-size: 13px;
}

.audit-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.audit-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.badge-accion {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge-accion.verde  { background: #dcfce7; color: #166534; }
.badge-accion.azul   { background: #dbeafe; color: #1e40af; }
.badge-accion.rojo   { background: #fee2e2; color: #991b1b; }
.badge-accion.gris   { background: #f3f4f6; color: #6b7280; }

.badge-modulo {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 20px;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.fecha-txt {
  font-size: 11px;
  color: #9ca3af;
  margin-left: auto;
}

.desc-txt {
  font-size: 13px;
  color: #374151;
  margin: 0 0 4px;
  line-height: 1.4;
}

.user-txt {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.empty-msg {
  text-align: center;
  color: #9ca3af;
  padding: 48px 0;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.pag-info {
  font-size: 14px;
  color: #6b7280;
}
</style>
