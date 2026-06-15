import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

export const ROL_ADMIN = 1;
export const ROL_GANADERO = 2;
export const ROL_VETERINARIO = 3;

export function useRol() {
  const authStore = useAuthStore();

  const rolId = computed(() => authStore.usuario?.id_tipo_usuario);
  const nombreRol = computed(() => authStore.usuario?.tipoUsuario?.nombre_tipo ?? '');
  const isAdmin = computed(() => rolId.value === ROL_ADMIN);
  const isGanadero = computed(() => rolId.value === ROL_GANADERO);
  const isVeterinario = computed(() => rolId.value === ROL_VETERINARIO);
  const puedeEditar = computed(() => !isVeterinario.value);
  const puedeCrear = computed(() => !isVeterinario.value);

  return { rolId, nombreRol, isAdmin, isGanadero, isVeterinario, puedeEditar, puedeCrear };
}
