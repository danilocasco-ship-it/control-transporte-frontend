import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PrestamoEquipo } from '../../core/models/prestamo-equipo.model';
import { PrestamoEquipoService } from '../../core/services/prestamo-equipo.service';

@Component({
  selector: 'app-prestamo-equipo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbPaginationModule],
  templateUrl: './prestamo-equipo-list.component.html'
})
export class PrestamoEquipoListComponent implements OnInit {
  prestamos: PrestamoEquipo[] = [];
  loading = false;
  mensajeError = '';
  private readonly codempresa = 9;

  filtroTexto = '';
  filtroEstado = '';

  currentPage = 1;
  pageSize = 8;

  constructor(private prestamoService: PrestamoEquipoService, private router: Router) {}

  ngOnInit(): void { void this.cargarPrestamos(); }

  get estadosDisponibles(): string[] {
    return [...new Set(this.prestamos.map((p) => p.estadoprestamo).filter((e): e is string => !!e))];
  }

  async cargarPrestamos(): Promise<void> {
    this.loading = true;
    this.mensajeError = '';
    try {
      this.prestamos = await this.prestamoService.obtenerTodos(this.codempresa);
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No fue posible cargar los préstamos.';
    } finally {
      this.loading = false;
    }
  }

  onFiltroTextoCambio(): void { this.currentPage = 1; }

  onFiltroEstadoCambio(): void { this.currentPage = 1; }

  get prestamosFiltrados(): PrestamoEquipo[] {
    const texto = this.filtroTexto.trim().toLocaleLowerCase();
    return this.prestamos.filter((prestamo) => {
      const cumpleTexto =
        texto === '' ||
        String(prestamo.codsucursal).toLocaleLowerCase().includes(texto) ||
        String(prestamo.codcontratista).toLocaleLowerCase().includes(texto) ||
        String(prestamo.codequipo).toLocaleLowerCase().includes(texto) ||
        (prestamo.estadoprestamo ?? '').toLocaleLowerCase().includes(texto) ||
        (prestamo.observaciones ?? '').toLocaleLowerCase().includes(texto);
      const cumpleEstado = this.filtroEstado === '' || prestamo.estadoprestamo === this.filtroEstado;
      return cumpleTexto && cumpleEstado;
    });
  }

  get totalItems(): number {
    return this.prestamosFiltrados.length;
  }

  get paginatedPrestamos(): PrestamoEquipo[] {
    const inicio = (this.currentPage - 1) * this.pageSize;
    return this.prestamosFiltrados.slice(inicio, inicio + this.pageSize);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  editar(prestamo: PrestamoEquipo): void {
    void this.router.navigate(['/prestamos-equipos/editar', prestamo.codempresa, prestamo.codsucursal, prestamo.codcontratista, prestamo.codequipo]);
  }

  async eliminar(prestamo: PrestamoEquipo): Promise<void> {
    if (!confirm(`¿Deseas eliminar el préstamo del equipo ${prestamo.codequipo}?`)) return;
    try {
      await this.prestamoService.eliminar(prestamo.codempresa, prestamo.codsucursal, prestamo.codcontratista, prestamo.codequipo);
      await this.cargarPrestamos();
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No fue posible eliminar el préstamo.';
    }
  }
}