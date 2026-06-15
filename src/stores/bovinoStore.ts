import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bovinoService, type AnimalAPI } from '@/services/bovinoService';

export const useBovinoStore = defineStore('bovino', () => {
  const bovinos = ref<AnimalAPI[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function cargarBovinos(params?: { finca?: number }) {
    cargando.value = true;
    error.value = null;
    try {
      const res = await bovinoService.getAnimales(params);
      bovinos.value = res.data;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Error al cargar bovinos';
    } finally {
      cargando.value = false;
    }
  }

  function limpiar() {
    bovinos.value = [];
  }

  return { bovinos, cargando, error, cargarBovinos, limpiar };
});
