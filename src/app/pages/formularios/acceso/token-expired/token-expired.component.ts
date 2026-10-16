import { Component } from '@angular/core';
import { ServicioAuthPortal } from 'src/app/integracion-login/servicios/servicio-auth-portal';

@Component({
  selector: 'app-token-expired',
  templateUrl: './token-expired.component.html',
  styleUrl: './token-expired.component.scss'
})
export class TokenExpiredComponent {
  constructor(private servicioAuthPortal: ServicioAuthPortal) {}

  irAlPortal(): void {
    this.servicioAuthPortal.irAlLogin();
  }
}
