FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# O postinstall do package.json corre "prisma generate", que lê o
# prisma7.config.ts — o schema e o config têm de estar cá dentro
# antes do npm ci. O URL é um placeholder: o generate não liga à BD.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/freta"

COPY package.json package-lock.json prisma7.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl openssl-dev libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Defaults de build: plataformas como o Easypanel podem não passar
# --build-arg (só GIT_SHA), e o `next build` importa código que valida estes
# envs (lib/db.ts e better-auth em produção). Estes valores são APENAS para
# o build não falhar — não chegam ao runner; os reais passam-se em runtime
# com docker run -e / variáveis da plataforma.
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/freta
ARG BETTER_AUTH_URL=http://localhost:3000
ARG BETTER_AUTH_SECRET=placeholder-build-next-nao-usar-em-producao-1234
ARG NEXT_PUBLIC_BASE_URL
ARG UPLOADTHING_TOKEN
ARG ADMIN_EMAIL
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_EMAIL
ARG SMTP_PASSWORD
ARG GIT_SHA

ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    UPLOADTHING_TOKEN=$UPLOADTHING_TOKEN \
    ADMIN_EMAIL=$ADMIN_EMAIL \
    SMTP_HOST=$SMTP_HOST \
    SMTP_PORT=$SMTP_PORT \
    SMTP_EMAIL=$SMTP_EMAIL \
    SMTP_PASSWORD=$SMTP_PASSWORD \
    GIT_SHA=$GIT_SHA

RUN npx prisma generate && npx next build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000

# Env vars em runtime (DATABASE_URL, BETTER_AUTH_SECRET, …) passam-se com
# docker run -e / plataforma — as ENV do builder não chegam aqui.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# Cliente Prisma gerado (lib/generated): o seed do entrypoint
# (prisma/seed.ts) importa ../lib/generated/prisma/client em runtime.
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
# Prisma 7: o "migrate deploy" do entrypoint lê o datasource daqui.
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts

EXPOSE 3000

CMD ["sh", "/app/scripts/entrypoint.sh"]
