#!/bin/bash

# Parámetro
COMPONENT_NAME=$1
MODULE_PATH="pages/formularios/$COMPONENT_NAME"

# Extraer el nombre base después del primer guion y reemplazar guiones por guiones bajos
BASE_NAME=$(echo "$COMPONENT_NAME" | sed -E 's/^[^-]+-//' | tr '-' '_')

# Crear el componente
ng generate component "$MODULE_PATH" --standalone=false --skip-tests=true || { echo "Error creando el componente"; exit 1; }

# Crear la estructura de la carpeta 'application'
APPLICATION_PATH="src/app/application/$BASE_NAME"
mkdir -p "$APPLICATION_PATH/Services" || { echo "Error creando la carpeta Services"; exit 1; }
mkdir -p "$APPLICATION_PATH/DTO" || { echo "Error creando la carpeta DTO"; exit 1; }
mkdir -p "$APPLICATION_PATH/Interfaces" || { echo "Error creando la carpeta Interfaces"; exit 1; }

# Formatear nombre de clase (Capitalizar cada palabra después de reemplazar guiones bajos por espacios)
CLASS_NAME=$(echo "$BASE_NAME" | sed -E 's/(^|_)([a-z])/\U\2/g')

# Crear el servicio manualmente
SERVICE_PATH="$APPLICATION_PATH/Services/${CLASS_NAME}.service.ts"
cat <<EOL > "$SERVICE_PATH"
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ${CLASS_NAME}Service {
  constructor() {}
}
EOL
if [[ $? -ne 0 ]]; then
  echo "Error creando el archivo de servicio"
  exit 1
fi

# Crear el DTO
DTO_PATH="$APPLICATION_PATH/DTO/${CLASS_NAME}DTO.ts"
echo "export class ${CLASS_NAME}DTO {}" > "$DTO_PATH" || { echo "Error creando el archivo DTO"; exit 1; }

# Crear la interfaz
INTERFACE_PATH="$APPLICATION_PATH/Interfaces/I${CLASS_NAME}.interface.ts"
echo "export interface I${CLASS_NAME} {}" > "$INTERFACE_PATH" || { echo "Error creando el archivo de la interfaz"; exit 1; }

# Mensaje de éxito
echo "Estructura creada exitosamente:"
echo "Componente: src/app/$MODULE_PATH"
echo "Servicio: $SERVICE_PATH"
echo "DTO: $DTO_PATH"
echo "Interfaz: $INTERFACE_PATH"
