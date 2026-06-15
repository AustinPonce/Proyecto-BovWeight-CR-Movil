import api from './api';

export interface FincaAPI {
  id: number;
  nombre: string;
  ubicacion: string;
  animales_count?: number;
  dueno?: any;
  veterinarios?: any[];
}

export const fincaService = {
  // GET /api/fincas  →  { data: FincaAPI[], links, meta }
  async getFincas() {
    const res = await api.get('/fincas');
    return res.data as { data: FincaAPI[]; meta: any };
  },

  // GET /api/fincas/{id}  →  { data: FincaAPI } con animales_count, dueño, veterinarios
  async getFinca(id: number) {
    const res = await api.get(`/fincas/${id}`);
    return res.data as { data: FincaAPI };
  },

  // POST /api/fincas  →  { data: FincaAPI }
  async crearFinca(datos: { nombre: string; ubicacion: string }) {
    const res = await api.post('/fincas', datos);
    return res.data as { data: FincaAPI };
  },

  // PUT /api/fincas/{id}  →  { data: FincaAPI }
  async actualizarFinca(id: number, datos: { nombre: string; ubicacion: string }) {
    const res = await api.put(`/fincas/${id}`, datos);
    return res.data as { data: FincaAPI };
  },

  // DELETE /api/fincas/{id}
  async eliminarFinca(id: number) {
    const res = await api.delete(`/fincas/${id}`);
    return res.data;
  },
};
