import { Injectable } from "@angular/core";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { ServicioSesion } from "src/app/integracion-login/servicios/servicio-sesion";
import { ServicioAuthPortal } from "src/app/integracion-login/servicios/servicio-auth-portal";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(
    private router: Router,
    private sesion: ServicioSesion,
    private servicioAuthPortal: ServicioAuthPortal
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.sesion.token) {
      if (this.servicioAuthPortal.estaActivo()) {
        this.servicioAuthPortal.irAlLogin();
      } else {
        this.router.navigate(["/auth/login"], {
          queryParams: { returnUrl: state.url },
        });
      }
      return false;
    }

    if (this.sesion.tokenExpirado()) {
      this.sesion.limpiar();
      this.router.navigate(["/formularios/token-expired"]);
      return false;
    }

    return true;
  }
}
