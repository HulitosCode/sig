import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET: string = process.env.JWT_SECRET || "levafacil_segredo";
const ADMIN_EMAIL: string | undefined = process.env.ADMIN_EMAIL;
const ADMIN_SENHA: string | undefined = process.env.ADMIN_SENHA;

interface Payload {
  id?: number;
  role?: string;
  admin?: boolean;
}

interface RegistarBody {
  nome?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  senha?: string;
  tipo?: string;
}

interface LoginBody {
  email?: string;
  senha?: string;
}

interface TransportadorBody {
  bi?: string;
  tipoCarro?: string;
  categoria?: string;
  matricula?: string;
  cargaMax?: string;
  precoKm?: string;
  viagemLonga?: string | boolean;
  zonas?: string;
  obs?: string;
}

interface FornecedorBody {
  nif?: string;
  provincia?: string;
  produtos?: string;
  obs?: string;
}

interface ParamsTipoId {
  tipo: string;
  id: string;
}

const fastify = Fastify({ logger: false });

fastify.register(cors, { origin: true });
fastify.register(fastifyStatic, { root: process.cwd() });

/* ---------------- Helpers ---------------- */

function assinarToken(payload: Payload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verificarToken(req: { headers: { authorization?: string } }): Payload | null {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as Payload;
  } catch (err) {
    return null;
  }
}

function semSenha(user: { senha: string; [key: string]: unknown }) {
  if (!user) return null;
  const { senha, ...resto } = user;
  return resto;
}

function isAdmin(req: { headers: { authorization?: string } }): boolean {
  const payload = verificarToken(req);
  return Boolean(payload && payload.admin === true);
}

/* ---------------- Saúde ---------------- */

fastify.get("/api/health", async (req, reply) => {
  return reply.send({ ok: true, servico: "LevaFacil API" });
});

/* ---------------- Autenticação ---------------- */

fastify.post("/api/auth/registar", async (req, reply) => {
  const b = (req.body || {}) as RegistarBody;
  if (!b.nome || !b.email || !b.telefone || !b.senha || !["fornecedor", "transportador"].includes(b.tipo || "")) {
    return reply.code(400).send({ ok: false, error: "Preencha todos os campos obrigatórios e escolha o tipo de conta." });
  }
  const existe = await prisma.user.findUnique({ where: { email: b.email } });
  if (existe) {
    return reply.code(409).send({ ok: false, error: "Já existe uma conta com este email." });
  }
  const hash = await bcrypt.hash(b.senha, 10);
  const user = await prisma.user.create({
    data: { nome: b.nome, email: b.email, telefone: b.telefone, whatsapp: b.whatsapp || null, role: b.tipo as string, senha: hash }
  });
  const token = assinarToken({ id: user.id, role: user.role });
  return reply.send({ ok: true, data: { token, user: semSenha(user) } });
});

fastify.post("/api/auth/entrar", async (req, reply) => {
  const b = (req.body || {}) as LoginBody;
  if (!b.email || !b.senha) {
    return reply.code(400).send({ ok: false, error: "Indique o email e a palavra-passe." });
  }
  const user = await prisma.user.findUnique({ where: { email: b.email } });
  if (!user || !(await bcrypt.compare(b.senha, user.senha))) {
    return reply.code(401).send({ ok: false, error: "Email ou palavra-passe incorretos." });
  }
  const token = assinarToken({ id: user.id, role: user.role });
  return reply.send({ ok: true, data: { token, user: semSenha(user) } });
});

fastify.get("/api/me", async (req, reply) => {
  const payload = verificarToken(req);
  if (!payload) {
    return reply.code(401).send({ ok: false, error: "Não autorizado." });
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    include: { transportador: true, fornecedor: true }
  });
  if (!user) {
    return reply.code(404).send({ ok: false, error: "Utilizador não encontrado." });
  }
  return reply.send({ ok: true, data: semSenha(user) });
});

/* ---------------- Registo de perfis ---------------- */

fastify.post("/api/transportador", async (req, reply) => {
  const payload = verificarToken(req);
  if (!payload || !payload.id) {
    return reply.code(401).send({ ok: false, error: "Crie uma conta e inicie sessão primeiro." });
  }
  const b = (req.body || {}) as TransportadorBody;
  if (!b.bi || !b.tipoCarro || !b.categoria || !b.matricula || !b.cargaMax) {
    return reply.code(400).send({ ok: false, error: "Preencha os dados obrigatórios do veículo." });
  }
  const data = {
    bi: b.bi,
    tipoCarro: b.tipoCarro,
    categoria: b.categoria,
    matricula: b.matricula,
    cargaMax: b.cargaMax,
    precoKm: b.precoKm || null,
    viagemLonga: b.viagemLonga === "sim" || b.viagemLonga === true,
    zonas: b.zonas || null,
    obs: b.obs || null
  };
  const existente = await prisma.transportador.findUnique({ where: { userId: payload.id } });
  let reg;
  if (existente) {
    reg = await prisma.transportador.update({
      where: { userId: payload.id },
      data: { ...data, status: existente.status, pagamento: existente.pagamento }
    });
  } else {
    reg = await prisma.transportador.create({
      data: { ...data, userId: payload.id, status: "pendente", pagamento: false }
    });
  }
  return reply.send({ ok: true, data: reg });
});

