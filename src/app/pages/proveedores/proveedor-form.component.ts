import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importamos ActivatedRoute y Router
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedor-form',
  templateUrl: './proveedor-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ProveedorFormComponent implements OnInit {
  
  proveedorForm!: FormGroup;
  mensaje: string = '';
  esEdicion: boolean = false; // Variable para saber si estamos editando
  codempresaActual: number = 0;
  codproveedorActual: number = 0;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private route: ActivatedRoute, // Para leer la URL
    private router: Router         // Para redirigir
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModoEdicion();
  }

  inicializarFormulario(): void {
    this.proveedorForm = this.fb.group({
      codempresa: [9, Validators.required],
      codproveedor: [0],
      nomproveedor: ['', Validators.required],
      apellidoproveedor: ['', Validators.required],
      duiproveedor: ['', Validators.required],
      nitproveedor: [''],
      nifproveedor: [''],
      telefonoproveedor: ['', Validators.required],
      direccionproveedor: ['', Validators.required],
      estado: [1]
    });
  }

  verificarModoEdicion(): void {
    // Leemos los parámetros de la URL (si existen)
    const codempresa = Number(this.route.snapshot.paramMap.get('codempresa'));
    const codproveedor = Number(this.route.snapshot.paramMap.get('codproveedor'));

    if (codempresa && codproveedor) {
      this.esEdicion = true;
      this.codempresaActual = codempresa;
      this.codproveedorActual = codproveedor;
      this.cargarDatosProveedor(codempresa, codproveedor);
    }
  }

  cargarDatosProveedor(codempresa: number, codproveedor: number): void {
    this.proveedorService.obtenerPorId(codempresa, codproveedor).then(
      (data: Proveedor) => {
        if (data) {
          // Llenamos el formulario con los datos existentes
          this.proveedorForm.patchValue({
            codempresa: data.codempresa,
            codproveedor: data.codproveedor,
            nomproveedor: data.nomproveedor,
            apellidoproveedor: data.apellidoproveedor,
            duiproveedor: data.duiproveedor,
            nitproveedor: data.nitproveedor,
            nifproveedor: data.nifproveedor,
            telefonoproveedor: data.telefonoproveedor,
            direccionproveedor: data.direccionproveedor,
            estado: data.estado
          });
        }
      },
      (error: any) => {
        this.mensaje = '❌ Error al cargar los datos del proveedor.';
        console.error(error);
      }
    );
  }

  guardar(): void {
    if (this.proveedorForm.invalid) {
      this.mensaje = '⚠️ Por favor, completa todos los campos obligatorios.';
      return;
    }

    const datosProveedor: Proveedor = this.proveedorForm.value;

    if (this.esEdicion) {
      // MODO EDICIÓN: Llamamos al método actualizar
      this.proveedorService.actualizar(this.codempresaActual, this.codproveedorActual, datosProveedor).then(
        () => {
          this.mensaje = '✅ ¡Proveedor actualizado exitosamente!';
          setTimeout(() => this.router.navigate(['/proveedores-lista']), 1500); // Regresa a la lista
        },
        (error: any) => {
          this.mensaje = '❌ Error al actualizar. Revisa la consola.';
          console.error(error);
        }
      );
    } else {
      // MODO CREAR: Llamamos al método agregar
      this.proveedorService.agregarProveedor(datosProveedor).then(
        () => {
          this.mensaje = '✅ ¡Proveedor guardado exitosamente!';
          this.proveedorForm.reset({ codempresa: 9, estado: 1 });
        },
        (error: any) => {
          this.mensaje = '❌ Error al guardar. Revisa la consola.';
          console.error(error);
        }
      );
    }
  }
}