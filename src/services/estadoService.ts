import api from './api';

export interface EstadoAPI {
  id_estado: number;
  estado: string;
}

export const estadoService = {
  async getEstados() {
    const res = await api.get('/estados');
    return res.data as { data: EstadoAPI[] };
  },

  async crearEstado(nombre: string) {
    const res = await api.post('/estados', { estado: nombre });
    return res.data as { data: EstadoAPI };
  },

  async eliminarEstado(id: number) {
    const res = await api.delete(`/estados/${id}`);
    return res.data;
  },
};
