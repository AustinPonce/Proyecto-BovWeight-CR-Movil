import api from './api';

export interface NotificacionAPI {
  id_notificacion: number;
  mensaje: string;
  fecha_envio: string;
  id_recordatorio: number;
  recordatorio?: {
    arete: string;
    frecuencia: string;
    animal?: { nombre: string | null };
  };
}

export const notificacionService = {
  async getNotificaciones() {
    const res = await api.get('/notificaciones');
    return res.data as { data: NotificacionAPI[] };
  },
};
