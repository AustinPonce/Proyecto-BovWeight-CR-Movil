import api from './api';

export interface ComentarioAPI {
  id_comentario: number;
  arete: string;
  comentario: string;
  fecha: string;
  cedula_veterinario: string;
  veterinario?: string;
  animal?: { arete: string; nombre?: string };
}

export const comentarioService = {
  // GET /api/comentarios  → todos los comentarios de animales visibles
  async getComentariosGlobales() {
    const res = await api.get('/comentarios');
    return res.data as { data: ComentarioAPI[] };
  },

  // GET /api/animales/{arete}/comentarios
  async getComentarios(arete: string) {
    const res = await api.get(`/animales/${arete}/comentarios`);
    return res.data as { data: ComentarioAPI[] };
  },

  // POST /api/animales/{arete}/comentarios  → body: { comentario }
  async crearComentario(arete: string, comentario: string) {
    const res = await api.post(`/animales/${arete}/comentarios`, { comentario });
    return res.data as { mensaje: string; data: ComentarioAPI };
  },

  // DELETE /api/animales/{arete}/comentarios/{id_comentario}
  async eliminarComentario(arete: string, idComentario: number) {
    const res = await api.delete(`/animales/${arete}/comentarios/${idComentario}`);
    return res.data as { mensaje: string };
  },
};