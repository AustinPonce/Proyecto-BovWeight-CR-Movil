import api from './api';

export interface AuditoriaAPI {
  id_auditoria: number;
  cedula_usuario: string | null;
  accion: string;
  modulo: string;
  descripcion: string;
  ip: string | null;
  created_at: string;
  usuario?: { nombre: string; cedula: string };
}

export const auditoriaService = {
  async getAuditoria(params?: {
    accion?: string;
    modulo?: string;
    desde?: string;
    hasta?: string;
    page?: number;
  }) {
    const res = await api.get('/admin/auditoria', { params });
    return res.data as {
      data: AuditoriaAPI[];
      meta?: { total: number; current_page: number; last_page: number };
    };
  },
};
