-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "respuestaAdmin" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_locations" (
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
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_locations" ("ciudad", "createdAt", "direccion", "email", "horario", "id", "imagenUrl", "latitud", "longitud", "nombre", "telefono", "updatedAt") SELECT "ciudad", "createdAt", "direccion", "email", "horario", "id", "imagenUrl", "latitud", "longitud", "nombre", "telefono", "updatedAt" FROM "locations";
DROP TABLE "locations";
ALTER TABLE "new_locations" RENAME TO "locations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
