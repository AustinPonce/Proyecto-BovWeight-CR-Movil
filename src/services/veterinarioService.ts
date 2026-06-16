import api from './api';

export interface VeterinarioAPI {
  cedula: string;
  nombre: string;
  correo: string;
}

export const veterinarioService = {
  // GET /api/veterinarios/buscar?q=...
  async getVeterinarios(q?: string) {
    const res = await api.get('/veterinarios/buscar', { params: { q: q ?? '' } });
    return res.data as { data: VeterinarioAPI[] };
  },

  // GET /api/fincas/{finca}/veterinarios
  async getVeterinariosAsignados(idFinca: number) {
    const res = await api.get(`/fincas/${idFinca}/veterinarios`);
    return res.data as { data: VeterinarioAPI[] };
  },

  // POST /api/fincas/{finca}/veterinarios  → body: { cedula_veterinario }
  async asignarVeterinario(idFinca: number, cedula: string) {
    const res = await api.post(`/fincas/${idFinca}/veterinarios`, { cedula_veterinario: cedula });
    return res.data as { mensaje: string; data: VeterinarioAPI };
  },

  // DELETE /api/fincas/{finca}/veterinarios/{cedula}
  async desasignarVeterinario(idFinca: number, cedula: string) {
    const res = await api.delete(`/fincas/${idFinca}/veterinarios/${cedula}`);
    return res.data as { mensaje: string };
  },
};