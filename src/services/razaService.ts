import api from './api';

export interface RazaAPI {
  id_raza: number;
  raza: string;
}

export const razaService = {
  async getRazas() {
    const res = await api.get('/razas');
    return res.data as { data: RazaAPI[] };
  },

  async crearRaza(nombre: string) {
    const res = await api.post('/razas', { raza: nombre });
    return res.data as { data: RazaAPI };
  },

  async actualizarRaza(id: number, nombre: string) {
    const res = await api.put(`/razas/${id}`, { raza: nombre });
    return res.data as { data: RazaAPI };
  },

  async eliminarRaza(id: number) {
    const res = await api.delete(`/razas/${id}`);
    return res.data as { mensaje: string };
  },
};
