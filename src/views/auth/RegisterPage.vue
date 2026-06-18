<template>
  <ion-page>
    <ion-content fullscreen>

      <div class="register-container">
        <ion-card class="register-card">
          <ion-card-content>

            <div class="header">
              <div class="logo">
                <ion-icon :icon="personAddOutline" class="logo-icon" />
              </div>
              <h1>Crear Cuenta</h1>
              <p>Únete a la gestión ganadera inteligente</p>
            </div>

            <BaseInput
              v-model="formulario.cedula"
              label="Cédula *"
              placeholder="Ej: 123456789"
            />

            <BaseInput
              v-model="formulario.nombre"
              label="Nombre completo *"
              placeholder="Ingrese su nombre"
            />

            <BaseInput
              v-model="formulario.correo"
              label="Correo electrónico *"
              placeholder="ejemplo@correo.com"
              type="email"
            />

            <div class="field-group">
              <label class="field-label">Tipo de usuario *</label>
              <select v-model="formulario.id_tipo_usuario" class="native-select">
                <option :value="0" disabled>Seleccione un rol</option>
                <option v-for="t in TIPOS_USUARIO" :key="t.id" :value="t.id">
                  {{ t.nombre }}
                </option>
              </select>
            </div>

            <!-- Contraseña con toggle ojo -->
            <div class="input-wrapper">
              <label class="field-label">Contraseña *</label>
              <div class="pass-row">
                <ion-item lines="none" class="pass-item">
                  <ion-input
                    :value="formulario.contrasena"
                    :type="mostrarContrasena ? 'text' : 'password'"
                    placeholder="Mínimo 8 caracteres"
                    @ionInput="formulario.contrasena = `${($event as CustomEvent).detail.value ?? ''}`"
                  />
                </ion-item>
                <button type="button" class="eye-btn" @click="mostrarContrasena = !mostrarContrasena">
                  <ion-icon :icon="mostrarContrasena ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
              <!-- Indicador de fortaleza -->
              <div v-if="formulario.contrasena" class="strength-row">
                <div class="strength-bar" :class="fortalezaClase" />
                <span class="strength-label" :class="fortalezaClase">{{ fortalezaTexto }}</span>
              </div>
              <!-- Requisitos -->
              <ul v-if="formulario.contrasena" class="req-list">
                <li :class="{ ok: formulario.contrasena.length >= 8 }">
                  {{ formulario.contrasena.length >= 8 ? '✓' : '○' }} Mínimo 8 caracteres
                </li>
                <li :class="{ ok: /[A-Z]/.test(formulario.contrasena) }">
                  {{ /[A-Z]/.test(formulario.contrasena) ? '✓' : '○' }} Una mayúscula
                </li>
                <li :class="{ ok: /[a-z]/.test(formulario.contrasena) }">
                  {{ /[a-z]/.test(formulario.contrasena) ? '✓' : '○' }} Una minúscula
                </li>
                <li :class="{ ok: /[^A-Za-z0-9]/.test(formulario.contrasena) }">
                  {{ /[^A-Za-z0-9]/.test(formulario.contrasena) ? '✓' : '○' }} Un carácter especial
                </li>
              </ul>
            </div>

            <!-- Confirmar contraseña con toggle -->
            <div class="input-wrapper">
              <label class="field-label">Confirmar contraseña *</label>
              <div class="pass-row">
                <ion-item lines="none" class="pass-item">
                  <ion-input
                    :value="formulario.contrasena_confirmation"
                    :type="mostrarConfirmacion ? 'text' : 'password'"
                    placeholder="Repite la contraseña"
                    @ionInput="formulario.contrasena_confirmation = `${($event as CustomEvent).detail.value ?? ''}`"
                  />
                </ion-item>
                <button type="button" class="eye-btn" @click="mostrarConfirmacion = !mostrarConfirmacion">
                  <ion-icon :icon="mostrarConfirmacion ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <BaseButton @click="registrar" :disabled="loading">
              {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
            </BaseButton>

            <div class="login-link">
              <span>¿Ya tienes una cuenta?</span>
              <router-link to="/login">Iniciar sesión</router-link>
            </div>

          </ion-card-content>
        </ion-card>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { IonPage, IonContent, IonCard, IonCardContent, IonIcon, IonItem, IonInput, useIonRouter } from '@ionic/vue';
import { personAddOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { TIPOS_USUARIO } from '@/services/catalogos';

const router = useIonRouter();
const authStore = useAuthStore();

const formulario = reactive({
  cedula: '',
  nombre: '',
  correo: '',
  id_tipo_usuario: 0,
  contrasena: '',
  contrasena_confirmation: '',
});

const loading = ref(false);
const error = ref('');
const mostrarContrasena = ref(false);
const mostrarConfirmacion = ref(false);

const puntosFortaleza = computed(() => {
  const p = formulario.contrasena;
  let pts = 0;
  if (p.length >= 8) pts++;
  if (/[A-Z]/.test(p)) pts++;
  if (/[a-z]/.test(p)) pts++;
  if (/[^A-Za-z0-9]/.test(p)) pts++;
  return pts;
});

const fortalezaTexto = computed(() => {
  const pts = puntosFortaleza.value;
  if (pts <= 1) return 'Débil';
  if (pts === 2) return 'Regular';
  if (pts === 3) return 'Buena';
  return 'Fuerte';
});

const fortalezaClase = computed(() => {
  const pts = puntosFortaleza.value;
  if (pts <= 1) return 'weak';
  if (pts === 2) return 'fair';
  if (pts === 3) return 'good';
  return 'strong';
});

const validarPassword = (pass: string): string | null => {
  if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(pass)) return 'La contraseña debe tener al menos una mayúscula';
  if (!/[a-z]/.test(pass)) return 'La contraseña debe tener al menos una minúscula';
  if (!/[^A-Za-z0-9]/.test(pass)) return 'La contraseña debe tener al menos un carácter especial';
  return null;
};

const registrar = async () => {
  error.value = '';
  if (!formulario.cedula || !formulario.nombre || !formulario.correo ||
      !formulario.contrasena || !formulario.id_tipo_usuario) {
    error.value = 'Por favor completa todos los campos obligatorios';
    return;
  }
  const errPass = validarPassword(formulario.contrasena);
  if (errPass) { error.value = errPass; return; }
  if (formulario.contrasena !== formulario.contrasena_confirmation) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  loading.value = true;
  try {
    const data = await authService.registrar({
      cedula: formulario.cedula,
      nombre: formulario.nombre,
      correo: formulario.correo,
      contrasena: formulario.contrasena,
      contrasena_confirmation: formulario.contrasena_confirmation,
      id_tipo_usuario: formulario.id_tipo_usuario,
    });
    authStore.setToken(data.token);
    authStore.setUsuario(data.usuario);
    router.navigate('/dashboard', 'root');
  } catch (err: any) {
    const errors = err.response?.data?.errors;
    if (errors) {
      const primer = Object.values(errors)[0] as string[];
      error.value = primer[0] || 'Error al registrar';
    } else {
      error.value = err.response?.data?.message || 'Error al crear la cuenta';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9fafb;
}
.register-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  background: #ffffff !important;
}
.header {
  text-align: center;
  margin-bottom: 20px;
}
.logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.logo-icon {
  font-size: 32px;
  color: #006d37;
}
.header h1 {
  font-size: 26px;
  font-weight: bold;
  color: #006d37;
  margin-bottom: 4px;
}
.header p {
  color: #374151;
  font-size: 14px;
}

.field-group, .input-wrapper {
  margin: 12px 0;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.native-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
  background: #fff;
  appearance: auto;
}
.native-select:focus {
  outline: none;
  border-color: #006d37;
}

/* Password row */
.pass-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pass-item {
  --background: #ffffff;
  --border-radius: 12px;
  border: 1px solid #e5e7eb;
  flex: 1;
}
.eye-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 20px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.eye-btn:active { color: #006d37; }

/* Password strength */
.strength-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  transition: background 0.3s;
}
.strength-bar.weak { background: #ef4444; width: 25%; }
.strength-bar.fair { background: #f97316; width: 50%; }
.strength-bar.good { background: #eab308; width: 75%; }
.strength-bar.strong { background: #16a34a; width: 100%; }
.strength-label {
  font-size: 12px;
  font-weight: 600;
}
.strength-label.weak { color: #ef4444; }
.strength-label.fair { color: #f97316; }
.strength-label.good { color: #eab308; }
.strength-label.strong { color: #16a34a; }

.req-list {
  list-style: none;
  padding: 6px 0 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 12px;
}
.req-list li {
  font-size: 11px;
  color: #9ca3af;
  transition: color 0.2s;
}
.req-list li.ok { color: #16a34a; }

.login-link {
  margin-top: 20px;
  text-align: center;
}
.login-link span {
  color: #374151;
}
.login-link a {
  margin-left: 6px;
  color: #006d37;
  font-weight: 600;
  text-decoration: none;
}
.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 10px 0;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
}
</style>