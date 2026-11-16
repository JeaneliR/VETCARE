#!/bin/sh
set -e

echo "📦 Aplicando migraciones de Prisma..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Ejecutando seed inicial..."
  # Sin redirigir stderr a /dev/null: si el seed falla, queremos ver el
  # error real en los logs en vez de solo "no se pudo", que no dice nada.
  npx prisma db seed || echo "⚠️  No se pudo ejecutar el seed (opcional, continuando). Ver el error arriba."
fi

echo "🐾 Iniciando VetCare API..."
exec node dist/index.js
