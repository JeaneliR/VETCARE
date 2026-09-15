-- CreateTable
CREATE TABLE "user_locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    CONSTRAINT "user_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "nombreCliente" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duenoId" INTEGER,
    "sedeId" INTEGER NOT NULL,
    CONSTRAINT "reviews_duenoId_fkey" FOREIGN KEY ("duenoId") REFERENCES "owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("calificacion", "comentario", "createdAt", "duenoId", "fecha", "id", "sedeId") SELECT "calificacion", "comentario", "createdAt", "duenoId", "fecha", "id", "sedeId" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "user_locations_userId_locationId_key" ON "user_locations"("userId", "locationId");
