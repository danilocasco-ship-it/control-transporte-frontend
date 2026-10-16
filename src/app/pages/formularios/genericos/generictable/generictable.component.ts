// components/generic-table/generic-table.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  HostListener,
  SimpleChanges,
  OnChanges,
  output,
  ChangeDetectorRef,
} from "@angular/core";
import { TableColumn } from "./table-column.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GenericModalDialogComponent } from "../generic-modal-dialog/generic-modal-dialog.component";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";

@Component({
  selector: "app-generic-table",
  template: `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column mb-4">
                <h4 class="card-title mb-0">{{ title }}</h4>
                <div class="d-flex gap-2">
                  <button
                    *ngIf="showNewRegister && hasPermission('ingresar')"
                    class="btn btn-outline-info waves-effect waves-light"
                    (click)="onNew()"
                    id="btn_insertar"
                  >
                    Nuevo Registro
                  </button>
                  
                  <button
                    *ngIf="showExcelDownload"
                    class="btn btn-outline-success waves-effect waves-light"
                    (click)="onExcelDownload()"
                    id="btn_descarga_excel"
                  >
                    Descargar Excel
                  </button>
                  <button
                    *ngIf="
                      showTextoDownload && hasPermission('descargaTextoPlano')
                    "
                    class="btn btn-outline-secondary waves-effect waves-light"
                    (click)="onTextoDownload()"
                    id="btn_descarga_texto_plano"
                  >
                    Descargar Texto
                  </button>
                  <button
                    *ngIf="showPdfDownload && hasPermission('descargaPdf')"
                    class="btn btn-outline-danger waves-effect waves-light"
                    (click)="onPdfDownload()"
                    id="btn_descarga_pdf"
                  >
                    Descargar PDF
                  </button>
                  <button
                    *ngIf="
                      showReporteDownload &&
                      hasPermission('descargaExcelPlantilla')
                    "
                    class="btn btn-outline-dark waves-effect waves-light"
                    (click)="onRporteDownload()"
                    id="btn_descarga_excel_plantilla"
                  >
                    Descargar Reporte
                  </button>
                  <button
                    class="btn btn-outline-info waves-effect waves-light"
                    (click)="toggleShowAll()"
                  >
                    {{ showAll ? "Ver menos" : "Ver todo" }}
                  </button>
                </div>
              </div>
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <!-- Search and additional actions -->
                <div class="d-flex align-items-center gap-2">
                  <select
                    *ngIf="showStatusFilter"
                    class="form-select"
                    (change)="onStatusChange($event)"
                    [disabled]="!data.length"
                  >
                    <option
                      *ngFor="let opt of statusFilterOptions"
                      [value]="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>

                  <input
                    *ngIf="searchEnabled"
                    type="text"
                    class="form-control search"
                    placeholder="Buscar..."
                    (input)="onSearch($event)"
                  />
                  <ng-content select="[tableActions]"></ng-content>
                </div>
              </div>
            </div>
          </div>

          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-gridjs">
                <thead>
                  <tr>
                    <th
                      *ngFor="let column of visibleColumns"
                      [ngClass]="{
                        sort: column.sortable,
                        sorted: column.property === sortColumn
                      }"
                      (click)="column.sortable && onSort(column.property)"
                    >
                      {{ column.header }}
                      <i
                        *ngIf="column.sortable"
                        class="bi"
                        [ngClass]="{
                          'bi-arrow-down':
                            sortColumn === column.property &&
                            sortDirection === 'desc',
                          'bi-arrow-up':
                            sortColumn === column.property &&
                            sortDirection === 'asc',
                          'bi-arrow-down-up': sortColumn !== column.property
                        }"
                      ></i>
                    </th>
                    <th *ngIf="showActions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of paginatedData; trackBy: trackByFn">
                    <td *ngFor="let column of visibleColumns">
                      <ng-container [ngSwitch]="column.type">
                        <ng-container *ngSwitchCase="'date'">
                          {{
                            getValue(item, column.property)
                              | date : column.format || "yyyy-MM-dd"
                          }}
                        </ng-container>
                        <ng-container *ngSwitchDefault>
                          <ngb-highlight
                            [result]="
                              getValue(item, column.property) ||
                              column.defaultValue ||
                              '-'
                            "
                            [term]="searchTerm"
                          ></ngb-highlight>
                        </ng-container>
                      </ng-container>
                    </td>
                    <td *ngIf="showActions" class="text-center">
                      <div class="action-menu-container">
                        <button
                          class="btn btn-icon btn-sm btn-light"
                          [ngbPopover]="popContent"
                          [placement]="'bottom-end'"
                          [container]="'body'"
                          triggers="manual"
                          #p="ngbPopover"
                          (click)="toggleMenu($event, p)"
                        >
                          <i class="mdi mdi-dots-horizontal"></i>
                        </button>

                        <ng-template #popContent>
                          <div class="action-menu-items">
                            <ng-container *ngFor="let action of allowedActions">
                              <button
                                class="menu-item"
                                *ngIf="
                                  actionConfig[action] &&
                                  (actionConfig[action].bypassPermission ||
                                    hasPermission(
                                      actionConfig[action].permission!
                                    )) &&
                                  shouldShowAction(action, item)
                                "
                                (click)="
                                  onActionClick(
                                    actionConfig[action].action,
                                    item
                                  );
                                  p.close()
                                "
                              >
                                <i
                                  class="mdi {{ actionConfig[action].icon }} {{
                                    actionConfig[action].color
                                  }}"
                                ></i>
                                <span>{{ actionConfig[action].text }}</span>
                              </button>
                            </ng-container>
                          </div>
                        </ng-template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              class="row justify-content-between align-items-center mt-3"
              *ngIf="!showAll"
            >
              <div class="col-sm-12 col-md-5">
                <div class="dataTables_info">
                  Mostrando {{ startIndex + 1 }} a {{ endIndex }} de
                  {{ totalItems }} registros
                </div>
              </div>
              <div class="col-sm-12 col-md-5">
                <div class="text-md-right float-md-end">
                  <ngb-pagination
                    [collectionSize]="totalItems"
                    [(page)]="currentPage"
                    [pageSize]="pageSize"
                    [maxSize]="maxPages"
                    [rotate]="true"
                    [boundaryLinks]="true"
                    (pageChange)="onPageChange($event)"
                  >
                  </ngb-pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./generictable.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class GenericTableComponent<T> implements OnChanges {
  @Input() title: string = "Tabla"; // Título de la tabla
  @Input() columns: TableColumn[] = []; // Columnas de la tabla
  @Input() data: T[] = []; // Datos de la tabla
  @Input() pageSize: number = 10; // Tamaño de página
  @Input() entityDTO: any; // 📌 Recibimos el DTO desde el componente padre
  @Input() hiddenColumns: string[] = []; // Nueva propiedad para columnas ocultas
  @Input() selectOptions: { [key: string]: any[] } = {}; // Recibe opciones para los selects
  @Input() excludedFields: string[] = []; // Recibe desde padre los campos a excluir
  @Input() readonlyFields: string[] = []; // Recibe campos readonly desde el padre
  @Input() selectFields: string[] = []; // Recibe campos select desde el padre
  @Input() requiredFields: string[] = []; // Recibe campos requeridos desde el padre
  @Input() allowedActions: string[] = []; // Acciones permitidas desde el padre
  @Input() actionsTemplate?: any; // Plantilla para las acciones
  @Input() searchDebounceTime: number = 300; // Tiempo de espera para búsqueda
  @Input() maxPages: number = 5; // Número máximo de páginas a mostrar

  //Habilitacion o deshabilitacion de botones
  @Input() searchEnabled: boolean = true; // Nuevo estado para habilitar la búsqueda
  @Input() showActions: boolean = false; // Nuevo estado para mostrar acciones
  @Input() showXmlDownload: boolean = false; // Nuevo estado para mostrar botón "Descargar XML"
  @Input() showExcelDownload: boolean = false; // Nuevo estado para mostrar botón "Descargar Excel"
  @Input() showTextoDownload: boolean = false; // Nuevo estado para mostrar botón "Descargar Texto"
  @Input() showPdfDownload: boolean = false; // Nuevo estado para mostrar botón "Descargar PDF"
  @Input() showReporteDownload: boolean = false; // Nuevo estado para mostrar botón "Descargar Reporte Excel"
  @Input() showNewRegister: boolean = false; // Nuevo estado para mostrar botón "Nuevo Registro"
  @Input() showStatusFilter: boolean = false; // Nuevo input para mostrar el filtro
  @Input() validatePermissions: boolean = true; // Nuevo estado para validar permisos

  // Eventos
  @Output() actionClick = new EventEmitter<{ action: string; item: T }>(); // Nuevo evento para acciones
  @Output() edit = new EventEmitter<T>(); // Nuevo evento para edición
  @Output() new = new EventEmitter<T>(); // Nuevo evento para nuevo registro
  @Output() delete = new EventEmitter<T>(); // Nuevo evento para eliminación
  @Output() activate = new EventEmitter<T>(); // Nuevo evento para activación
  @Output() deactivate = new EventEmitter<T>(); // Nuevo evento para desactivación
  @Output() resetPassword = new EventEmitter<T>(); // Nuevo evento para resetear contraseña
  @Output() rowAction = new EventEmitter<{ action: string; item: T }>(); // Nuevo evento para acciones por fila
  @Output() sort = new EventEmitter<{
    column: string;
    direction: "asc" | "desc";
  }>(); // Nuevo evento para ordenar
  @Output() xmlDownload = new EventEmitter<void>(); // Nuevo evento para descargar XML
  @Output() excelDownload = new EventEmitter<void>(); // Nuevo evento para descargar Excel
  @Output() textoDownload = new EventEmitter<void>(); // Nuevo evento para descargar Texto
  @Output() pdfDownload = new EventEmitter<void>(); // Nuevo evento para descargar PDF
  @Output() reporteDownload = new EventEmitter<void>(); // Nuevo evento para descargar Reporte Excel
  @Output() profileSelected = new EventEmitter<number>(); // Nuevo evento para seleccionar perfil
  @Output() fileDownload = new EventEmitter<T>(); // Nuevo evento para descargar archivo

  // Propiedades
  currentPage: number = 1; // Página actual
  searchTerm: string = ""; // Termo de búsqueda
  filteredData: T[] = []; // Datos filtrados
  showAll: boolean = false; // Nuevo estado para controlar "Ver todo"
  sortColumn: string | null = null; // Columna actual para ordenar
  sortDirection: "asc" | "desc" | null = null; // Dirección de orden actual

  private searchSubject = new Subject<string>(); // Nuevo sujeto para búsqueda
  private sortCache: { data: T[]; column: string; direction: string } | null =
    null; // Cache para ordenar
  private visibleColumnsCache: TableColumn[] = []; // Cache de columnas visibles
  // private valueCache = new WeakMap<object, Map<string, any>>(); // Cache de valores
  private valueCache = new Map<object, Map<string, any>>();
  private currentPopover: any = null; // Popover actual
  SPECIAL_INVALID_VALUE = -1; // Valor único para estado inválido

  statusFilterOptions = [
    { value: null, label: "Todos" },
    { value: 1, label: "Activos" },
    { value: 0, label: "Inactivos" },
  ];

  selectedStatus: number | null = null;
  private statusFilterSubject = new Subject<number | null>();

  /**
   * Constructor del componente.
   * Se suscribe al sujeto searchSubject para que cada vez que se realice una búsqueda,
   * se apliquen los filtros a los datos de la tabla.
   * @param modalService Servicio para mostrar modal.
   */
  constructor(
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef
  ) {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchTerm = value;
        this.applyFilters();
      });
    // Añade esta nueva suscripción
    this.statusFilterSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.selectedStatus = value;
        this.applyFilters();
      });
  }
  /**
   * Inicializa el componente.
   * Se utiliza para obtener las columnas visibles al inicio.
   */
  ngOnInit() {
    this.visibleColumns;
  }

  /**
   * Configuración de acciones.
   */
  actionConfig: {
    [key: string]: {
      icon: string;
      text: string;
      color: string;
      action: string;
      permission?: string;
      bypassPermission?: boolean;
    };
  } = {
    edit: {
      icon: "mdi-pencil",
      text: "Editar",
      color: "text-primary",
      action: "edit",
      permission: "actualizar",
      bypassPermission: false,
    },
    delete: {
      icon: "mdi-delete",
      text: "Eliminar",
      color: "text-danger",
      action: "delete",
      permission: "eliminar",
      bypassPermission: false,
    },
    activate: {
      icon: "mdi-account",
      text: "Activar",
      color: "text-success",
      action: "activate",
      permission: "activar",
      bypassPermission: false,
    },
    deactivate: {
      icon: "mdi-account",
      text: "Desactivar",
      color: "text-danger",
      action: "deactivate",
      permission: "desactivar",
      bypassPermission: false,
    },
    reset: {
      icon: "mdi-key",
      text: "Resetear Contraseña",
      color: "text-warning",
      action: "reset",
      permission: "resetPassword",
      bypassPermission: true,
    },
    file: {
      icon: "mdi-file-download-outline",
      text: "Descargar",
      color: "text-success",
      action: "file",
      permission: "descargar",
      bypassPermission: true,
    },
  };

  /**
   * Decide si mostrar una acción en una fila de la tabla, en función del estado de la fila y la acción.
   * @param action Acción a mostrar o no.
   * @param item Fila de la tabla que se está mostrando.
   * @returns true si se debe mostrar la acción, false si no.
   */
  // shouldShowAction(action: string, item: any): boolean {
  //   if (action === "activate") {
  //     return item.activo === false; // Mostrar solo si está inactivo
  //   }
  //   if (action === "deactivate") {
  //     return item.activo === true; // Mostrar solo si está activo
  //   }
  //   return true; // Mostrar otras acciones siempre
  // }

  shouldShowAction(action: string, item: any): boolean {
    // Verificar si el item tiene la propiedad 'activo'
    const hasActiveProperty = item.hasOwnProperty("activo");

    if (action === "activate") {
      return hasActiveProperty ? item.activo === false : true;
    }
    if (action === "deactivate") {
      return hasActiveProperty ? item.activo === true : true;
    }
    return true;
  }

  /**
   * Devuelve las columnas visibles de la tabla.
   * Se filtran las columnas que no están en la lista de columnas ocultas.
   * @returns Las columnas visibles de la tabla.
   */
  /******  2af4fd32-b553-43f4-b09f-331f0ca6c3ca  *******/
  get visibleColumns(): TableColumn[] {
    return this.visibleColumnsCache;
  }

  /**
   * Cierra el popover actual si ya está abierto, y abre el popover actual
   * si no lo está.
   * Se utiliza para controlar el toggle de los popover de las acciones.
   * @param event Evento que se pasa para evitar propagación.
   * @param popover Popover que se va a togglear.
   */
  toggleMenu(event: Event, popover: any) {
    event.stopPropagation();

    // Cerrar el popover anterior si existe y es diferente
    if (this.currentPopover && this.currentPopover !== popover) {
      this.currentPopover.close();
    }

    // Toggle el popover actual
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
      this.currentPopover = popover;
    }
  }

  @HostListener("document:click", ["$event"])
  /**
   * Cierra el popover actual si se hace clic en cualquier lugar del documento.
   * Se utiliza para controlar el cierre automático de los popover de las acciones.
   * @param event Evento que se pasa para evitar propagación.
   */
  onDocumentClick(event: Event) {
    if (this.currentPopover) {
      this.currentPopover.close();
      this.currentPopover = null;
    }
  }

  /**
   * Maneja el clic en una acción.
   * Se utiliza para delegar el clic en una acción a los métodos correspondientes.
   * Emite el evento `actionClick` con la acción y el item correspondiente.
   * @param {string} action Acción que se ha realizado.
   * @param {T} item Item en el que se ha realizado la acción.
   */
  onActionClick(action: string, item: T) {
    const permissionMap: { [key: string]: string } = {
      edit: "actualizar",
      delete: "eliminar",
      activate: "activar",
      deactivate: "desactivar",
      reset: "resetPassword", // Si existe este permiso
    };

    switch (action) {
      case "edit":
        this.onEdit(item);
        break;
      case "delete":
        this.onDelete(item);
        break;
      case "activate":
        this.onActivate(item);
        break;
      case "deactivate":
        this.onDeactivate(item);
        break;
      case "reset":
        this.onResetPassword(item);
        break;
      case "file":
        this.onFileDownload(item);
        break;
    }
    this.actionClick.emit({ action, item });
  }

  /**
   * Abre un modal con una configuración determinada.
   * @param {Object} config Configuración del modal.
   * @param {string} config.title Título del modal.
   * @param {any} config.data Datos a mostrar en el modal.
   * @param {"sm"|"lg"} [config.size] Tamaño del modal.
   * @param {boolean} [config.isConfirmation] Indica si el modal es una confirmación.
   * @param {string} [config.actionType] Tipo de acción de la confirmación.
   * @param {string} [config.actionLabel] Etiqueta de la acción de la confirmación.
   * @param {string} [config.message] Mensaje a mostrar en el modal.
   * @param {(result?: any) => void} [config.onSaveCallback] Función a ejecutar al guardar el formulario.
   */
  private openModal(config: {
    title: string;
    data: any;
    entityType?: any;
    size?: "sm" | "lg";
    isConfirmation?: boolean;
    actionType?: string;
    actionLabel?: string;
    message?: string;
    onSaveCallback?: (result?: any) => void;
  }): void {
    const modalSize = config.size || this.getModalSize(config.data);

    const modalRef = this.modalService.open(GenericModalDialogComponent, {
      size: modalSize,
      backdrop: "static",
      windowClass: "modal-dialog-centered",
    });
    //limpiar los datos
    const cleanData = Object.keys(config.data).reduce(
      (acc: Record<string, any>, key) => {
        acc[key] = config.data[key] === 0 ? 0 : config.data[key];
        return acc;
      },
      {}
    );
    // Configuración común para todos los modales
    modalRef.componentInstance.title = config.title;
    modalRef.componentInstance.data = cleanData;
    modalRef.componentInstance.entityType = config.entityType; // Pasar la clase

    // Configuración específica para confirmaciones
    if (config.isConfirmation) {
      modalRef.componentInstance.showConfirmButtons = true;
      modalRef.componentInstance.actionType = config.actionType;
      modalRef.componentInstance.actionLabel = config.actionLabel;
    } else {
      // Configuración para formularios
      modalRef.componentInstance.excludedFields = this.excludedFields;
      modalRef.componentInstance.selectOptions = this.selectOptions;
      modalRef.componentInstance.readonlyFields = this.readonlyFields;
      modalRef.componentInstance.selectFields = this.selectFields;
      // Escuchar cambios del modal
      modalRef.componentInstance.onProfileChange.subscribe(
        async (idPerfil: number) => {
          // 1. Emitir al padre y esperar que se actualicen los datos
          await this.profileSelected.emit(idPerfil);

          // 2. Esperamos un tick para asegurarnos que los datos están actualizados
          await new Promise((resolve) => setTimeout(resolve, 50)); // Pequeño delay

          // 3. Actualizamos las opciones en el modal
          modalRef.componentInstance.selectOptions = { ...this.selectOptions };
          modalRef.componentInstance.generateFields();

          // 4. Forzamos la detección de cambios
          modalRef.componentInstance.cdRef.detectChanges();
        }
      );
    }

    modalRef.componentInstance.requiredFields = this.requiredFields;

    // Manejo común de eventos
    modalRef.componentInstance.onSave.subscribe((result: any) => {
      if (config.onSaveCallback) {
        config.onSaveCallback(result);
      }
      // Resetear formulario y datos
      modalRef.componentInstance.data = { ...cleanData }; // Restaurar DTO inicial
      modalRef.componentInstance.form?.resetForm(); // Limpiar campos
      modalRef.close();
    });

    modalRef.componentInstance.onClose.subscribe(() => {
      modalRef.close();
    });
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^id_/i, "")
      .replace(/_/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  private detectFieldType(key: string, context: any): string {
    if ((context.selectFields || this.selectFields).includes(key))
      return "select";
    if (key.match(/fecha|date/i)) return "date";
    if (key.match(/email/i)) return "email";
    if (key.match(/password/i)) return "password";
    return "text";
  }

  private resolveActionConfig(context: any): any {
    if (context.isConfirmation) {
      return {
        showConfirmButtons: true,
        actionType: context.actionType,
        actionLabel: context.actionLabel,
        message: context.message,
      };
    }
    return { showConfirmButtons: false };
  }

  private setupModalEvents(modalRef: any, callback?: Function): void {
    modalRef.componentInstance.onSave.subscribe((result: any) => {
      if (callback) callback(result);
      modalRef.close();
    });

    modalRef.componentInstance.onClose.subscribe(() => {
      modalRef.close();
    });
  }

  /**
   * Calcula el tamaño del modal según la cantidad de items en el objeto data.
   * Si el objeto tiene más de 5 items, se devuelve "lg", de lo contrario se devuelve "sm".
   * @param {any} data Objeto con los datos a mostrar en el modal.
   * @returns {string} "sm" o "lg" según la cantidad de items.
   */
  private getModalSize(data: any): "sm" | "lg" {
    const itemCount =
      data && typeof data === "object" ? Object.keys(data).length : 0;
    return itemCount > 5 ? "lg" : "sm";
  }

  /**
   * Abre un modal de confirmación para el item seleccionado.
   * @param {T} item Item que se va a mostrar en el modal.
   * @param {string} actionType Tipo de acción que se va a realizar.
   * @param {string} actionLabel Etiqueta para el botón de confirmación.
   * @param {string} message Mensaje de confirmación que se va a mostrar.
   * @param {EventEmitter<T>} emitter Emisor de eventos que se va a llamar con el
   *     item seleccionado si se confirma la acción.
   */
  private openConfirmationModal(
    item: T,
    actionType: string,
    actionLabel: string,
    message: string,
    emitter: EventEmitter<T>
  ): void {
    this.openModal({
      title: `Confirmar ${actionLabel}`,
      data: {
        mensaje: message,
        detalles: item,
      },
      size: "sm",
      isConfirmation: true,
      actionType: actionType,
      actionLabel: actionLabel,
      onSaveCallback: () => emitter.emit(item),
    });
  }

  /**
   * Abre un modal para agregar un nuevo registro.
   * Emite el nuevo registro a través del evento "new" si se confirma la acción.
   */
  onNew(): void {
    this.openModal({
      title: "Nuevo Registro",
      data: this.entityDTO,
      entityType: this.entityDTO.constructor,
      onSaveCallback: (newData) => {
        this.new.emit(newData);
      },
    });
  }

  /**
   * Abre un modal para editar un item.
   * @param item Item a editar.
   */
  onEdit(item: T): void {
    this.openModal({
      title: "Editar Registro",
      data: { ...item },
      entityType: this.entityDTO.constructor,
      onSaveCallback: (updatedData) => {
        this.edit.emit({ ...item, ...updatedData });
      },
    });
  }

  /**
   * Abre un modal de confirmación para eliminar un item.
   * Emite el item a eliminar a través del evento "delete" si se confirma la acción.
   * @param item Item a eliminar.
   */
  onDelete(item: T): void {
    this.openConfirmationModal(
      item,
      "delete",
      "Eliminación",
      "¿Estás seguro de que deseas eliminar este registro?",
      this.delete
    );
  }
  /**
   * Abre un modal de confirmación para activar un item.
   * Emite el item a activar a través del evento "activate" si se confirma la acción.
   * @param item Item a activar.
   */
  onActivate(item: T): void {
    this.openConfirmationModal(
      item,
      "activate",
      "Activación",
      "¿Estás seguro de que deseas activar este registro?",
      this.activate
    );
  }

  /**
   * Abre un modal de confirmación para inactivar un item.
   * Emite el item a inactivar a través del evento "deactivate" si se confirma la acción.
   * @param item Item a inactivar.
   */
  onDeactivate(item: T): void {
    this.openConfirmationModal(
      item,
      "deactivate",
      "Inactivación",
      "¿Estás seguro de que deseas inactivar este registro?",
      this.deactivate
    );
  }
  /**
   * Abre un modal de confirmación para resetear la contraseña de un item.
   * Emite el item a resetear a través del evento "resetPassword" si se confirma la acción.
   * @param item Item a resetear.
   */
  onResetPassword(item: T): void {
    this.openConfirmationModal(
      item,
      "resetPassword",
      "Cambio de Contraseña",
      "¿Estás seguro de que deseas resetear la contraseña de este registro?",
      this.resetPassword
    );
  }

  /**
   * Emite el evento `fileDownload` cuando se llama a este método.
   * Este método se utiliza para descargar un archivo.
   */
  onFileDownload(item: T): void {
    console.log("Descargando archivo...");

    this.fileDownload.emit(item);
  }

  /**
   * Obtiene los datos paginados para mostrar en la tabla.
   * Si la propiedad `showAll` es verdadera, se devuelven todos los datos ordenados.
   * De lo contrario, se devuelven sólo los datos correspondientes a la página actual,
   * desde `startIndex` hasta `endIndex`.
   * @returns {T[]} Un arreglo de datos paginados.
   */

  get paginatedData(): T[] {
    const sortedData = this.getSortedData();
    return this.showAll
      ? sortedData
      : sortedData.slice(this.startIndex, this.endIndex);
  }

  /**
   * Total de items en la tabla después de aplicar los filtros.
   */
  get totalItems(): number {
    return this.filteredData.length;
  }

  /**
   * Número de item en la tabla desde el que se inicia la paginación actual.
   * Se calcula como (número de página - 1) * tamaño de página.
   */
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  /**
   * Número de item en la tabla hasta el que se extiende la paginación actual.
   * Se calcula como el número de item en el que se inicia la paginación actual
   * (startIndex) más el tamaño de página, siempre y cuando no se supere el total
   * de items en la tabla (totalItems). De lo contrario, se devuelve el total de
   * items en la tabla.
   */
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalItems);
  }

  /**
   * Llamado cuando cambian las propiedades de entrada del componente.
   * Se encarga de actualizar el cache de columnas visibles y de
   * reaplicar los filtros (si es necesario) cuando cambian las
   * propiedades "columns", "hiddenColumns", "data" o "searchTerm".
   * @param changes Un objeto que describe los cambios en las
   *   propiedades de entrada del componente.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectOptions"]) {
      // Si cambian las opciones
      this.valueCache.clear(); // Limpiar caché
      this.cdRef.detectChanges(); // Forzar re-renderizado
    }

    if (changes["columns"] || changes["hiddenColumns"]) {
      this.updateVisibleColumnsCache();
    }
    if (changes["data"] || changes["searchTerm"] || changes["columns"]) {
      this.applyFilters();
    }
  }

  /**
   * Actualiza el cache de columnas visibles.
   * Filtra el arreglo de columnas y devuelve un nuevo arreglo con
   * las columnas que no están en la lista de columnas ocultas.
   * Se llama cada vez que cambian las propiedades "columns" o "hiddenColumns".
   * @returns {TableColumn[]} Un arreglo de columnas visibles.
   */
  private updateVisibleColumnsCache(): void {
    this.visibleColumnsCache = this.columns.filter(
      (column) => !this.hiddenColumns.includes(column.property)
    );
  }

  /**
   * Devuelve el valor de una propiedad de un item.
   * Si la propiedad es una cadena con puntos (ej. "user.name"),
   * se busca en la jerarquía de propiedades del item.
   * Se utiliza un cache para mejorar el rendimiento.
   * @param item El item del que se quiere obtener el valor.
   * @param property La propiedad de la que se quiere obtener el valor.
   * @returns El valor de la propiedad del item.
   */
  // getValue(item: T, property: string): any {
  //   const itemAsObject = item as unknown as object;
  //   if (!this.valueCache.has(itemAsObject)) {
  //     this.valueCache.set(itemAsObject, new Map());
  //   }

  //   const itemCache = this.valueCache.get(itemAsObject)!;
  //   if (itemCache.has(property)) {
  //     return itemCache.get(property);
  //   }

  //   let value = property
  //     .split(".")
  //     .reduce((obj: any, prop: string) => obj?.[prop], item);

  //   // Transformar automáticamente el campo "activo"
  //   if (property === "activo") {
  //     value =
  //       value === true || value === "true" || value === 1
  //         ? "Activo"
  //         : "Inactivo";
  //   }
  //   itemCache.set(property, value);
  //   return value;
  // }

  getValue(item: T, property: string): any {
    const itemAsObject = item as unknown as object;
    if (!this.valueCache.has(itemAsObject)) {
      this.valueCache.set(itemAsObject, new Map());
    }

    const itemCache = this.valueCache.get(itemAsObject)!;
    if (itemCache.has(property)) {
      return itemCache.get(property);
    }

    let value = property
      .split(".")
      .reduce((obj: any, prop: string) => obj?.[prop], item);

    // Manejo de campos select con carga asincrónica
    if (this.selectFields.includes(property)) {
      const options = this.selectOptions[property];

      // Si hay opciones disponibles, buscar la descripción
      if (options?.length) {
        // const found = options.find((opt) => opt.id == value); // == para manejar string/number
        // value = found ? found.descripcion : value;
        const found = options.find((opt) => opt.value == value); // Comparar con 'value'
        value = found ? found.label : value; // Usar 'label' en lugar de 'descripcion'
      }
      // Si no hay opciones aún, guardar el valor crudo y actualizar después
      else {
        this.scheduleUpdate(); // Método nuevo para actualización posterior
      }
    }

    // Transformar campo "activo" (existente)
    if (property === "activo") {
      value =
        value === true || value === "true" || value === 1
          ? "Activo"
          : "Inactivo";
    }

    itemCache.set(property, value);
    return value;
  }

  // Nuevo método para manejar actualizaciones posteriores
  private updateScheduled = false;
  private scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      setTimeout(() => {
        this.valueCache.clear(); // Limpiar caché
        this.cdRef.detectChanges(); // Forzar actualización
        this.updateScheduled = false;
      }, 500); // Esperar 500ms para nuevas cargas
    }
  }

  /**
   * Se llama cuando el usuario escribe en el campo de búsqueda.
   * Emite el valor de búsqueda a través del sujeto searchSubject.
   * @param event Evento de entrada.
   */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  /**
   * Devuelve un identificador único para cada item en la tabla.
   * Se utiliza para mejorar el rendimiento de la tabla.
   * @param index Índice del item en la tabla.
   * @param item El item en la tabla.
   * @returns Un identificador único para el item.
   */
  trackByFn(index: number, item: any): number {
    return index; // Usar un identificador único si está disponible
  }

  /**
   * Se llama cuando el usuario hace clic en una columna de la tabla para ordenarla.
   * Si la columna ya está ordenada, se cambia el sentido del ordenamiento.
   * Si la columna no está ordenada, se establece como columna de ordenamiento
   * con el sentido de ordenamiento "asc".
   * Reinicia la paginación a la primera página después de ordenar.
   * @param column La columna en la que se hace clic para ordenar.
   */
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }
    this.currentPage = 1; // Reinicia a la primera página después de ordenar
  }

  /**
   * Se llama cuando el usuario cambia de página en la tabla.
   * Actualiza el valor de `currentPage` con el número de página que se ha seleccionado.
   * @param page El número de página que se ha seleccionado.
   */
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  /**
   * Alterna entre el modo de mostrar todas las filas de la tabla
   * y el modo de mostrar solo las filas que se ajustan a la
   * paginación.
   * Si se vuelve al modo paginado, se reinicia a la primera página.
   */
  toggleShowAll(): void {
    this.showAll = !this.showAll;
    if (!this.showAll) {
      this.currentPage = 1; // Reiniciar a la primera página si vuelves al modo paginado
    }
  }

  /**
   * Aplica los filtros a los datos de la tabla.
   * Filtra los datos según el término de búsqueda y las columnas visibles.
   */
  // private applyFilters(): void {
  //   const searchRegex = new RegExp(this.searchTerm, "i");

  //   this.filteredData = this.data.filter((item) =>
  //     this.visibleColumns.some((column) => {
  //       const value = this.getValue(item, column.property);
  //       return searchRegex.test(String(value));
  //     })
  //   );
  //   this.sortCache = null; // Invalidar cache de ordenamiento
  // }
  private applyFilters(): void {
    const searchRegex = new RegExp(this.searchTerm, "i");

    this.filteredData = this.data.filter((item: any) => {
      // Filtro por estado
      if (
        this.selectedStatus !== null &&
        (item.activo == true ? 1 : 0) !== this.selectedStatus
      ) {
        return false;
      }

      // Filtro por búsqueda
      return this.visibleColumns.some((column) => {
        const value = this.getValue(item, column.property);
        return searchRegex.test(String(value));
      });
    });

    this.sortCache = null;
  }

  // Añade este nuevo método para manejar el cambio de estado
  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilterSubject.next(value === "null" ? null : Number(value));
  }

  /**
   * Devuelve los datos ordenados según la columna y dirección de ordenamiento actual.
   * Si no se ha establecido una columna de ordenamiento, se devuelve el array original.
   * El ordenamiento se hace con el método `Array.prototype.sort()` y se devuelve un
   * nuevo array con los datos ordenados.
   * @returns Los datos ordenados.
   */
  private getSortedData(): T[] {
    if (!this.sortColumn || !this.sortDirection) {
      return this.filteredData;
    }

    if (
      this.sortCache &&
      this.sortCache.column === this.sortColumn &&
      this.sortCache.direction === this.sortDirection
    ) {
      return this.sortCache.data;
    }

    const sortedData = [...this.filteredData].sort((a, b) => {
      const valueA = this.getValue(a, this.sortColumn!);
      const valueB = this.getValue(b, this.sortColumn!);

      // Optimización: Comparación tipada
      if (typeof valueA === "number" && typeof valueB === "number") {
        return this.sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      return this.sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    this.sortCache = {
      data: sortedData,
      column: this.sortColumn,
      direction: this.sortDirection,
    };

    return sortedData;
  }

  // generic-table.component.ts
  hasPermission(permissionKey: string): boolean {
    if (!this.validatePermissions) return true; // Bypass si está desactivada la validación

    try {
      const botones = JSON.parse(sessionStorage.getItem("botones") || "{}");
      return botones?.[permissionKey] === true;
    } catch (error) {
      console.error("Error al leer permisos:", error);
      return false;
    }
  }
  /**
   * Emite el evento `xmlDownload` cuando se llama a este método.
   */
  onXmlDownload(): void {
    this.xmlDownload.emit();
  }

  /**
   * Emite el evento `excelDownload` cuando se llama a este método.
   * Este método se utiliza para descargar la tabla en formato Excel.
   */
  onExcelDownload(): void {
    this.excelDownload.emit();
  }

  /**
   * Emite el evento `textoDownload` cuando se llama a este método.
   * Este método se utiliza para descargar la tabla en formato de texto.
   */
  onTextoDownload(): void {
    this.textoDownload.emit();
  }

  /**
   * Emite el evento `pdfDownload` cuando se llama a este método.
   * Este método se utiliza para descargar la tabla en formato PDF.
   */
  onPdfDownload(): void {
    this.pdfDownload.emit();
  }

  /**
   * Emite el evento `reporteDownload` cuando se llama a este método.
   * Este método se utiliza para descargar la tabla en formato de reporte excel.
   */
  onRporteDownload(): void {
    this.reporteDownload.emit();
  }

  
}
