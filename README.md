# FRETA

**Mudanças, cargas e transporte num só lugar.**

Marketplace PWA que liga clientes a motoristas verificados em Moçambique — para mudanças de casa, mercadorias, móveis, material de construção e cargas pesadas. Os clientes usam o site **sem conta**; os motoristas criam conta **grátis**, enviam documentos (BI + fotos do veículo) para validação pelo admin (selo verificado) e recebem pedidos da sua praça por **480 MT/mês**.

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components / PPR)
- **PostgreSQL 17** (Docker) + **Prisma ORM 7** (driver adapter `@prisma/adapter-pg`)
- **Better Auth 1.7** (email/password + recuperação de senha por email via nodemailer)
- **Tailwind CSS v4** + **shadcn/ui** (estilo `base`, Base UI) + **react-hook-form** + **zod**
- **PWA**: manifest + service worker com cache conservadora

## Marca visual

- **Cor principal:** `#00FF55` (neon — fundos, botões e destaques, com texto preto) e `#00792B` (verde escuro para texto/ícones sobre fundo claro, contraste WCAG AA)
- **Fonte:** Poppins — sans-serif geométrica carregada via `next/font/google`
- **Ícones PWA:** placeholders gerados em verde (`scripts/generate-icons.ps1`) — substituir pela arte final mantendo os nomes

## Arranque rápido

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
copy .env.example .env     # Windows
# edit .env                 # definir BETTER_AUTH_SECRET (obrigatório em produção)

# 3. Base de dados (Docker: container "freta-db")
docker compose up -d

# 4. Schema + dados de exemplo (admin + 3 motoristas + pedidos/avaliações)
npm run db:setup

# 5. Desenvolvimento
npm run dev                # http://localhost:3000
```

### Comandos úteis

| Comando             | Descrição                                      |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                    |
| `npm run build`     | Build de produção (inclui typecheck)           |
| `npm run start`     | Servir o build de produção                     |
| `npm run lint`      | ESLint                                         |
| `npm run typecheck` | `tsc --noEmit`                                 |
| `npm run db:push`   | Aplicar schema à BD (sem migrations)           |
| `npm run db:seed`   | Criar admin + motoristas de exemplo            |
| `npm run db:setup`  | `db push` + `seed`                             |
| `npm run db:generate` | Regenerar o Prisma Client (`lib/generated/`) |

## Credenciais de teste (seed)

| Perfil            | Email                    | Password     |
| ----------------- | ------------------------ | ------------ |
| Admin             | `admin@freta.co.mz`      | `admin123`   |
| Motorista (activo)| `carlos@freta.co.mz`     | `freta12345` |
| Motorista (activo)| `amelia@freta.co.mz`     | `freta12345` |
| Motorista pendente| `joao@freta.co.mz`       | `freta12345` |

> Em produção, alterar `ADMIN_EMAIL`/`ADMIN_SENHA` no `.env` **antes** do seed.

## Estrutura

```
app/
  layout.tsx            # metadata PWA + header (sessão em Suspense) + footer
  manifest.ts           # manifest.webmanifest (MetadataRoute.Manifest)
  page.tsx              # landing
  offline/              # página offline servida pelo SW
  encontrar/            # fluxo do cliente (pesquisa → resultados → contactar/avaliar)
  (auth)/               # entrar, registo (2 passos), esqueci-senha, redefinir-senha
  motorista/            # dashboard do motorista (estado, mensalidade, pedidos, avaliações)
  admin/                # painel admin (stats, motoristas, pagamentos)
  api/auth/[...all]/    # handler Better Auth
components/
  pwa/                  # pwa-register, install-pwa, ios-install-prompt
  site-header.tsx       # sessão dentro de <Suspense> (não bloqueia prerender)
  driver-card.tsx       # cartão Ligar / WhatsApp / Avaliar
lib/
  auth.ts, auth-client.ts, db.ts, email.ts, rate-limit.ts, session.ts, freta.ts
prisma/
  schema.prisma         # Better Auth + Motorista/Pagamento/Pedido/Avaliacao
  seed.ts
proxy.ts                # protecção de /motorista e /admin (valida sessão e papel)
docker-compose.yml      # postgres:17 → container freta-db
public/
  sw.js                 # service worker (freta-cache-v2)
  icons/                # icon-192x192.png, icon-512x512.png, icon-maskable-512x512.png
```

## Ícones da PWA

Os ícones actuais são placeholders gerados (`scripts/generate-icons.ps1`). Para produção, substituir os ficheiros mantendo os nomes:

- `public/icons/icon-192x192.png` — 192×192
- `public/icons/icon-512x512.png` — 512×512
- `public/icons/icon-maskable-512x512.png` — 512×512, com zona segura de 20% (fundo full-bleed)

## SMTP (recuperação de senha)

Sem `SMTP_HOST`/`SMTP_EMAIL`/`SMTP_PASSWORD`, os emails são ignorados com aviso no log (o fluxo não quebra). Com SMTP configurado, o link de recuperação chega ao email e redirecciona para `/redefinir-senha?token=...`.

## Limitações conhecidas (MVP)

- **Rate-limit em memória** (`lib/rate-limit.ts`) — adequado a uma única instância; para escala horizontal trocar por Redis/Upstash com a mesma interface.
- **Sem pagamentos online** — a mensalidade de 480 MT é confirmada manualmente pelo admin (M-Pesa/e-Mola fora do MVP).
- **Fotografia de perfil por URL** — os documentos de verificação (BI + fotos do carro) usam UploadThing; a foto de perfil continua a ser um link.
- **Verificação de documentos pelo admin** — aprovação/rejeição com motivo notificado por email; não substitui verificação presencial na praça.
- **Sem GPS/timing real** — o estado do motorista é manual (Disponível/Ocupado/Indisponível).
- **Sem matching sofisticado** — filtra por serviço e ordena por praça → disponibilidade → avaliação.
- **`npm run db:push` em vez de migrations** — para produção com dados reais, migrar para `prisma migrate dev`.
- **Dados do LevaFacil não migrados** — domínio diferente (SQLite → Postgres novo).
