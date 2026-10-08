#!/bin/sh
set -e

echo "[FRETA] A aplicar migrações da base de dados..."
npx prisma migrate deploy

echo "[FRETA] A arrancar em http://0.0.0.0:${PORT:-3000}"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
