import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';

export interface UsuarioAuth {
  cedula: string;
  nombre: string;
  correo: string;
  id_tipo_usuario: number;
  tipoUsuario?: { nombre_tipo: string };
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const usuario = ref<UsuarioAuth | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  // Inicializar usuario desde localStorage si existe
  const userStr = localStorage.getItem('authUser');
  if (userStr) {
    try { usuario.value = JSON.parse(userStr); } catch { /* ignorar */ }
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('authToken', newToken);
  }

  function setUsuario(user: UsuarioAuth) {
    usuario.value = user;
    localStorage.setItem('authUser', JSON.stringify(user));
  }

  function clearAuth() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  async function login(cedula: string, contrasena: string) {
    const data = await authService.login(cedula, contrasena);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  }

  async function cargarUsuario() {
    try {
      const data = await authService.getUsuario();
      setUsuario(data);
      return data;
    } catch {
      clearAuth();
      return null;
    }
  }

  return {
    token,
    usuario,
    isAuthenticated,
    setToken,
    setUsuario,
    clearAuth,
    login,
    logout,
    cargarUsuario,
  };
});
