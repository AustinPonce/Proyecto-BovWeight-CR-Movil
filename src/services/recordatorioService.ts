import api from './api';

export interface RecordatorioAPI {
  id_recordatorio: number;
  arete: string;
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'trimestral';
  fecha_inicio: string;
}

export const recordatorioService = {
  async getRecordatorios(arete: string) {
    const res = await api.get(`/animales/${arete}/recordatorios`);
    return res.data as { data: RecordatorioAPI[] };
  },

  async crearRecordatorio(arete: string, datos: { frecuencia: string; fecha_inicio: string }) {
    const res = await api.post(`/animales/${arete}/recordatorios`, datos);
    return res.data as { data: RecordatorioAPI };
  },

  async eliminarRecordatorio(arete: string, idRecordatorio: number) {
    const res = await api.delete(`/animales/${arete}/recordatorios/${idRecordatorio}`);
    return res.data;
  },
};
