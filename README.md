# 🐾 VetCare Manager

Sistema de gestión para una veterinaria, desarrollado como proyecto del curso de
**Herramienta de Desarrollo**. Incluye los módulos de dueños, mascotas, citas,
vacunas/tratamientos, baños y cortes (grooming), sedes/ubicación y reseñas.

## Stack tecnológico

- **Frontend:** React 18 + TypeScript + Vite + React Router + Tailwind CSS + Axios
- **Backend:** Node.js + Express + TypeScript + Zod (validación)
- **Base de datos:** SQLite gestionada con Prisma ORM (fácil de correr en cualquier
  laptop sin instalar un motor de base de datos aparte; se puede migrar a
  PostgreSQL/MySQL cambiando solo el `datasource` en `schema.prisma`)

## Estructura del proyecto

```
vetcare-manager/
├── backend/                # API REST (Express + TypeScript + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos de datos (8 entidades)
│   │   └── seed.ts         # Datos de ejemplo
│   └── src/
│       ├── controllers/    # Lógica de cada módulo
│       ├── routes/         # Definición de endpoints
│       ├── schemas/        # Validación con Zod
│       ├── middleware/     # Manejo de errores y validación
│       └── index.ts        # Punto de entrada del servidor
└── frontend/                # Aplicación React
    └── src/
        ├── components/     # Componentes reutilizables (tabla, modal, formularios...)
        ├── pages/          # Una página por módulo
        ├── services/       # Llamadas a la API (axios)
        └── types/          # Tipos TypeScript compartidos
```

## Módulos incluidos

| Módulo | Descripción |
|---|---|
| Dueños | Registro de clientes (nombre, DNI, contacto, dirección) |
| Mascotas | Ficha de cada mascota, vinculada a su dueño |
| Citas | Agenda de consultas por mascota, sede y veterinario |
| Vacunas | Historial de vacunación con control de próximas dosis |
| Tratamientos | Diagnósticos y tratamientos médicos en curso/finalizados |
| Baños y cortes | Servicios de grooming (baño, corte, deslanado, uñas) |
| Sedes / Ubicación | Locales de la veterinaria, dirección, horario y mapa |
| Reseñas | Calificación (1-5 estrellas) y comentarios por sede |

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

## Instalación y ejecución

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # ajusta variables si es necesario
npx prisma migrate dev --name init   # crea la base de datos SQLite y las tablas
npm run seed                  # carga datos de ejemplo
npm run dev                   # inicia el servidor en http://localhost:4000
```

Puedes explorar la base de datos visualmente con:

```bash
npx prisma studio
```

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env          # ajusta VITE_API_URL si el backend corre en otro puerto
npm run dev                   # inicia la app en http://localhost:5173
```

Con ambos servidores corriendo, abre `http://localhost:5173` en el navegador.

## Endpoints principales de la API

Todos bajo el prefijo `/api`:

- `GET/POST /duenos`, `GET/PUT/DELETE /duenos/:id`
- `GET/POST /mascotas`, `GET/PUT/DELETE /mascotas/:id` (filtro `?duenoId=`)
- `GET/POST /sedes`, `GET/PUT/DELETE /sedes/:id`
- `GET/POST /citas`, `GET/PUT/DELETE /citas/:id` (filtros `?mascotaId=`, `?sedeId=`, `?estado=`)
- `GET/POST /vacunas`, `GET/PUT/DELETE /vacunas/:id`
- `GET/POST /tratamientos`, `GET/PUT/DELETE /tratamientos/:id`
- `GET/POST /banos-cortes`, `GET/PUT/DELETE /banos-cortes/:id`
- `GET/POST /resenas`, `GET/PUT/DELETE /resenas/:id`
- `GET /stats/summary` (datos para el dashboard)

## Trabajo en equipo y control de versiones

Como el curso evalúa control de versiones y que **los 3 integrantes contribuyan**,
se sugiere lo siguiente:

### Repositorio remoto

1. Uno de los integrantes sube este proyecto a un repositorio en GitHub/GitLab.
2. Los otros dos lo clonan (`git clone <url>`).
3. `main` (o `master`) debe quedar protegida: nadie sube directo, todo entra por
   Pull Request revisado por al menos otro integrante.

### Propuesta de división de trabajo (3 personas)

Cada módulo ya tiene su backend (rutas + controlador + esquema) y su página en el
frontend, así que se puede repartir por bloques de funcionalidad de punta a punta:

- **Persona 1 — Clientes y mascotas:** módulos de Dueños y Mascotas (incluye la
  ficha/detalle de mascota).
- **Persona 2 — Atención médica:** módulos de Citas, Vacunas y Tratamientos.
- **Persona 3 — Servicios y sedes:** módulos de Baños/Cortes, Sedes/Ubicación y
  Reseñas, además del Dashboard general.

Cada persona puede extender validaciones, mejorar la UI de su bloque, agregar
pruebas o nuevas funcionalidades (ej. reportes, notificaciones) dentro de su
área, y así el historial de commits refleja el aporte real de cada quien.

### Flujo de ramas sugerido

```bash
git checkout -b feature/mascotas-busqueda   # una rama por tarea, no por persona
# ...trabajas y haces commits pequeños y descriptivos...
git push origin feature/mascotas-busqueda
# abres un Pull Request hacia main y pides revisión a un compañero
```

Convención de nombres de rama: `feature/<algo-nuevo>`, `fix/<algo-que-arreglas>`,
`docs/<documentacion>`.

Convención de mensajes de commit (estilo [Conventional Commits](https://www.conventionalcommits.org/)):

```
feat(mascotas): agregar filtro por especie en la tabla
fix(citas): corregir validación de fecha pasada
docs(readme): actualizar instrucciones de instalación
```

### Recomendaciones para que el historial de Git se vea bien

- Comitear seguido (no un solo commit gigante al final).
- Cada commit debe compilar y no dejar el proyecto roto.
- Usar Pull Requests para que quede registro de quién revisó qué.
- Evitar subir `node_modules/`, `.env` o `dev.db` (ya están en `.gitignore`).

## Posibles extensiones (para sumar puntos extra)

- Autenticación de usuarios (veterinario, recepcionista, admin) con distintos permisos.
- Notificaciones por email/WhatsApp de próximas citas o vacunas vencidas.
- Reportes descargables en PDF/Excel de historiales clínicos.
- Calendario visual de citas (vista semanal/mensual).
- Subida real de imágenes (en vez de solo URL) para fotos de mascotas y sedes.
