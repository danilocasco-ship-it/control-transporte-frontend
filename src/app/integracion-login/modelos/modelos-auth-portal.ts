import { configPortalAuth, rutasHandoff } from '../config/portal-auth.config';

export interface RespuestaCanje {
  token: string;
  uuid?: string;
  slug?: string;
}

export interface RespuestaSesion {
  token: string;
  codusuario?: string;
  nomusuario?: string;
}

export function obtenerConfigPortal() {
  return configPortalAuth;
}

export function obtenerRutasHandoff() {
  return rutasHandoff;
}
