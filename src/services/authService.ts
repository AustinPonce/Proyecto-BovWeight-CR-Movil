import api from './api';

export const authService = {
  // POST /api/login  →  { mensaje, usuario, token }
  async login(cedula: string, contrasena: string) {
    const res = await api.post('/login', { cedula, contrasena });
    return res.data as { mensaje: string; usuario: any; token: string };
  },

  // POST /api/registro  →  { mensaje, usuario, token }
  async registrar(datos: {
    cedula: string;
    nombre: string;
    correo: string;
    contrasena: string;
    contrasena_confirmation: string;
    id_tipo_usuario: number;
  }) {
    const res = await api.post('/registro', datos);
    return res.data as { mensaje: string; usuario: any; token: string };
  },

  // POST /api/logout
  async logout() {
    const res = await api.post('/logout', {});
    return res.data;
  },

  // GET /api/usuario  →  usuario con tipoUsuario
  async getUsuario() {
    const res = await api.get('/usuario');
    return res.data;
  },
};
