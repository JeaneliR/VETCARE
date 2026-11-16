#!/bin/sh
set -e

echo "📦 Aplicando migraciones de Prisma..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Ejecutando seed inicial..."
  node -e "require('ts-node/register')" 2>/dev/null || true
  npx prisma db seed 2>/dev/null || echo "⚠️  No se pudo ejecutar el seed (opcional, continuando)."
fi

echo "🐾 Iniciando VetCare API..."
exec node dist/index.js
