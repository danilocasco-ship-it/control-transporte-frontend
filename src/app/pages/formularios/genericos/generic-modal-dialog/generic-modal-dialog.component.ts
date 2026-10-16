import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { ChangeDetectorRef } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-generic-modal-dialog",
  templateUrl: "./generic-modal-dialog.component.html",
  styleUrl: "./generic-modal-dialog.component.scss",
  // changeDetection: ChangeDetectionStrategy.OnPush,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GenericModalDialogComponent {
  // Añadir referencia al formulario
  @ViewChild("form") form!: NgForm;

  @Input() title: string = "Formulario"; // Título del modal
  @Input() data: any = {}; // Datos recibidos
  fields: {
    key: string;
    label: string;
    type: string;
    readonly: boolean;
    options?: any[]; // Nueva propiedad para opciones
  }[] = []; // Campos generados dinámicamente

  @Input() selectOptions: { [key: string]: any[] } = {};
  @Input() excludedFields: string[] = []; // Recibe desde generic-table
  @Input() readonlyFields: string[] = []; // Campos bloqueados por defecto
  @Input() selectFields: string[] = []; // Campos select
  @Input() showConfirmButtons: boolean = false; // Nueva propiedad para mostrar botones de confirmación
  @Input() actionType: "delete" | "activate" | "deactivate" = "delete"; // Acción por defecto
  @Input() actionLabel: string = ""; // Etiqueta personalizada opcional
  @Input() requiredFields: string[] = []; // Campos requeridos
  @Input() entityType: any; // Recibir la clase del DTO

  @Output() onSave = new EventEmitter<any>(); // Evento para guardar datos
  @Output() onClose = new EventEmitter<void>(); // Evento para cerrar modal
  @Output() onProfileChange = new EventEmitter<number>();

  multiColumnLayout = false;
  isSaving: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.generateFields();
    this.initializeRequiredFields();
  }

  /**
   * ngAfterViewInit lifecycle hook
   *
   * Suscribe al evento statusChanges del formulario y fuerza la actualización
   * de la vista con ChangeDetectorRef.detectChanges(). Esto es necesario
   * porque el formulario no se renderiza en el momento en que se inicializa
   * en ngOnInit, por lo que no se puede suscribir al evento statusChanges
   * en ese momento.
   *
   * Si el formulario no existe en este momento, se muestra un aviso en la
   * consola.
   */
  ngAfterViewInit() {
    if (this.form) {
      this.form.statusChanges?.subscribe(() => {
        this.cdRef.detectChanges(); // Forzar actualización de la vista
      });
    } else {
      console.warn("El formulario no está inicializado en ngAfterViewInit");
    }
  }

  actionConfig = {
    delete: {
      btnText: "Eliminar",
      btnClass: "btn-danger",
      message: "¿Estás seguro de que deseas eliminar este registro?",
    },
    activate: {
      btnText: "Activar",
      btnClass: "btn-success",
      message: "¿Estás seguro de que deseas activar este registro?",
    },
    deactivate: {
      btnText: "Desactivar",
      btnClass: "btn-warning",
      message: "¿Estás seguro de que deseas desactivar este registro?",
    },
    resetPassword: {
      btnText: "Resetear Contraseña",
      btnClass: "btn-primary",
      message:
        "¿Estás seguro de que deseas resetear la contraseña de este registro?",
    },
  };

  /**
   * Genera dinámicamente los campos para el formulario según los
   * datos recibidos y los campos excluidos.
   *
   * Recibe los datos del objeto `data` y los campos excluidos en
   * `excludedFields` y devuelve un array de objetos con
   * la siguiente estructura:
   *
   */
  private generateFields(): void {
    this.fields = Object.keys(this.data)
      .filter((key) => !this.excludedFields.includes(key))
      .map((key) => ({
        key,
        label: this.formatLabel(key),
        type: this.getInputType(key),
        // readonly: key === "id",
        readonly: this.isReadonlyField(key),
        options: this.getOptions(key),
      }));
    this.multiColumnLayout = this.fields.length > 5;
  }
  /**
   * Inicializa los campos requeridos con valores predeterminados.
   *
   * Si el campo es un select y no tiene un valor válido, se
   * establece el valor por defecto en una cadena vacía.
   *
   * @private
   */
  private initializeRequiredFields(): void {
    this.requiredFields.forEach((field) => {
      if (
        this.isSelectField(field) &&
        this.isInvalidValue(this.data[field], field)
      ) {
        this.data[field] = "";
      }
    });
  }
  /**
   * Convierte el nombre de un campo en un formato más legible para el usuario.
   * Reemplaza "_" por espacios, elimina "id_" si está al inicio y capitaliza
   * cada palabra.
   * @param key clave del campo
   * @returns el nombre del campo en formato legible
   */
  private formatLabel(key: string): string {
    return (
      key
        .replace(/^btn_/i, "") // Eliminar prefijo btn_
        .replace(/^id_/i, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        // Capitaliza cada palabra
        .replace(/(Xml|Excel)/g, " $1")
    );
  }
  /**
   * Detecta el tipo de campo según el nombre de la clave.
   *
   * - Si la clave contiene "email", el tipo es "email".
   * - Si la clave contiene "password", el tipo es "password".
   * - Si la clave contiene "fecha" o "fec", el tipo es "date".
   * - Si la clave es un select (detectado con `isSelectField`), el tipo es "select".
   * - De lo contrario, el tipo es "text".
   *
   * @param key clave del campo
   * @returns el tipo de campo
   * @private
   */

  public getInputType(key: string): string {
    // 0. Prioridad máxima: si está en selectFields, es select
    if (this.isSelectField(key)) {
      return "select";
    }

    // 1. Obtener tipo del DTO usando metadatos
    const dtoType = this.getDtoFieldType(key);
    if (dtoType) {
      return this.mapType(dtoType);
    }

    // 2. Validar campos booleanos
    if (this.isBooleanField(key)) {
      return "checkbox";
    }

    // 3. Inferir tipo por nombre de campo
    const inferredType = this.inferTypeFromKey(key);
    if (inferredType !== "text") {
      return inferredType;
    }
    // 4. Tipo por defecto
    return "text";
  }

  private mapType(type: string): string {
    const typeMap = {
      number: "number",
      string: "text",
      boolean: "checkbox",
      date: "date",
    };
    return type.toLowerCase() in typeMap
      ? typeMap[type.toLowerCase() as keyof typeof typeMap]
      : "text";
  }

  private isBooleanField(key: string): boolean {
    // Combinar detección por tipo y nombre
    return (
      typeof this.data[key] === "boolean" ||
      key.startsWith("btn_") ||
      key.toLowerCase().includes("activo") ||
      key.toLowerCase().includes("habilitado")
    );
  }


  private getDtoFieldType(key: string): string | null {
    if (this.entityType) {
      try {
        return Reflect.getMetadata(
          "design:type",
          this.entityType.prototype,
          key
        )?.name.toLowerCase();
      } catch (e) {
        console.warn("Error obteniendo metadata para", key, e);
      }
    }
    return null;
  }

  private mapDtoTypeToInput(type: string): string {
    const typeMap: { [key: string]: string } = {
      number: "number",
      string: "text",
      boolean: "checkbox",
      date: "date",
    };
    return typeMap[type] || "text";
  }

  private inferTypeFromKey(key: string): string {
    key = key.toLowerCase();

    if (key.includes("email")) return "email";
    if (key.includes("password")) return "password";
    if (key.includes("fecha") || key.includes("fec")) return "date";
    if (key.includes("telefono") || key.includes("celular")) return "tel";
    if (key.includes("url")) return "url";

    return "text";
  }

  private validateFieldType(key: string, value: any): boolean {
    const expectedType = this.getFieldType(key);

    switch (expectedType) {
      case "number":
        return !isNaN(Number(value));
      case "boolean":
        return typeof value === "boolean";
      case "date":
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  private getFieldType(key: string): string {
    return this.getInputType(key).split(" ")[0]; // Obtener el tipo base
  }

  /**
   * Retorna las opciones de un campo select según su clave.
   *
   * Normaliza la clave del campo (a minúsculas y sin espacios) y la
   * compara con las claves de this.selectOptions (también normalizadas).
   * Si coincide directamente o por singular/plural (Ej: cargo -> cargos),
   * devuelve el array de opciones correspondiente. De lo contrario, devuelve
   * un array vacío.
   * @param key clave del campo
   * @returns array de opciones del campo select
   * @private
   */
  private getOptions(key: string): any[] {
    // Normalizar el nombre del campo
    const normalizedKey = key.toLowerCase().trim();
    // Eliminar prefijos comunes (id_, fk_, etc.)
    const cleanKey = normalizedKey.replace(/^(id_|fk_)/, "");
    // Buscar coincidencia directa o por singular/plural
    const optionKey = Object.keys(this.selectOptions).find(
      (k) =>
        k.toLowerCase() === cleanKey ||
        k.toLowerCase() === `${cleanKey}s` || // Ej: cargo -> cargos
        cleanKey === `${k.toLowerCase()}s`
    );

    return optionKey ? this.selectOptions[optionKey] : [];
  }

  /**
   * Comprueba si un campo es readonly.
   *
   * Busca la clave del campo en this.readonlyFields (también en minúsculas)
   * y devuelve true si coincide.
   * @param key clave del campo
   * @returns true si el campo es readonly, false en caso contrario
   * @private
   */
  private isReadonlyField(key: string): boolean {
    return this.readonlyFields.some(
      (f) => f.toLowerCase() === key.toLowerCase()
    );
  }
  private isInvalidValue(value: any, key: string): boolean {
    return this.isSelectField(key) && this.requiredFields.includes(key)
      ? Number(value) <= 0 ||
          isNaN(Number(value)) ||
          value === null ||
          value === undefined
      : value === null || value === undefined || value === "";
  }
  /**
   * Comprueba si un campo es un select.
   * Busca la clave del campo en this.selectFields (también en minúsculas)
   * y devuelve true si coincide.
   * @param key clave del campo
   * @returns true si el campo es un select, false en caso contrario
   * @private
   */
  private isSelectField(key: string): boolean {
    return this.selectFields.includes(key);
  }
  /**
   * Comprueba si un campo es requerido.
   * Busca la clave del campo en this.requiredFields (también en minúsculas)
   * y devuelve true si coincide.
   * @param key clave del campo
   * @returns true si el campo es requerido, false en caso contrario
   */
  isRequiredField(key: string): boolean {
    return this.requiredFields.includes(key);
  }

  /**
   * Guarda el formulario y cierra el modal.
   *
   * Primero verifica que todos los campos requeridos tengan un valor válido.
   * Si no es así, marca todos los campos como touched y actualiza la validez
   * del formulario. Si el formulario es válido, emite el evento onSave con
   * el objeto de datos y cierra el modal.
   * @returns {void}
   */
  save() {
    if (
      this.requiredFields.some((field) =>
        this.isInvalidValue(this.data[field], field)
      ) ||
      this.form.invalid
    ) {
      this.form.control.markAllAsTouched();
      this.form.control.updateValueAndValidity();
      this.cdRef.detectChanges();
      return;
    }
    this.isSaving = true;
    this.onSave.emit(this.data);
    this.activeModal.close();
    this.isSaving = false;
  }
  /**
   * Cierra el modal sin guardar los cambios.
   *
   * Emite el evento onClose y cierra el modal.
   * @returns {void}
   */
  close() {
    this.onClose.emit();
    this.activeModal.close();
  }
  /**
   * Maneja el cambio en un campo del formulario.
   *
   * Si el campo es "id_perfil", resetea el campo "id_permiso" y emite el
   * evento onProfileChange con el nuevo valor. Luego, espera a que el padre
   * actualice y regenera los campos con nuevas opciones.
   * @param fieldKey clave del campo
   * @param value nuevo valor del campo
   */
  async onFieldChange(fieldKey: string, value: any) {
    if (fieldKey === "id_perfil") {
      // Resetear permiso y emitir cambio
      this.data["id_permiso"] = null;
      this.onProfileChange.emit(value);

      // Esperar a la actualización del padre
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Regenerar campos con nuevas opciones
      this.generateFields();
      this.cdRef.markForCheck(); // Añade esto
      this.cdRef.detectChanges();
    }
  }
  /**
   * Muestra un mensaje de confirmación antes de realizar una acción.
   *
   * Si el usuario confirma la acción, emite el evento onSave con el objeto
   * de datos y cierra el modal. Si cancela, no hace nada.
   * @returns {void}
   */
  showError(field: any): boolean {
    if (!this.form) return false;
    const control = this.form.controls[field.key];

    const isRequired = this.requiredFields.includes(field.key);

    if (field.type === "select" && isRequired) {
      return (
        this.form.submitted &&
        (control?.invalid ||
          this.data[field.key] === -1 ||
          this.data[field.key] === 0 ||
          this.data[field.key] === null ||
          this.data[field.key] === undefined)
      );
    }

    if (field.type === "checkbox" && this.isRequiredField(field.key)) {
      return this.form.submitted && !this.data[field.key];
    }

    return this.form.submitted && control?.invalid;
  }

  // Nuevo método para manejar cambios de fecha
  onDateChange(key: string, value: string) {
    if (key.toLowerCase().includes("fecha")) {
      // Convertir a formato ISO si el backend lo requiere
      this.data[key] = value ? `${value}T00:00:00` : null;
    }
  }
}
