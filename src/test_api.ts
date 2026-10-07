const BASE = process.env.BASE || "http://localhost:3000";

interface ApiResult {
  status: number;
  json: any;
}

async function call(method: string, url: string, body?: unknown, token?: string): Promise<ApiResult> {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

(async () => {
  let ok = true;
  const check = (label: string, cond: boolean) => {
    console.log((cond ? "PASS" : "FAIL") + " - " + label);
    if (!cond) ok = false;
  };

  // health
  let r = await call("GET", "/api/health");
  check("health", r.json && r.json.ok === true);

  // marketplace public (seeded)
  r = await call("GET", "/api/transportadores");
  check("transportadores publicos (>=4)", Array.isArray(r.json.data) && r.json.data.length >= 4);
  const t0 = r.json.data[0];
  check("transportador tem contactos", t0.contactos && t0.contactos.whatsapp);

  r = await call("GET", "/api/fornecedores");
  check("fornecedores publicos (>=2)", Array.isArray(r.json.data) && r.json.data.length >= 2);

  // registrar conta transportador
  const email = "teste" + Date.now() + "@exemplo.co.mz";
  r = await call("POST", "/api/auth/registar", {
    nome: "Teste Registro", email, telefone: "+258 82 000 0099",
    whatsapp: "+258 82 000 0099", senha: "123456", tipo: "transportador"
  });
  check("registar conta", r.status === 200 && r.json.ok && r.json.data.token);
  const token = r.json.data.token;

  // me
  r = await call("GET", "/api/me", null, token);
  check("me com token", r.json.ok && r.json.data.email === email);

  // criar perfil transportador
  r = await call("POST", "/api/transportador", {
    bi: "TESTE1", tipoCarro: "Pickup cabine dupla", categoria: "Pickups e Utilitários",
    matricula: "ZZZ-999-MZ", cargaMax: "900 kg", precoKm: "11",
    viagemLonga: "nao", zonas: "Maputo", obs: "teste"
  }, token);
  check("criar perfil transportador", r.json.ok && r.json.data.status === "pendente");
  const perfilId = r.json.data.id;

  // admin login (wrong + right)
  r = await call("POST", "/api/admin/entrar", { email: "admin@levafacil.co.mz", senha: "errada" });
  check("admin login errado", r.status === 401);
  r = await call("POST", "/api/admin/entrar", { email: "admin@levafacil.co.mz", senha: "admin123" });
  check("admin login certo", r.json.ok && r.json.data.token);
  const adminToken = r.json.data.token;

  // admin pendentes
  r = await call("GET", "/api/admin/pendentes", null, adminToken);
  check("admin pendentes contem novo perfil", r.json.ok && r.json.data.transportadores.some((t: any) => t.id === perfilId));

  // admin confirmar
  r = await call("POST", "/api/admin/confirmar/transportador/" + perfilId, {}, adminToken);
  check("admin confirmar transportador", r.json.ok && r.json.data.status === "confirmado");

  // marketplace agora inclui o confirmado
  r = await call("GET", "/api/transportadores");
  check("confirmado aparece no marketplace", r.json.data.some((t: any) => t.matricula === "ZZZ-999-MZ"));

  // admin sem token bloqueado
  r = await call("GET", "/api/admin/pendentes");
  check("admin sem token bloqueado", r.status === 401);

  console.log(ok ? "\nTODOS OS TESTES PASSARAM" : "\nALGUNS TESTES FALHARAM");
  process.exit(ok ? 0 : 1);
})();
