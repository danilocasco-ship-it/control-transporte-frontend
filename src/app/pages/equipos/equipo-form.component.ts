import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Equipo } from '../../core/models/equipo.model';
import { EquipoService } from '../../core/services/equipo.service';
import { CatalogoEquipoService } from '../../core/services/catalogo-equipo.service';
import { Marca, TipoMaquinaria } from '../../core/models/catalogo-equipo.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ServicioSesion } from '../../integracion-login/servicios/servicio-sesion';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './equipo-form.component.html'
})
export class EquipoFormComponent implements OnInit {
  mensaje = '';
  esEdicion = false;
  tiposMaquinaria: TipoMaquinaria[] = [];
  marcas: Marca[] = [];
  proveedores: Proveedor[] = [];
  cargandoCatalogos = false;
  private codempresaActual = 0;
  private codequipoActual = 0;

  equipoForm = this.fb.group({
    codempresa: [9, [Validators.required, Validators.min(1)]],
    codequipo: [0],
    nomequipo: ['', [Validators.required, Validators.maxLength(100)]],
    codtipomaquinaria: [null as number | null],
    codmarca: [null as number | null],
    codproveedor: [null as number | null],
    modelo: ['', Validators.maxLength(50)],
    anio: [null as number | null, [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    placa: ['', Validators.maxLength(15)],
    capacidad: ['', Validators.maxLength(50)],
    estado: [1]
  });

  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogoEquipoService: CatalogoEquipoService,
    private proveedorService: ProveedorService,
    private sesion: ServicioSesion,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    void this.cargarCatalogos(this.equipoForm.controls.codempresa.value ?? 9);
    const codempresa = Number(this.route.snapshot.paramMap.get('codempresa'));
    const codequipo = Number(this.route.snapshot.paramMap.get('codequipo'));
    if (codempresa > 0 && codequipo > 0) {
      this.esEdicion = true;
      this.codempresaActual = codempresa;
      this.codequipoActual = codequipo;
      void this.cargarEquipo(codempresa, codequipo);
    }
  }

  async cargarCatalogos(codempresa: number): Promise<void> {
    this.cargandoCatalogos = true;
    try {
      const [tipos, marcas, proveedores] = await Promise.all([
        this.catalogoEquipoService.obtenerTiposMaquinaria(codempresa),
        this.catalogoEquipoService.obtenerMarcas(codempresa),
        this.proveedorService.obtenerTodos()
      ]);
      this.tiposMaquinaria = tipos;
      this.marcas = marcas;
      this.proveedores = proveedores ?? [];
    } catch (error) {
      console.error(error);
      this.mensaje = 'No fue posible cargar los catálogos de tipos, marcas y proveedores.';
    } finally {
      this.cargandoCatalogos = false;
    }
  }

  async cargarEquipo(codempresa: number, codequipo: number): Promise<void> {
    try {
      const equipo = await this.equipoService.obtenerPorId(codempresa, codequipo);
      this.equipoForm.patchValue(equipo);
    } catch (error) {
      console.error(error);
      this.mensaje = 'No fue posible cargar el equipo.';
    }
  }

  async guardar(): Promise<void> {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.mensaje = 'Completa los campos obligatorios y corrige los datos inválidos.';
      return;
    }

    const equipo = this.equipoForm.getRawValue() as Equipo;
    equipo.codusuario = this.sesion.username;
    try {
      if (this.esEdicion) {
        await this.equipoService.actualizar(this.codempresaActual, this.codequipoActual, equipo);
        this.mensaje = 'Equipo actualizado exitosamente.';
        setTimeout(() => void this.router.navigate(['/equipos-lista']), 800);
      } else {
        await this.equipoService.crear(equipo);
        this.mensaje = 'Equipo guardado exitosamente.';
        this.equipoForm.reset({ codempresa: 9, codequipo: 0, codproveedor: null, estado: 1 });
      }
    } catch (error) {
      console.error(error);
      this.mensaje = 'No fue posible guardar el equipo.';
    }
  }
}
