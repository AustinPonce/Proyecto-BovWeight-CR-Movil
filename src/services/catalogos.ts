// Catálogos estáticos basados en CatalogosSeeder de Laravel
export const RAZAS = [
  { id: 1, nombre: 'Brahman' },
  { id: 2, nombre: 'Pardo Suizo' },
  { id: 3, nombre: 'Holstein' },
  { id: 4, nombre: 'Nelore' },
  { id: 5, nombre: 'Gyr' },
];

export const SEXOS = [
  { id: 1, nombre: 'Macho' },
  { id: 2, nombre: 'Hembra' },
];

export const ESTADOS = [
  { id: 1, nombre: 'Activo' },
  { id: 2, nombre: 'Vendido' },
  { id: 3, nombre: 'Fallecido' },
];

// Solo roles seleccionables por el usuario (Admin no se puede auto-asignar)
export const TIPOS_USUARIO = [
  { id: 2, nombre: 'Ganadero' },
  { id: 3, nombre: 'Veterinario' },
];
