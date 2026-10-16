import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbPaginationModule],
  templateUrl: './proveedor-list.component.html'
})
export class ProveedorListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = false;
  mensajeError = '';

  filtroTexto = '';
  filtroEstado: number | '' = '';

  currentPage = 1;
  pageSize = 8;

  constructor(
    private proveedorService: ProveedorService,
    private router: Router
  ) {}

  ngOnInit(): void { void this.cargarProveedores(); }

  async cargarProveedores(): Promise<void> {
    this.loading = true;
    this.mensajeError = '';
    try {
      this.proveedores = await this.proveedorService.obtenerTodos();
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No fue posible cargar los proveedores.';
    } finally {
      this.loading = false;
    }
  }

  onFiltroTextoCambio(): void { this.currentPage = 1; }

  onFiltroEstadoCambio(): void { this.currentPage = 1; }

  get proveedoresFiltrados(): Proveedor[] {
    const texto = this.filtroTexto.trim().toLocaleLowerCase();
    return this.proveedores.filter((prov) => {
      const cumpleTexto =
        texto === '' ||
        String(prov.codproveedor).toLocaleLowerCase().includes(texto) ||
        (prov.nomproveedor ?? '').toLocaleLowerCase().includes(texto) ||
        (prov.apellidoproveedor ?? '').toLocaleLowerCase().includes(texto) ||
        (prov.duiproveedor ?? '').toLocaleLowerCase().includes(texto) ||
        (prov.nitproveedor ?? '').toLocaleLowerCase().includes(texto) ||
        (prov.telefonoproveedor ?? '').toLocaleLowerCase().includes(texto);
      const cumpleEstado = this.filtroEstado === '' || prov.estado === this.filtroEstado;
      return cumpleTexto && cumpleEstado;
    });
  }

  get totalItems(): number {
    return this.proveedoresFiltrados.length;
  }

  get paginatedProveedores(): Proveedor[] {
    const inicio = (this.currentPage - 1) * this.pageSize;
    return this.proveedoresFiltrados.slice(inicio, inicio + this.pageSize);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  editar(prov: Proveedor): void {
    void this.router.navigate(['/proveedores/editar', prov.codempresa, prov.codproveedor]);
  }

  async eliminar(prov: Proveedor): Promise<void> {
    if (!confirm(`¿Deseas eliminar al proveedor "${prov.nomproveedor}"?`)) return;
    try {
      await this.proveedorService.eliminar(prov.codempresa, prov.codproveedor);
      await this.cargarProveedores();
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No fue posible eliminar el proveedor.';
    }
  }
}