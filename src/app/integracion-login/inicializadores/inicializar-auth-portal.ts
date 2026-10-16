import { ServicioAuthPortal } from '../servicios/servicio-auth-portal';

export function inicializarAuthPortal(servicio: ServicioAuthPortal) {
  return () => servicio.inicializar();
}
