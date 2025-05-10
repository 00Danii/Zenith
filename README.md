# Zenith – Aplicación Web de Fondos de Pantalla

**Zenith** es una plataforma web para explorar y descargar fondos de pantalla de alta calidad. Este proyecto fue desarrollado como entrega final para las materias de **Aplicaciones Web Backend SQL**, **Aplicaciones Web Backend NoSQL** y **Aplicaciones Web Frontend**.

<p align="center">
  <img src="zenith-backend/Zenith.svg" width="400" />
</p>

---

## 🏗 Arquitectura del Proyecto

### 1. Backend SQL
- **Tecnologías**: [NestJS](https://nestjs.com/), [PostgreSQL](https://www.postgresql.org/)
- **Funcionalidades**:
  - Gestión de usuarios
  - Autenticación
  - Historial de descargas
  - Estadísticas

### 2. Backend NoSQL
- **Tecnologías**: [NestJS](https://nestjs.com/), [MongoDB](https://www.mongodb.com/)
- **Funcionalidades**:
  - Almacenamiento de fondos de pantalla
  - Tags, resoluciones, metadatos
  - Organización flexible y escalable

### 3. Frontend
- **Tecnologías**: [React](https://reactjs.org/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Funcionalidades**:
  - Autenticación de usuarios
  - Galería interactiva
  - Buscador por etiquetas y colores
  - Descarga directa
  - Vista responsiva

---

## 🐳 Docker – Servicios de Base de Datos

El archivo `docker-compose.yml` se encuentra en la carpeta `zenith-backend`. Para levantar los servicios de base de datos, ejecuta:

```bash
cd zenith-backend
docker-compose up -d
```

---

## 🎓 Proyecto Académico

Este proyecto fue desarrollado como entrega final para las siguientes materias del curso:

- **Aplicaciones Web Backend SQL**
- **Aplicaciones Web Backend NoSQL**
- **Aplicaciones Web Frontend**

Cada módulo del proyecto cumple con los objetivos específicos de dichas asignaturas, aplicando buenas prácticas de desarrollo moderno, arquitectura modular y separación de responsabilidades.

---

## 👥 Autores

- **Juan Daniel Orozco Martínez**
- **Ehecatl Quetzalcoatl Gonzales Sánchez**
