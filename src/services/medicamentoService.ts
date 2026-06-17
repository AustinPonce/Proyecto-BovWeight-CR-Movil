import api from './api';

export interface MedicamentoAPI {
  id_medicamento: number;
  nombre: string;
  dosis_por_kg: number;
  unidad: string;
  descripcion?: string;
}

export const medicamentoService = {
  async getMedicamentos() {
    const res = await api.get('/medicamentos');
    return res.data as { data: MedicamentoAPI[] };
  },

  async crearMedicamento(datos: Omit<MedicamentoAPI, 'id_medicamento'>) {
    const res = await api.post('/medicamentos', datos);
    return res.data as { data: MedicamentoAPI };
  },

  async actualizarMedicamento(id: number, datos: Omit<MedicamentoAPI, 'id_medicamento'>) {
    const res = await api.put(`/medicamentos/${id}`, datos);
    return res.data as { data: MedicamentoAPI };
  },

  async eliminarMedicamento(id: number) {
    const res = await api.delete(`/medicamentos/${id}`);
    return res.data as { mensaje: string };
  },
};