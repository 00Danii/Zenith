# Zenith – Aplicación Web de Fondos de Pantalla

**Zenith** es una plataforma web diseñada para explorar y descargar fondos de pantalla de alta calidad. Desarrollada como parte de un proyecto académico para tres materias: _Aplicaciones Web Backend SQL_, _Aplicaciones Web Backend NoSQL_ y _Aplicaciones Web Frontend_.

<p align="center">
  <a target="blank"><img src="zenith-backend/Zenith.svg" width="400"  /></a>
</p>

## Arquitectura del Proyecto

Zenith se compone de tres módulos principales:

## 1. Backend SQL
- **Tecnologías**: [NestJS](https://nestjs.com/), [PostgreSQL](https://www.postgresql.org/)
- **Propósito**: Gestión de usuarios, autenticación, historial de descargas, y estadísticas.
- **Base de datos relacional**: PostgreSQL permite mantener relaciones estructuradas entre usuarios y sus acciones.

## 2. Backend NoSQL
- **Tecnologías**: [NestJS](https://nestjs.com/), [MongoDB](https://www.mongodb.com/)
- **Propósito**: Almacenamiento flexible de información sobre fondos de pantalla (tags, resoluciones, metadatos).
- **Base de datos documental**: MongoDB permite una rápida gestión de recursos multimedia y sus atributos variados.

### Docker – Servicios de Base de Datos

Zenith utiliza Docker para levantar PostgreSQL y MongoDB fácilmente.

### Configuración de bases de datos (backend)

El archivo docker-compose.yml de las bases de datos se ubica dentro de la carpeta zenith-backend.

- cd zenith-backend
- docker-compose up -d


Puedes verificar que ambos servicios corran correctamente con docker ps. Si es la primera vez que ejecutas esto, Compose descargará las imágenes y creará volúmenes persistentes según esté definido en docker-compose.yml.

    Asegúrate de tener un archivo .env con las variables DB_PASSWORD, DB_NAME, y MONGO_DB definidas.

## 3. Frontend
- **Tecnologías**: [React](https://reactjs.org/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Propósito**: Interfaz de usuario para explorar, buscar y descargar fondos de pantalla.
- **Funcionalidades**:
  - Autenticación de usuarios
  - Galería interactiva
  - Buscador por etiquetas y colores
  - Descarga directa
  - Vista responsiva


<br><br><br><br><br>

# Proyecto Académico

Desarrollado como entrega final para:

- ## Aplicaciones Web Backend SQL

- ## Aplicaciones Web Backend - NoSQL

- ## Aplicaciones Web Frontend

<br><br>

# Autores

- ## Orozco Martínez Juan Daniel
- ## Gonzales Sanchez Ehecatl Quetzalcoatl


