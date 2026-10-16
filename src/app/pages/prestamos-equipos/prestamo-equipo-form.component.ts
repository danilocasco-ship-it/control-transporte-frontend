import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Equipo } from '../../core/models/equipo.model';
import { PrestamoEquipo } from '../../core/models/prestamo-equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { PrestamoEquipoService } from '../../core/services/prestamo-equipo.service';
import { CatalogoEquipoService } from '../../core/services/catalogo-equipo.service';
import { Contratista, EstadoEquipo, Marca, Sucursal } from '../../core/models/catalogo-equipo.model';
import { PrestamoEquipoReporteComponent, ReportePrestamoEquipo } from '../reportes/prestamo-equipo-reporte/prestamo-equipo-reporte.component';

@Component({
  selector: 'app-prestamo-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbModalModule, PrestamoEquipoReporteComponent],
  templateUrl: './prestamo-equipo-form.component.html'
})
export class PrestamoEquipoFormComponent implements OnInit {
  equipos: Equipo[] = [];
  mensaje = '';
  cargandoEquipos = false;
  sucursales: Sucursal[] = [];
  contratistas: Contratista[] = [];
  estados: EstadoEquipo[] = [];
  marcas: Marca[] = [];
  esEdicion = false;
  reporteDatos: ReportePrestamoEquipo | null = null;
  private reporteModalRef?: NgbModalRef;
  @ViewChild('reporteModal') reporteModal!: TemplateRef<any>;
  private claveOriginal?: { codempresa: number; codsucursal: number; codcontratista: number; codequipo: number };

  prestamoForm = this.fb.group({
    codempresa: [9, [Validators.required, Validators.min(1)]],
    codsucursal: [null as number | null, [Validators.required, Validators.min(1)]],
    codcontratista: [null as number | null, [Validators.required, Validators.min(1)]],
    codequipo: [null as number | null, [Validators.required, Validators.min(1)]],
    fechaprestamo: [this.fechaHoy(), Validators.required],
    estadoprestamo: ['', Validators.required],
    fechadevolucion: [''],
    estadodevolucion: [''],
    observaciones: ['', Validators.maxLength(500)]
  });

  constructor(private fb: FormBuilder, private prestamoService: PrestamoEquipoService, private equipoService: EquipoService, private catalogoService: CatalogoEquipoService, private route: ActivatedRoute, private router: Router, public modalService: NgbModal) {}

  ngOnInit(): void {
    void this.cargarEquipos();
    void this.cargarCatalogos();
    const codempresa = Number(this.route.snapshot.paramMap.get('codempresa'));
    const codsucursal = Number(this.route.snapshot.paramMap.get('codsucursal'));
    const codcontratista = Number(this.route.snapshot.paramMap.get('codcontratista'));
    const codequipo = Number(this.route.snapshot.paramMap.get('codequipo'));
    if (codempresa > 0 && codsucursal > 0 && codcontratista > 0 && codequipo > 0) {
      this.esEdicion = true;
      this.claveOriginal = { codempresa, codsucursal, codcontratista, codequipo };
      void this.cargarPrestamo();
      this.prestamoForm.controls.codempresa.disable();
      this.prestamoForm.controls.codsucursal.disable();
      this.prestamoForm.controls.codcontratista.disable();
      this.prestamoForm.controls.codequipo.disable();
    }
  }

  async cargarCatalogos(): Promise<void> {
    const codempresa = this.prestamoForm.controls.codempresa.value ?? 9;
    try {
      const [sucursales, contratistas, estados, marcas] = await Promise.all([
        this.catalogoService.obtenerSucursales(codempresa),
        this.catalogoService.obtenerContratistas(codempresa),
        this.catalogoService.obtenerEstados(codempresa),
        this.catalogoService.obtenerMarcas(codempresa)
      ]);
      this.sucursales = sucursales; this.contratistas = contratistas; this.estados = estados; this.marcas = marcas;
    } catch (error) { console.error(error); this.mensaje = 'No fue posible cargar los catálogos.'; }
  }

  async cargarEquipos(): Promise<void> {
    this.cargandoEquipos = true;
    try { this.equipos = await this.equipoService.obtenerTodos(); }
    catch (error) { console.error(error); this.mensaje = 'No fue posible cargar los equipos.'; }
    finally { this.cargandoEquipos = false; }
  }

  async cargarPrestamo(): Promise<void> {
    if (!this.claveOriginal) return;
    try {
      const clave = this.claveOriginal;
      const prestamo = await this.prestamoService.obtenerPorId(clave.codempresa, clave.codsucursal, clave.codcontratista, clave.codequipo);
      this.prestamoForm.patchValue({ ...prestamo, fechaprestamo: this.fechaParaInput(prestamo.fechaprestamo), fechadevolucion: this.fechaParaInput(prestamo.fechadevolucion) });
    } catch (error) { console.error(error); this.mensaje = 'No fue posible cargar el préstamo.'; }
  }

