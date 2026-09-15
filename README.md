# 🐾 VetCare Manager

Sistema de gestión para una veterinaria, desarrollado como proyecto del curso de
**Herramienta de Desarrollo**. Incluye los módulos de dueños, mascotas, citas,
vacunas/tratamientos, baños y cortes (grooming), sedes/ubicación y reseñas.

La app tiene dos partes bien separadas, pensadas para dos públicos distintos:

- **Sitio público** (`/`): página de presentación de la veterinaria (servicios,
  sedes, reseñas). Los clientes **no ven ningún acceso destacado al sistema
  interno** — para agendar una cita se les dirige directo a WhatsApp
  (`998 236 732`) con un botón, o pueden llenar un formulario de contacto en la
  web que arma el mensaje y lo abre en WhatsApp. El acceso administrativo solo
  aparece como un enlace pequeño y discreto en el pie de página ("Acceso
  administrativo"), pensado para el personal, no para clientes.
- **Sistema de gestión** (`/app`): el CRUD completo de los 8 módulos, de uso
  exclusivo del personal de la veterinaria. Requiere iniciar sesión
  (`/app/login`) y cada usuario solo puede crear/editar/eliminar en los
  módulos para los que el administrador principal le dio permiso (ver
  siguiente sección).

### Autenticación y permisos

El sistema interno tiene dos roles:

- **ADMIN** (administrador principal): acceso total a todos los módulos, y es
  el único que puede entrar a **Usuarios** (`/app/usuarios`) para crear cuentas
  de personal, activarlas/desactivarlas y asignarles permisos por módulo.
- **STAFF** (personal): puede iniciar sesión y **ver** (listar/consultar)
  cualquier módulo — es necesario para los combos y referencias cruzadas entre
  módulos (por ejemplo, elegir un dueño al crear una mascota) — pero solo puede
  **crear, editar o eliminar** en los módulos que el ADMIN le haya habilitado
  explícitamente (duenos, mascotas, citas, vacunas, tratamientos, grooming,
  sedes, resenas).

Al correr `npm run seed` en el backend se crean 3 cuentas de prueba:

| Rol | Email | Contraseña | Permisos de edición |
|---|---|---|---|
| ADMIN | `admin@vetcare.pe` | `admin123` | Todos los módulos |
| STAFF | `recepcion@vetcare.pe` | `recepcion123` | Dueños, Mascotas, Citas |
| STAFF | `grooming@vetcare.pe` | `grooming123` | Baños y cortes |

**Importante:** estas son credenciales de ejemplo para desarrollo/demo. Antes
de usar el sistema en un entorno real hay que cambiar las contraseñas y el
valor de `JWT_SECRET` en `backend/.env`.

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
npm install                   # instala también bcryptjs y jsonwebtoken (login)
cp .env.example .env          # incluye JWT_SECRET y JWT_EXPIRES_IN; ajusta si quieres
npx prisma migrate dev --name init   # crea la base de datos SQLite y las tablas (incluye usuarios y permisos)
npm run seed                  # carga datos de ejemplo + las 3 cuentas de prueba de arriba
npm run dev                   # inicia el servidor en http://localhost:4000
```

> Si ya tenías el proyecto corriendo **antes** de que se agregara el login,
> necesitas repetir `npm install` (para bajar `bcryptjs`/`jsonwebtoken`), y
> volver a correr `npx prisma migrate dev` y `npm run seed` para que se creen
> las tablas y cuentas de usuario nuevas.

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

Todos bajo el prefijo `/api`. Salvo `POST /auth/login` y los `GET` de `/sedes`
y `/resenas` (que el sitio público consume sin sesión), **todos los endpoints
requieren el header `Authorization: Bearer <token>`**, y los de escritura
(POST/PUT/DELETE) además exigen que el usuario tenga permiso sobre ese módulo
(o sea ADMIN):

- `POST /auth/login`, `GET /auth/me`
- `GET/POST/PUT/DELETE /usuarios` (solo ADMIN)
- `GET/POST /duenos`, `GET/PUT/DELETE /duenos/:id`
- `GET/POST /mascotas`, `GET/PUT/DELETE /mascotas/:id` (filtro `?duenoId=`)
- `GET/POST /sedes`, `GET/PUT/DELETE /sedes/:id` (el `GET` es público)
- `GET/POST /citas`, `GET/PUT/DELETE /citas/:id` (filtros `?mascotaId=`, `?sedeId=`, `?estado=`)
- `GET/POST /vacunas`, `GET/PUT/DELETE /vacunas/:id`
- `GET/POST /tratamientos`, `GET/PUT/DELETE /tratamientos/:id`
- `GET/POST /banos-cortes`, `GET/PUT/DELETE /banos-cortes/:id`
- `GET/POST /resenas`, `GET/PUT/DELETE /resenas/:id` (el `GET` es público)
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
<<<<<<< HEAD
- - **Persona 3 — Servicios y sedes:** módulos de Baños/Cortes y Sedes/Ubicación
  (con asignación de sedes por usuario), además del Dashboard general. Las
  Reseñas ya no son un módulo interno: se gestionan desde la página pública.
=======
- **Persona 3 — Servicios y sedes:** módulos de Baños/Cortes, Sedes/Ubicación
  y Dashboard general. (Reseñas pasó a ser una función pública, no un módulo
  del sistema interno.)
>>>>>>> docs/actualizar-persona3-b

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

- Registro de auditoría (quién creó/editó/eliminó cada cosa y cuándo).
- Notificaciones automáticas por email/WhatsApp de próximas citas o vacunas vencidas.
- Reportes descargables en PDF/Excel de historiales clínicos.
- Calendario visual de citas (vista semanal/mensual).
- Subida real de imágenes (en vez de solo URL) para fotos de mascotas y sedes.
