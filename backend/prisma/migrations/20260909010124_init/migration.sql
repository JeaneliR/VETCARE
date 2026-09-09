-- CreateTable
CREATE TABLE "owners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT,
    "sexo" TEXT NOT NULL,
    "fechaNacimiento" DATETIME,
    "peso" REAL,
    "color" TEXT,
    "esterilizado" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "duenoId" INTEGER NOT NULL,
    CONSTRAINT "pets_duenoId_fkey" FOREIGN KEY ("duenoId") REFERENCES "owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "horario" TEXT,
    "latitud" REAL,
    "longitud" REAL,
    "imagenUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "motivo" TEXT NOT NULL,
    "veterinario" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mascotaId" INTEGER NOT NULL,
    "sedeId" INTEGER NOT NULL,
    CONSTRAINT "appointments_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "fechaAplicacion" DATETIME NOT NULL,
    "proximaDosis" DATETIME,
    "veterinario" TEXT NOT NULL,
    "lote" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mascotaId" INTEGER NOT NULL,
    CONSTRAINT "vaccines_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diagnostico" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "medicamentos" TEXT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "veterinario" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'EN_CURSO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mascotaId" INTEGER NOT NULL,
    CONSTRAINT "treatments_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grooming_services" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoServicio" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "precio" REAL NOT NULL,
    "encargado" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mascotaId" INTEGER NOT NULL,
    "sedeId" INTEGER NOT NULL,
    CONSTRAINT "grooming_services_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "pets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "grooming_services_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duenoId" INTEGER NOT NULL,
    "sedeId" INTEGER NOT NULL,
    CONSTRAINT "reviews_duenoId_fkey" FOREIGN KEY ("duenoId") REFERENCES "owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_dni_key" ON "owners"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");
