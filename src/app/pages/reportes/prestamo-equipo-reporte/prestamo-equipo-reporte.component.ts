import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ReportePrestamoEquipo {
  codempresa: number;
  numerodoc: string;
  fechaRegistro: string;
  contratista: string;
  sucursal: string;
  equipo: { codigo: number; descripcion: string };
  marca: string;
  observaciones: string;
  usuario: string;
}

@Component({
  selector: 'app-prestamo-equipo-reporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestamo-equipo-reporte.component.html',
  styleUrls: ['./prestamo-equipo-reporte.component.scss']
})
export class PrestamoEquipoReporteComponent {
  @Input({ required: true }) datos!: ReportePrestamoEquipo;
}
