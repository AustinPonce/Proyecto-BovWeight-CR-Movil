import api from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface PesajeAPI {
  id: number;
  arete: string;
  peso: number;
  peso_original?: number | null;
  factor_raza?: number | null;
  peso_corregido?: number | null;
  fecha: string;
  sincronizado: boolean;
  tipo_pesaje_id: number;
  imagen_url: string | null;
  animal?: { arete: string; nombre: string | null };
}

export const pesajeService = {
  // GET /api/pesajes?animal={arete}  →  { data: PesajeAPI[], meta }
  async getPesajes(params?: { animal?: string; finca?: number; page?: number }) {
    const res = await api.get('/pesajes', { params });
    return res.data as { data: PesajeAPI[]; meta: any };
  },

  // POST /api/pesajes (tipo=manual)  →  { data: PesajeAPI }
  async crearPesajeManual(datos: {
    arete: string;
    largo_cuerpo: number;
    altura: number;
    perimetro_toracico: number;
  }) {
    const res = await api.post('/pesajes', { ...datos, tipo: 'manual' });
    return res.data as { data: PesajeAPI };
  },

  // POST /api/pesajes (tipo=foto, multipart)  →  { data: PesajeAPI }
  async crearPesajeFoto(arete: string, imagenBlob: Blob, filename = 'bovino.jpg', tipoAnimal?: string) {
    const formData = new FormData();
    formData.append('arete', arete);
    formData.append('tipo', 'foto');
    formData.append('imagen', imagenBlob, filename);
    if (tipoAnimal) formData.append('tipo_animal', tipoAnimal);

    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/pesajes`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(json?.message || 'Error');
      err.response = { status: res.status, data: json };
      throw err;
    }
    return json as { data: PesajeAPI };
  },

  // PUT /api/pesajes/{id}  →  corregir peso manualmente
  async actualizarPesaje(id: number, datos: { peso: number }) {
    const res = await api.put(`/pesajes/${id}`, datos);
    return res.data as { data: PesajeAPI };
  },

  // DELETE /api/pesajes/{id}
  async eliminarPesaje(id: number) {
    const res = await api.delete(`/pesajes/${id}`);
    return res.data;
  },
};
