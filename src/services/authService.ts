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

  // POST /api/forgot-password  →  { message }
  async forgotPassword(correo: string) {
    const res = await api.post('/forgot-password', { email: correo });
    return res.data as { message: string };
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

  // POST /api/reset-password  →  restablece contraseña con token del correo
  async resetPassword(datos: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) {
    const res = await api.post('/reset-password', datos);
    return res.data as { message: string };
  },

  // PUT /api/usuario/cambiar-contrasena  →  cambia contraseña del usuario autenticado
  async cambiarContrasena(contrasena_actual: string, contrasena_nueva: string, contrasena_nueva_confirmation: string) {
    const res = await api.put('/usuario/cambiar-contrasena', {
      contrasena_actual,
      contrasena_nueva,
      contrasena_nueva_confirmation,
    });
    return res.data as { message: string };
  },
};
