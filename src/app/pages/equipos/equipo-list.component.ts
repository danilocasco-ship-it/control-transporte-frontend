import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Equipo } from '../../core/models/equipo.model';
import { PrestamoEquipo } from '../../core/models/prestamo-equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { PrestamoEquipoService } from '../../core/services/prestamo-equipo.service';

@Component({
  selector: 'app-equipo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbPaginationModule],
  templateUrl: './equipo-list.component.html'
})
export class EquipoListComponent implements OnInit {
  equipos: Equipo[] = [];
  prestamos: PrestamoEquipo[] = [];
  cargando = false;
  mensajeError = '';

  filtroTexto = '';
  filtroEstado: number | '' = '';

  currentPage = 1;
  pageSize = 8;

  private readonly codempresa = 9;

  constructor(
    private equipoService: EquipoService,
    private prestamoService: PrestamoEquipoService,
    private router: Router
  ) {}

  ngOnInit(): void { void this.cargarTodo(); }

  async cargarTodo(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    try {
      const [equipos, prestamos] = await Promise.all([
        this.equipoService.obtenerTodos(),
        this.prestamoService.obtenerTodos(this.codempresa)
      ]);
      this.equipos = equipos;
      this.prestamos = prestamos;
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No fue posible cargar los equipos.';
    } finally {
      this.cargando = false;
    }
  }

  onFiltroTextoCambio(): void {
    this.currentPage = 1;
  }

  onFiltroEstadoCambio(): void {
    this.currentPage = 1;
  }

  get equiposFiltrados(): Equipo[] {
    const texto = this.filtroTexto.trim().toLocaleLowerCase();
    return this.equipos.filter((equipo) => {
      const cumpleTexto =
        texto === '' ||
        String(equipo.codequipo).toLocaleLowerCase().includes(texto) ||
        (equipo.nomequipo ?? '').toLocaleLowerCase().includes(texto) ||
        (equipo.nomproveedor ?? '').toLocaleLowerCase().includes(texto) ||
        (equipo.modelo ?? '').toLocaleLowerCase().includes(texto) ||
        (equipo.placa ?? '').toLocaleLowerCase().includes(texto) ||
        (equipo.capacidad ?? '').toLocaleLowerCase().includes(texto);
      const cumpleEstado = this.filtroEstado === '' || equipo.estado === this.filtroEstado;
      return cumpleTexto && cumpleEstado;
    });
  }

  get totalItems(): number {
    return this.equiposFiltrados.length;
  }

  get paginatedEquipos(): Equipo[] {
    const inicio = (this.currentPage - 1) * this.pageSize;
    return this.equiposFiltrados.slice(inicio, inicio + this.pageSize);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get totalEquipos(): number { return this.equipos.length; }
  get equiposActivos(): number { return this.equipos.filter((e) => e.estado === 1).length; }
  get equiposInactivos(): number { return this.equipos.filter((e) => e.estado !== 1).length; }
  get equiposEnPrestamo(): number { return this.prestamos.filter((p) => !p.fechadevolucion).length; }
  get totalPrestamos(): number { return this.prestamos.length; }

  editar(equipo: Equipo): void {
    void this.router.navigate(['/equipos/editar', equipo.codempresa, equipo.codequipo]);
  }

  async eliminar(equipo: Equipo): Promise<void> {
    if (!confirm(`¿Deseas desactivar el equipo "${equipo.nomequipo}"?`)) return;
    try {
      await this.equipoService.eliminar(equipo.codempresa, equipo.codequipo);
      await this.cargarTodo();
    } catch (error) { console.error(error); this.mensajeError = 'No fue posible desactivar el equipo.'; }
  }
}