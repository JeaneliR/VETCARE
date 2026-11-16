# --- Etapa 1: dependencias + build ---
FROM node:20-alpine AS build
WORKDIR /app

# Alpine no trae OpenSSL por defecto; sin esto el motor de Prisma no
# arranca ("Prisma failed to detect the libssl/openssl version").
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Etapa 2: imagen de ejecución (solo dependencias de producción) ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=build /app/dist ./dist

# El seed (prisma/seed.ts) corre con ts-node directamente sobre el código
# fuente e importa cosas de src/ (ej. src/utils/auth.ts para el hash de
# contraseñas), así que también necesita tsconfig.json y src/ en esta
# imagen, aunque la app ya corra desde dist/.
COPY tsconfig.json ./
COPY src ./src

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
