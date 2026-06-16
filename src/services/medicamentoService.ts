import api from './api';

export interface MedicamentoAPI {
  id_medicamento: number;
  nombre: string;
  dosis_por_kg: number;
  unidad: string;
  descripcion?: string;
}

export const medicamentoService = {
  // GET /api/medicamentos
  async getMedicamentos() {
    const res = await api.get('/medicamentos');
    return res.data as { data: MedicamentoAPI[] };
  },
};