fastify.post("/api/fornecedor", async (req, reply) => {
  const payload = verificarToken(req);
  if (!payload || !payload.id) {
    return reply.code(401).send({ ok: false, error: "Crie uma conta e inicie sessão primeiro." });
  }
  const b = (req.body || {}) as FornecedorBody;
  if (!b.nif || !b.provincia || !b.produtos) {
    return reply.code(400).send({ ok: false, error: "Preencha os dados obrigatórios da empresa." });
  }
  const data = { nif: b.nif, provincia: b.provincia, produtos: b.produtos, obs: b.obs || null };
  const existente = await prisma.fornecedor.findUnique({ where: { userId: payload.id } });
  let reg;
  if (existente) {
    reg = await prisma.fornecedor.update({
      where: { userId: payload.id },
      data: { ...data, status: existente.status, pagamento: existente.pagamento }
    });
  } else {
    reg = await prisma.fornecedor.create({
      data: { ...data, userId: payload.id, status: "pendente", pagamento: false }
    });
  }
  return reply.send({ ok: true, data: reg });
});

/* ---------------- Marketplace (público) ---------------- */

fastify.get("/api/transportadores", async (req, reply) => {
  const lista = await prisma.transportador.findMany({
    where: { status: "confirmado" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return reply.send({
    ok: true,
    data: lista.map((t) => ({
      id: t.id,
      nome: t.user.nome,
      veiculo: t.tipoCarro,
      categoria: t.categoria,
      matricula: t.matricula,
      carga: t.cargaMax,
      preco: t.precoKm ? t.precoKm + " MT/km" : null,
      viagemLonga: t.viagemLonga,
      zonas: t.zonas,
      observacoes: t.obs,
      contactos: {
        telefone: t.user.telefone,
        whatsapp: t.user.whatsapp || t.user.telefone,
        email: t.user.email
      }
    }))
  });
});

fastify.get("/api/fornecedores", async (req, reply) => {
  const lista = await prisma.fornecedor.findMany({
    where: { status: "confirmado" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return reply.send({
    ok: true,
    data: lista.map((f) => ({
      id: f.id,
      nome: f.user.nome,
      nif: f.nif,
      provincia: f.provincia,
      produtos: f.produtos,
      observacoes: f.obs,
      contactos: {
        telefone: f.user.telefone,
        whatsapp: f.user.whatsapp || f.user.telefone,
        email: f.user.email
      }
    }))
  });
});

/* ---------------- Administração ---------------- */

fastify.post("/api/admin/entrar", async (req, reply) => {
  const b = (req.body || {}) as LoginBody;
  if (b.email === ADMIN_EMAIL && b.senha === ADMIN_SENHA) {
    return reply.send({ ok: true, data: { token: assinarToken({ admin: true }) } });
  }
  return reply.code(401).send({ ok: false, error: "Credenciais de administrador inválidas." });
});

fastify.get("/api/admin/pendentes", async (req, reply) => {
  if (!isAdmin(req)) {
    return reply.code(401).send({ ok: false, error: "Acesso restrito a administradores." });
  }
  const transportadores = await prisma.transportador.findMany({
    where: { status: "pendente" }, include: { user: true }, orderBy: { createdAt: "desc" }
  });
  const fornecedores = await prisma.fornecedor.findMany({
    where: { status: "pendente" }, include: { user: true }, orderBy: { createdAt: "desc" }
  });
  return reply.send({ ok: true, data: { transportadores, fornecedores } });
});

fastify.get("/api/admin/confirmados", async (req, reply) => {
  if (!isAdmin(req)) {
    return reply.code(401).send({ ok: false, error: "Acesso restrito a administradores." });
  }
  const transportadores = await prisma.transportador.findMany({
    where: { status: "confirmado" }, include: { user: true }, orderBy: { createdAt: "desc" }
  });
  const fornecedores = await prisma.fornecedor.findMany({
    where: { status: "confirmado" }, include: { user: true }, orderBy: { createdAt: "desc" }
  });
  return reply.send({ ok: true, data: { transportadores, fornecedores } });
});

function acharModelo(tipo: string): any {
  return tipo === "fornecedor" ? prisma.fornecedor : prisma.transportador;
}

fastify.post("/api/admin/pagamento/:tipo/:id", async (req, reply) => {
  if (!isAdmin(req)) {
    return reply.code(401).send({ ok: false, error: "Acesso restrito a administradores." });
  }
  const { tipo, id } = req.params as ParamsTipoId;
  const model = acharModelo(tipo);
  const reg = await model.update({ where: { id: Number(id) }, data: { pagamento: true } });
  return reply.send({ ok: true, data: reg });
});

fastify.post("/api/admin/confirmar/:tipo/:id", async (req, reply) => {
  if (!isAdmin(req)) {
    return reply.code(401).send({ ok: false, error: "Acesso restrito a administradores." });
  }
  const { tipo, id } = req.params as ParamsTipoId;
  const model = acharModelo(tipo);
  const reg = await model.update({
    where: { id: Number(id) },
    data: { status: "confirmado", pagamento: true }
  });
  return reply.send({ ok: true, data: reg });
});

fastify.delete("/api/admin/remover/:tipo/:id", async (req, reply) => {
  if (!isAdmin(req)) {
    return reply.code(401).send({ ok: false, error: "Acesso restrito a administradores." });
  }
  const { tipo, id } = req.params as ParamsTipoId;
  const model = acharModelo(tipo);
  await model.delete({ where: { id: Number(id) } });
  return reply.send({ ok: true, data: { removido: true } });
});

/* ---------------- Arranque ---------------- */

const PORT = Number(process.env.PORT) || 3000;

fastify.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log("LevaFacil API a correr em http://localhost:" + PORT);
    console.log("Admin: " + ADMIN_EMAIL);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
