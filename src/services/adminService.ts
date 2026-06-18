import api from './api';

export interface UsuarioAPI {
  cedula: string;
  nombre: string;
  correo: string;
  id_tipo_usuario: number;
  tipoUsuario?: { nombre_tipo: string };
  activo?: boolean;
}

export const adminService = {
  async getUsuarios(params?: { tipo?: number; buscar?: string }) {
    const res = await api.get('/usuarios', { params });
    return res.data as { data: UsuarioAPI[]; meta?: { total: number } };
  },

  async crearUsuario(datos: {
    cedula: string;
    nombre: string;
    correo: string;
    contrasena: string;
    contrasena_confirmation: string;
    id_tipo_usuario: number;
  }) {
    const res = await api.post('/usuarios', datos);
    return res.data as { mensaje: string; usuario: UsuarioAPI };
  },

  async actualizarUsuario(cedula: string, datos: Partial<{
    nombre: string;
    correo: string;
    id_tipo_usuario: number;
  }>) {
    const res = await api.put(`/usuarios/${cedula}`, datos);
    return res.data;
  },

  async toggleActivo(cedula: string) {
    const res = await api.patch(`/usuarios/${cedula}/toggle-activo`);
    return res.data;
  },
};