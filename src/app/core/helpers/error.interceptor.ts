import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServicioAuthPortal } from 'src/app/integracion-login/servicios/servicio-auth-portal';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private servicioAuthPortal: ServicioAuthPortal) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.servicioAuthPortal.cerrarSesion();
        }
        const error = err.error?.message || err.statusText;
        return throwError(() => error);
      })
    );
  }
}
