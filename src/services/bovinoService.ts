import api from './api';

export interface AnimalAPI {
  arete: string;
  nombre: string | null;
  raza: { id: number; nombre: string };
  sexo: { id: number; nombre: string };
  estado: { id: number; nombre: string };
  finca: { id: number; nombre: string };
  pesajes_count?: number;
  ultimo_peso?: { peso: number; fecha: string } | null;
}

export const bovinoService = {
  // GET /api/animales  →  { data: AnimalAPI[], links, meta }
  async getAnimales(params?: { finca?: number; page?: number }) {
    const res = await api.get('/animales', { params });
    return res.data as { data: AnimalAPI[]; meta: any };
  },

  // GET /api/animales/{arete}  →  { data: AnimalAPI } con pesajes cargados
  async getAnimal(arete: string) {
    const res = await api.get(`/animales/${arete}`);
    return res.data as { data: AnimalAPI };
  },

  // POST /api/animales  →  { data: AnimalAPI }
  async crearAnimal(datos: {
    arete: string;
    nombre?: string;
    id_raza: number;
    id_sexo: number;
    id_estado: number;
    id_finca: number;
  }) {
    const res = await api.post('/animales', datos);
    return res.data as { data: AnimalAPI };
  },

  // PUT /api/animales/{arete}
  async actualizarAnimal(arete: string, datos: Record<string, any>) {
    const res = await api.put(`/animales/${arete}`, datos);
    return res.data as { data: AnimalAPI };
  },

  // DELETE /api/animales/{arete}
  async eliminarAnimal(arete: string) {
    const res = await api.delete(`/animales/${arete}`);
    return res.data;
  },
};
