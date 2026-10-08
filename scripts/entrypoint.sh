#!/bin/sh
set -e

echo "[FRETA] A aplicar migrações da base de dados..."
npx prisma migrate deploy

# Seed idempotente: cria a conta de admin inicial (se ainda não existir).
# Em produção (NODE_ENV=production) só o admin é criado; os dados de demo
# (motoristas/pedidos de exemplo) exigem SEED_DEMO=1.
# As credenciais podem ser definidas na plataforma (docker run -e).
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@freta.co.mz}"
export ADMIN_SENHA="${ADMIN_SENHA:-admin123}"

echo "[FRETA] A executar seed (conta de admin inicial)..."
npx tsx prisma/seed.ts

echo "[FRETA] A arrancar em http://0.0.0.0:${PORT:-3000}"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
