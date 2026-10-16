import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicioSesion } from 'src/app/integracion-login/servicios/servicio-sesion';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private sesion: ServicioSesion) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.sesion.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token.startsWith('Bearer ')
            ? token
            : `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
