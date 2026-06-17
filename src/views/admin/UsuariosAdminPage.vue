<template>
  <ion-page>
    <AppHeader title="Gestión de Usuarios" :show-back="true" default-href="/admin" />

    <ion-content>
      <div class="container">

        <!-- Toolbar: búsqueda + filtros + botón agregar -->
        <div class="toolbar">
          <div class="toolbar-top">
            <BaseInput v-model="buscar" placeholder="Buscar por nombre o cédula..." />
            <button class="add-btn" @click="toggleForm">
              <ion-icon :icon="showForm ? closeOutline : addOutline" />
              {{ showForm ? 'Cancelar' : 'Nuevo' }}
            </button>
          </div>
          <div class="filter-row">
            <button
              v-for="f in filtros"
              :key="f.id"
              class="filter-chip"
              :class="{ active: filtroActivo === f.id }"
              @click="filtroActivo = f.id"
            >{{ f.label }}</button>
          </div>
        </div>

        <!-- Formulario nuevo usuario -->
        <div v-if="showForm" class="form-card">
          <h4 class="form-title">Nuevo Usuario</h4>

          <BaseInput v-model="form.cedula"  label="Cédula *"  placeholder="Ej: 123456789" />
          <BaseInput v-model="form.nombre"  label="Nombre *"  placeholder="Nombre completo" />
          <BaseInput v-model="form.correo"  label="Correo *"  placeholder="correo@ejemplo.com" type="email" />

          <!-- Contraseña con toggle ojo -->
          <div class="pass-group">
            <label class="pass-label">Contraseña *</label>
            <div class="pass-row">
              <BaseInput
                v-model="form.contrasena"
                :type="verPass ? 'text' : 'password'"
                placeholder="Mín. 8 caracteres"
              />
              <button class="eye-btn" type="button" @click="verPass = !verPass">
                <ion-icon :icon="verPass ? eyeOffOutline : eyeOutline" />
              </button>
            </div>
            <div class="pass-hints">
              <span :class="{ ok: form.contrasena.length >= 8 }">• 8 caracteres</span>
              <span :class="{ ok: /[A-Z]/.test(form.contrasena) }">• Mayúscula</span>
              <span :class="{ ok: /[a-z]/.test(form.contrasena) }">• Minúscula</span>
              <span :class="{ ok: /[^A-Za-z0-9]/.test(form.contrasena) }">• Símbolo</span>
            </div>
          </div>

          <BaseInput
            v-model="form.contrasena_confirmation"
            :type="verPass ? 'text' : 'password'"
            label="Confirmar contraseña *"
            placeholder="Repetir contraseña"
          />

          <div class="field-group">
            <label class="field-label">Rol *</label>
            <select v-model="form.id_tipo_usuario" class="native-select">
              <option :value="0" disabled>Seleccione un rol</option>
              <option :value="2">Ganadero</option>
              <option :value="3">Veterinario</option>
            </select>
          </div>

          <div v-if="formError" class="error-msg">{{ formError }}</div>

          <div class="form-actions">
            <button class="btn-cancel" @click="cerrarForm">Cancelar</button>
            <button class="btn-save" @click="crearUsuario" :disabled="guardando">
              {{ guardando ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </div>
        </div>

        <!-- Spinner -->
        <div v-if="cargando" class="loading-box">
          <ion-spinner name="crescent" color="success" />
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error de carga -->
        <BaseCard v-else-if="errorCarga" class="center-card">
          <ion-icon :icon="alertCircleOutline" style="font-size:48px;color:#ef4444;display:block;margin-bottom:8px;" />
          <p>{{ errorCarga }}</p>
          <BaseButton @click="cargar">Reintentar</BaseButton>
        </BaseCard>

        <!-- Lista de usuarios -->
        <ion-list v-else-if="usuariosFiltrados.length > 0">
          <ion-item v-for="u in usuariosFiltrados" :key="u.cedula">
            <ion-avatar slot="start" class="avatar">
              <ion-icon :icon="personCircleOutline" />
            </ion-avatar>
            <ion-label>
              <h2>{{ u.nombre }}</h2>
              <p>{{ u.cedula }} · {{ u.correo }}</p>
              <p v-if="u.activo === false" class="desactivado-tag">Desactivado</p>
            </ion-label>
            <ion-badge slot="end" :color="badgeColor(u.id_tipo_usuario)">
              {{ tipoNombre(u.id_tipo_usuario) }}
            </ion-badge>
            <ion-button
              slot="end"
              fill="clear"
              size="small"
              :color="u.activo === false ? 'success' : 'danger'"
              @click="toggleActivo(u)"
            >
              {{ u.activo === false ? 'Activar' : 'Desactivar' }}
            </ion-button>
          </ion-item>
        </ion-list>

        <BaseCard v-else class="center-card">
          <ion-icon :icon="peopleOutline" style="font-size:64px;color:#9ca3af;display:block;margin-bottom:8px;" />
          <p>No se encontraron usuarios</p>
        </BaseCard>

        <p v-if="!cargando && !errorCarga" class="total-label">
          {{ usuariosFiltrados.length }} usuario(s) encontrado(s)
        </p>

      </div>
    </ion-content>

    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonLabel,
  IonAvatar, IonBadge, IonIcon, IonSpinner, IonButton, toastController,
} from '@ionic/vue';
import {
  alertCircleOutline, personCircleOutline, peopleOutline,
  addOutline, closeOutline, eyeOutline, eyeOffOutline,
} from 'ionicons/icons';

import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import { adminService, type UsuarioAPI } from '@/services/adminService';

// ── Lista ──────────────────────────────────────────────────────────────
const usuarios     = ref<UsuarioAPI[]>([]);
const buscar       = ref('');
const filtroActivo = ref(0);
const cargando     = ref(false);
const errorCarga   = ref('');

const filtros = [
  { id: 0, label: 'Todos' },
  { id: 2, label: 'Ganadero' },
  { id: 3, label: 'Veterinario' },
];

const tipoNombre  = (id: number) => id === 2 ? 'Ganadero' : id === 3 ? 'Veterinario' : 'N/A';
const badgeColor  = (id: number) => id === 2 ? 'primary' : 'warning';

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value;
  if (filtroActivo.value !== 0) lista = lista.filter(u => u.id_tipo_usuario === filtroActivo.value);
  const q = buscar.value.toLowerCase();
  if (q) lista = lista.filter(u =>
    u.nombre.toLowerCase().includes(q) ||
    u.cedula.toLowerCase().includes(q) ||
    u.correo.toLowerCase().includes(q)
  );
  return lista;
});

