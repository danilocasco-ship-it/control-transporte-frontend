/**
 * UNICO ARCHIVO A EDITAR para activar/desactivar el portal SSO.
 *
 * activo: true  → entra por Login (portal / SSO)
 * activo: false → login local del modulo (sin necesidad del portal)
 */
import { environment } from '../../../environments/environment';

export const configPortalAuth = {
  activo: false,
  urlAppLogin: environment.portalAuth.urlAppLogin,
  urlApiLogin: environment.portalAuth.urlApiLogin,
  urlApiModulo: environment.portalAuth.urlApiModulo
};

export const rutasHandoff = {
  canjeCodigo: 'Acceso/exchange',
  sesion: 'handoff/sesion'
} as const;
