import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { Proveedor } from '../../../core/models/proveedor.model';
import { ProveedorService } from '../../../core/services/proveedor.service';

@Component({
  selector: 'app-reporte-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbPaginationModule, NgbModalModule],
  templateUrl: './reporte-proveedores.component.html',
  styleUrls: ['./reporte-proveedores.component.scss']
})
export class ReporteProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = false;
  mensajeError = '';

  filtroTexto = '';
  filtroEstado: number | '' = '';

  currentPage = 1;
  pageSize = 10;

  fechaReporte = new Date();

  private reporteModalRef?: NgbModalRef;
  @ViewChild('reporteModal') reporteModal!: TemplateRef<any>;

  constructor(
    private proveedorService: ProveedorService,
    public modalService: NgbModal
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

  get fechaTexto(): string {
    return this.fechaReporte.toLocaleDateString('es-SV');
  }

  get sessionUser(): string {
    return sessionStorage.getItem('username') || 'Usuario';
  }

  estadoTexto(estado: number): string {
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  abrirReporte(): void {
    this.reporteModalRef = this.modalService.open(this.reporteModal, { size: 'xl', scrollable: true });
  }

  cerrarReporte(): void {
    this.reporteModalRef?.dismiss();
  }

  imprimirReporte(): void {
    const reporte = document.querySelector('#reporte-imprimible-proveedores');
    if (!reporte) return;

    const ventana = window.open('', '_blank', 'width=1050,height=1100');
    if (!ventana) {
      alert('Permite ventanas emergentes para imprimir el reporte.');
      return;
    }

    ventana.document.write(`<!DOCTYPE html>
      <html lang="es"><head><meta charset="UTF-8"><title>Reporte de Proveedores</title>
      <style>
        @page { size: letter landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff; }
        .app-reporte { width: 100%; margin: 0; padding: 0; background: #fff; color: #000; font: 12px Arial, sans-serif; }
        .app-reporte-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; }
        .app-reporte-header h2 { margin: 0 0 4px; font-size: 18px; text-transform: uppercase; }
        .app-reporte-header p { margin: 0; font-size: 12px; }
        .app-reporte-meta { display: flex; justify-content: space-between; margin: 10px 0; }
        table.app-reporte-tabla { width: 100%; border-collapse: collapse; }
        .app-reporte-tabla th, .app-reporte-tabla td { border: 1px solid #333; padding: 4px 6px; }
        .app-reporte-tabla th { background: #e6e9ee; text-align: center; }
        .app-reporte-tabla tbody tr { page-break-inside: avoid; }
        .app-reporte-footer { margin-top: 10px; text-align: right; }
      </style></head><body>${reporte.outerHTML}<script>window.onload = () => window.print();<\/script></body></html>`);
    ventana.document.close();
  }

  exportarExcel(): void {
    const filas = this.proveedoresFiltrados.map((p) => ({
      'Código': p.codproveedor,
      'Nombre': p.nomproveedor,
      'Apellido': p.apellidoproveedor || '-',
      'DUI': p.duiproveedor || '-',
      'NIT': p.nitproveedor || '-',
      'Teléfono': p.telefonoproveedor || '-',
      'Dirección': p.direccionproveedor || '-',
      'Estado': this.estadoTexto(p.estado)
    }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    const columnas = Object.keys(filas[0] ?? {});
    hoja['!cols'] = columnas.map((col) => ({
      wch: Math.max(col.length, ...filas.map((f) => String(f[col as keyof typeof f]).length)) + 2
    }));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Proveedores');
    XLSX.writeFile(libro, `Reporte_Proveedores_${this.fechaReporte.toISOString().slice(0, 10)}.xlsx`);
  }
}