const cargar = async () => {
  cargando.value = true;
  errorCarga.value = '';
  try {
    const res = await adminService.getUsuarios();
    usuarios.value = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e: any) {
    errorCarga.value = e.response?.data?.message || 'No se pudieron cargar los usuarios.';
  } finally {
    cargando.value = false;
  }
};

const toggleActivo = async (u: UsuarioAPI) => {
  try {
    await adminService.toggleActivo(u.cedula);
    u.activo = !u.activo;
    const t = await toastController.create({
      message: u.activo ? 'Usuario activado.' : 'Usuario desactivado.',
      duration: 2000, color: 'success', position: 'top',
    });
    await t.present();
  } catch {
    const t = await toastController.create({
      message: 'No se pudo cambiar el estado.', duration: 2000, color: 'danger', position: 'top',
    });
    await t.present();
  }
};

// ── Formulario nuevo usuario ───────────────────────────────────────────
const showForm  = ref(false);
const guardando = ref(false);
const verPass   = ref(false);
const formError = ref('');

const form = ref({
  cedula: '', nombre: '', correo: '',
  contrasena: '', contrasena_confirmation: '',
  id_tipo_usuario: 0,
});

const resetForm = () => {
  form.value = { cedula: '', nombre: '', correo: '', contrasena: '', contrasena_confirmation: '', id_tipo_usuario: 0 };
  formError.value = '';
  verPass.value = false;
};