  async guardar(): Promise<void> {
    if (this.prestamoForm.invalid) {
      this.prestamoForm.markAllAsTouched();
      this.mensaje = 'Completa los campos obligatorios.';
      return;
    }
    const datos = this.prestamoForm.getRawValue();
    const prestamo: PrestamoEquipo = {
      ...datos,
      codempresa: Number(datos.codempresa),
      codsucursal: Number(datos.codsucursal),
      codcontratista: Number(datos.codcontratista),
      codequipo: Number(datos.codequipo),
      fechaprestamo: datos.fechaprestamo || null,
      fechadevolucion: datos.fechadevolucion || null,
      estadoprestamo: datos.estadoprestamo || null,
      estadodevolucion: datos.estadodevolucion || null,
      observaciones: datos.observaciones || null
    };
    try {
      if (this.esEdicion && this.claveOriginal) {
        const clave = this.claveOriginal;
        await this.prestamoService.actualizar(clave.codempresa, clave.codsucursal, clave.codcontratista, clave.codequipo, prestamo);
        this.mensaje = 'Préstamo actualizado exitosamente.';
        this.mostrarReporte(prestamo);
      } else {
        await this.prestamoService.crear(prestamo);
        this.mensaje = 'Préstamo registrado exitosamente.';
        const guardado: PrestamoEquipo = { ...prestamo };
        this.prestamoForm.reset({ codempresa: 9, codsucursal: null, codcontratista: null, codequipo: null, fechaprestamo: this.fechaHoy(), estadoprestamo: '', fechadevolucion: '', estadodevolucion: '', observaciones: '' });
        this.mostrarReporte(guardado);
      }
    } catch (error) { console.error(error); this.mensaje = 'No fue posible guardar el préstamo.'; }
  }

  private mostrarReporte(prestamo: PrestamoEquipo): void {
    const equipo = this.equipos.find((e) => e.codequipo === prestamo.codequipo);
    const sucursal = this.sucursales.find((s) => s.codsucursal === prestamo.codsucursal);
    const contratista = this.contratistas.find((c) => Number(c.codempleado) === prestamo.codcontratista);
    const marca = equipo?.codmarca ? this.marcas.find((m) => m.codmarca === equipo.codmarca) : null;
    this.reporteDatos = {
      codempresa: prestamo.codempresa,
      numerodoc: `${prestamo.codempresa}-${prestamo.codsucursal}-${prestamo.codcontratista}-${prestamo.codequipo}`,
      fechaRegistro: prestamo.fechaprestamo ? this.fechaParaReporte(prestamo.fechaprestamo) : this.fechaHoy(),
      contratista: contratista ? contratista.nomempleado : `Contratista ${prestamo.codcontratista}`,
      sucursal: sucursal ? sucursal.nomsucursal : `Sucursal ${prestamo.codsucursal}`,
      equipo: {
        codigo: prestamo.codequipo,
        descripcion: equipo ? (equipo.nomequipo + (equipo.modelo ? ` / ${equipo.modelo}` : '')) : ''
      },
      marca: marca ? marca.nommarca : '-',
      observaciones: prestamo.observaciones || '',
      usuario: sessionStorage.getItem('username') || 'Usuario'
    };
    this.reporteModalRef = this.modalService.open(this.reporteModal, { size: 'xl', scrollable: true });
  }

  cerrarReporte(): void {
    this.reporteModalRef?.dismiss();
  }

  private fechaParaReporte(fecha: string): string {
    return fecha.length >= 10 ? fecha.slice(0, 10).split('-').reverse().join('/') : fecha;
  }

