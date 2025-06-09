# Manual de Colecciones de la Base de Datos

Este documento describe la estructura y los campos principales de las colecciones presentes en el archivo `data.json` del proyecto.

---

## Colección: `properties`

La colección `properties` almacena la información de las propiedades inmobiliarias publicadas en la plataforma.

### Estructura de un documento de propiedad

| Campo            | Tipo de dato   | Descripción                                                                 |
|------------------|---------------|-----------------------------------------------------------------------------|
| id (clave)       | string        | Identificador único de la propiedad (clave del objeto)                      |
| title            | string        | Título o nombre de la propiedad                                             |
| description      | string        | Descripción detallada de la propiedad                                       |
| address          | string        | Dirección completa de la propiedad                                          |
| city             | string        | Ciudad donde se ubica la propiedad                                          |
| location         | objeto        | Coordenadas geográficas (latitud y longitud)                                |
| location.lat     | number        | Latitud de la propiedad                                                     |
| location.lng     | number        | Longitud de la propiedad                                                    |
| price            | number        | Precio de la propiedad                                                      |
| currency         | string        | Moneda del precio (ej. "USD", "USD")                                       |
| propertyType     | string        | Tipo de propiedad (ej. "Casa", "Departamento")                              |
| transactionType  | string        | Tipo de transacción ("Venta", "Renta")                                      |
| bedrooms         | number        | Número de recámaras                                                         |
| bathrooms        | number        | Número de baños                                                             |
| parkingSpots     | number        | Lugares de estacionamiento                                                  |
| landSize         | number        | Tamaño del terreno en m²                                                    |
| constructionSize | number        | Tamaño de construcción en m²                                                |
| features         | array[string] | Lista de características (ej. "Jardín", "Alberca", "Terraza")              |
| images           | array[string] | Imágenes de la propiedad (en base64 o URLs)                                 |
| ownerId          | string        | ID del usuario propietario o anunciante                                      |
| createdAt        | string (ISO)  | Fecha de creación del registro                                              |
| updatedAt        | string (ISO)  | Fecha de última actualización                                               |

#### Ejemplo de documento de propiedad

```json
{
  "title": "Casa en el centro",
  "description": "Hermosa casa cerca del parque...",
  "address": "Calle Falsa 123, Centro",
  "city": "Ciudad de México",
  "location": { "lat": 19.4326, "lng": -99.1332 },
  "price": 2500000,
  "currency": "USD",
  "propertyType": "Casa",
  "transactionType": "Venta",
  "bedrooms": 3,
  "bathrooms": 2,
  "parkingSpots": 1,
  "landSize": 120,
  "constructionSize": 100,
  "features": ["Jardín", "Terraza"],
  "images": ["base64string1", "base64string2"],
  "ownerId": "user456",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-05T15:00:00Z"
}
```

---

## Colección: `users`

La colección `users` almacena la información de los usuarios registrados en la plataforma. Cada usuario está representado por un objeto, cuya clave es el identificador único del usuario (userId).

### Estructura de un usuario

| Campo         | Tipo de dato      | Descripción                                                                 |
|---------------|------------------|-----------------------------------------------------------------------------|
| displayName   | string           | Nombre visible del usuario en la plataforma.                                |
| name          | string           | Nombre del usuario (puede ser alternativo a displayName, según el registro).|
| email         | string           | Correo electrónico del usuario.                                             |
| phoneNumber   | string           | Número de teléfono del usuario (opcional).                                  |
| favorites     | array[string]    | Lista de IDs de propiedades marcadas como favoritas por el usuario.         |

#### Ejemplo de documento de usuario

```json
{
  "displayName": "Rodrigo",
  "email": "rodrigo@example.com",
  "phoneNumber": "75767850",
  "favorites": [
    "a1339f1b-3d0f-40d3-a090-35edb5d2de43",
    "9e0d4b1f-9ef6-4eff-9898-e4d03b601d9a"
  ]
}
```

---

## Relaciones entre colecciones

- **Propiedad–Usuario:**  Cada propiedad (`properties.ownerId`) está relacionada con un usuario (propietario o anunciante). Relación: Muchos a Uno (muchas propiedades pueden pertenecer a un usuario).
- **Favoritos:**  El campo `favorites` en los usuarios es un arreglo de IDs de propiedades, permitiendo a cada usuario marcar varias propiedades como favoritas.

---

## Consideraciones generales

- Los campos pueden variar entre documentos, pero los más comunes están descritos arriba.
- Los identificadores (`userId` y el id de la propiedad) son las claves principales y no se almacenan como campo dentro del objeto, sino como la clave del objeto en la colección.
- Las fechas usan formato ISO 8601.
- Las imágenes pueden estar en base64 o como URLs.

---