const toggleForm  = () => { showForm.value = !showForm.value; if (!showForm.value) resetForm(); };
const cerrarForm  = () => { showForm.value = false; resetForm(); };

const crearUsuario = async () => {
  formError.value = '';
  const { cedula, nombre, correo, contrasena, contrasena_confirmation, id_tipo_usuario } = form.value;

  if (!cedula || !nombre || !correo || !contrasena || !contrasena_confirmation) {
    formError.value = 'Completá todos los campos obligatorios.'; return;
  }
  if (contrasena !== contrasena_confirmation) {
    formError.value = 'Las contraseñas no coinciden.'; return;
  }
  if (contrasena.length < 8 || !/[A-Z]/.test(contrasena) || !/[a-z]/.test(contrasena) || !/[^A-Za-z0-9]/.test(contrasena)) {
    formError.value = 'La contraseña no cumple los requisitos de seguridad.'; return;
  }
  if (!id_tipo_usuario) {
    formError.value = 'Seleccioná un rol.'; return;
  }

  guardando.value = true;
  try {
    await adminService.crearUsuario({ cedula, nombre, correo, contrasena, contrasena_confirmation, id_tipo_usuario });
    cerrarForm();
    await cargar();
    const t = await toastController.create({
      message: 'Usuario creado correctamente.', duration: 2500, color: 'success', position: 'top',
    });
    await t.present();
  } catch (e: any) {
    const errors = e.response?.data?.errors;
    if (errors) {
      formError.value = Object.values(errors).flat().join(' ');
    } else {
      formError.value = e.response?.data?.message || 'No se pudo crear el usuario.';
    }
  } finally {
    guardando.value = false;
  }
};

onMounted(cargar);
</script>

<style scoped>
.container { padding: 16px; padding-bottom: 100px; }

.toolbar { margin-bottom: 12px; }

.toolbar-top {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.toolbar-top > :first-child { flex: 1; }

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #006d37;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.add-btn ion-icon { font-size: 16px; }

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
}
.filter-chip.active {
  background: #006d37;
  border-color: #006d37;
  color: #fff;
}

/* Formulario */
.form-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.form-title { font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 12px; }

.pass-group { margin: 4px 0; }
.pass-label {
  font-size: 12px; font-weight: 700; margin-left: 6px;
  color: #374151; display: block; margin-bottom: 4px;
}
.pass-row { display: flex; align-items: center; gap: 4px; }
.pass-row > :first-child { flex: 1; }

.eye-btn {
  background: none; border: none; padding: 8px; cursor: pointer;
  color: #6b7280; font-size: 20px; display: flex; align-items: center; flex-shrink: 0;
}

.pass-hints {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-top: 4px; margin-left: 6px;
}
.pass-hints span { font-size: 11px; color: #9ca3af; }
.pass-hints span.ok { color: #16a34a; font-weight: 600; }

.field-group { margin: 8px 0; }
.field-label {
  font-size: 12px; font-weight: 700; margin-left: 6px;
  color: #374151; display: block; margin-bottom: 6px;
}
.native-select {
  width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb;
  border-radius: 12px; background: #fff; color: #374151;
  font-size: 14px; appearance: none;
}

.error-msg {
  background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 8px; padding: 10px 14px; color: #991b1b;
  font-size: 13px; margin: 8px 0;
}

.form-actions {
  display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;
}
.btn-cancel {
  background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
  border-radius: 8px; padding: 7px 16px; font-size: 13px; cursor: pointer;
}
.btn-save {
  background: #006d37; color: #fff; border: none;
  border-radius: 8px; padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Lista */
.loading-box {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 0; color: #6b7280;
}
.center-card { text-align: center; margin-top: 24px; }

.avatar {
  background: #d1fae5; display: flex;
  align-items: center; justify-content: center;
  font-size: 24px; color: #006d37;
}

.desactivado-tag { color: #ef4444; font-size: 11px; }

.total-label {
  text-align: center; font-size: 13px; color: #6b7280; margin-top: 16px;
}
</style>
