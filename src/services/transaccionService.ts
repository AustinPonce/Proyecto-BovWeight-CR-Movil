import api from './api';

export interface TransaccionAPI {
  id: number;
  arete: string;
  tipo: 'compra' | 'venta';
  nombre_contraparte: string;
  cedula_contraparte?: string;
  peso_negociado: number;
  precio_por_kg: number;
  monto_total: number;
  notas?: string;
  fecha: string;
  animal?: { nombre?: string; arete: string };
}

export const transaccionService = {
  // GET /api/transacciones  (params opcionales: tipo, animal)
  async getTransacciones(params?: { tipo?: string; animal?: string }) {
    const res = await api.get('/transacciones', { params });
    return res.data as { data: TransaccionAPI[]; meta?: any };
  },

  // POST /api/transacciones
  async crearTransaccion(datos: {
    tipo: 'compra' | 'venta';
    arete: string;
    nombre_contraparte: string;
    cedula_contraparte?: string;
    precio_por_kg: number;
    peso_negociado: number;
    notas?: string;
  }) {
    const res = await api.post('/transacciones', datos);
    return res.data as { mensaje: string; data: TransaccionAPI };
  },

  // GET /api/transacciones/{id}
  async getTransaccion(id: number) {
    const res = await api.get(`/transacciones/${id}`);
    return res.data as { data: TransaccionAPI };
  },

  // DELETE /api/transacciones/{id}
  async eliminarTransaccion(id: number) {
    const res = await api.delete(`/transacciones/${id}`);
    return res.data as { mensaje: string };
  },
};