  imprimirReporte(): void {
    const reporte = document.querySelector('app-prestamo-equipo-reporte .orden-trabajo');
    if (!reporte) return;

    const ventana = window.open('', '_blank', 'width=900,height=1100');
    if (!ventana) {
      alert('Permite ventanas emergentes para imprimir el reporte.');
      return;
    }

    ventana.document.write(`<!DOCTYPE html>
      <html lang="es"><head><meta charset="UTF-8"><title>Préstamo de equipo</title>
      <style>
        @page { size: letter portrait; margin: 8mm; }
        * { box-sizing: border-box; } body { margin: 0; background: #fff; }
        .orden-trabajo { width: 100%; max-width: none; min-height: 0; margin: 0; padding: 8px 6px; background: #fff; color: #000; font: 12px Arial, sans-serif; }
        .encabezado { display: block; text-align: center; }.encabezado h2 { margin: 0; text-align: center; } .logo { color: #00a94f; font-size: 18px; padding-left: 5px; } h1, h2, p { margin: 0; } h1 { background: #00ae4d; color: #fff; font-size: 32px; font-weight: normal; padding: 7px 15px; text-align: center; }
        .empresa-fecha { display: flex; justify-content: space-between; margin: 23px 4px 0; line-height: 18px; }.empresa strong { display: inline-block; width: 68px; }.documento { text-align: right; }.documento span, .asignacion span { display: inline-block; min-width: 115px; border-bottom: 1px solid #000; padding: 0 5px; text-align: center; }
        .asignacion { width: 56%; margin: 10px 0 20px auto; text-align: right; line-height: 18px; }.asignacion strong { display: inline-block; width: 62px; }.asignacion span { width: 72%; border: 1px solid #000; text-align: left; }
        .datos-principales { display: grid; grid-template-columns: 1.15fr 1fr; gap: 100px; min-height: 118px; }.bloque h2, .observaciones h2 { background: #00ae4d; color: #fff; font-size: 12px; padding: 3px 12px; }.bloque p { padding: 4px 12px; line-height: 17px; }
        .detalle { width: 100%; border-collapse: collapse; margin-top: 5px; }.detalle th, .detalle td { border: 1px solid #333; height: 18px; padding: 3px 8px; }.detalle th { background: #00ae4d; color: #fff; text-align: center; }.detalle th:first-child { width: 11%; }.detalle th:nth-child(2) { width: 49%; }.detalle th:nth-child(3) { width: 14%; }.detalle th:nth-child(4), .detalle th:nth-child(5) { width: 13%; }
        .observaciones { border: 1px solid #333; border-top: 0; min-height: 60px; }.observaciones p { padding: 5px 14px; }.firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 18px; text-align: center; line-height: 28px; }.firmas span { display: inline-block; width: 68%; border-bottom: 1px solid #000; }.firmas small { display: block; }
      </style></head><body>${reporte.outerHTML}<script>window.onload = () => window.print();<\/script></body></html>`);
    ventana.document.close();
    return;

    /* Legacy print template retained only for source history.
    if (!this.reporteDatos) return;
    const d = this.reporteDatos;
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte de préstamo de equipo</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: Letter portrait; margin: 12mm; }
  body { font-family: 'Times New Roman', serif; color: #000; font-size: 14px; }
  .reporte-prestamo { display: flex; flex-direction: column; width: 100%; min-height: 9.5in; padding: 0 0.2in; }
  .empresa { text-align: center; font-size: 16px; font-weight: bold; }
  .titulo { text-align: center; font-size: 18px; font-weight: bold; margin: 8px 0 16px; }
  table.datos { width: 100%; margin-bottom: 12px; border-collapse: collapse; }
  table.datos td { padding: 2px 4px; vertical-align: top; }
  table.datos td.etiqueta { font-weight: bold; text-align: right; width: 130px; }
  table.equipos { width: 100%; border-collapse: collapse; }
  table.equipos th, table.equipos td { border: 1px solid #000; padding: 5px 8px; font-size: 13px; }
  table.equipos th { background: #f0f0f0; text-align: center; }
  .pie { margin-top: auto; padding-top: 12px; }
  table.firmas { width: 100%; border-collapse: collapse; }
  table.firmas td { padding: 6px 4px; vertical-align: top; }
  .firma-titulo { font-weight: bold; text-align: center; }
  .firma-linea { border-top: 1px solid #000; margin-top: 48px; padding-top: 4px; text-align: center; }
</style>
</head>
<body>
  <div class="reporte-prestamo">
    <div class="empresa">GLOBAL DEVELOPER S.A. DE C.V.</div>
    <div class="titulo">Prestamo Equipos</div>
    <table class="datos">
      <tr>
        <td class="etiqueta">N° Doc. :</td>
        <td>${this.esc(d.numerodoc)}</td>
        <td class="etiqueta">Fecha Registro :</td>
        <td>${this.esc(d.fechaRegistro)}</td>
      </tr>
      <tr>
        <td class="etiqueta">Asignado a :</td>
        <td>${this.esc(d.contratista)}</td>
        <td class="etiqueta">Sucursal :</td>
        <td>${this.esc(d.sucursal)}</td>
      </tr>
    </table>
    <table class="equipos">
      <thead>
        <tr>
          <th>Código</th>
          <th>Equipo</th>
          <th>Marca</th>
          <th>Cantidad</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center">${this.esc(d.equipo.codigo)}</td>
          <td>${this.esc(d.equipo.descripcion)}</td>
          <td style="text-align:center">${this.esc(d.marca)}</td>
          <td style="text-align:center">1</td>
          <td>${this.esc(d.observaciones)}</td>
        </tr>
      </tbody>
    </table>
    <div class="pie">
      <table class="firmas">
        <tr>
          <td style="width:50%">
            <div class="firma-titulo">Entregado Por :</div>
            <div class="firma-linea">${this.esc(d.usuario)}</div>
          </td>
          <td style="width:50%">
            <div class="firma-titulo">Recibido Por :</div>
            <div class="firma-linea">Nombre: ______________________</div>
            <div class="firma-titulo" style="margin-top:8px">Firma: ______________________</div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <script>
    window.onload = function () { window.print(); };
  <\/script>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (!win) { alert('Permite ventanas emergentes para imprimir el reporte.'); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    */
  }

  private esc(valor: unknown): string {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private fechaHoy(): string { return new Date().toISOString().slice(0, 10); }
  private fechaParaInput(fecha: string | null | undefined): string { return fecha ? fecha.slice(0, 10) : ''; }
}
