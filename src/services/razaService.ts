import api from './api';

export interface RazaAPI {
  id_raza: number;
  raza: string;
  factor_correccion: number | null;
}

export const razaService = {
  async getRazas() {
    const res = await api.get('/razas');
    return res.data as { data: RazaAPI[] };
  },

  async crearRaza(datos: { raza: string; factor_correccion: number }) {
    const res = await api.post('/razas', datos);
    return res.data as { data: RazaAPI };
  },

  async actualizarRaza(id: number, datos: { raza: string; factor_correccion: number }) {
    const res = await api.put(`/razas/${id}`, datos);
    return res.data as { data: RazaAPI };
  },

  async eliminarRaza(id: number) {
    const res = await api.delete(`/razas/${id}`);
    return res.data as { mensaje: string };
  },
};
