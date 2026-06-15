import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fincaService, type FincaAPI } from '@/services/fincaService';

export const useFincaStore = defineStore('finca', () => {
  const fincas = ref<FincaAPI[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function cargarFincas() {
    cargando.value = true;
    error.value = null;
    try {
      const res = await fincaService.getFincas();
      fincas.value = res.data;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Error al cargar fincas';
    } finally {
      cargando.value = false;
    }
  }

  function limpiar() {
    fincas.value = [];
  }

  return { fincas, cargando, error, cargarFincas, limpiar };
});
