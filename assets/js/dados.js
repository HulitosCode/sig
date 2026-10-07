var LEVAFACIL = window.LEVAFACIL || {};

LEVAFACIL.PROVINCIAS = [
  "Maputo Cidade",
  "Maputo",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa"
];

LEVAFACIL.CATEGORIAS = {
  "Motociclos": ["Moto de carga", "Triciclo de carga"],
  "Ligeiros": ["Sedan", "Hatchback", "SUV", "Station Wagon"],
  "Pickups e Utilitários": ["Pickup simples", "Pickup cabine dupla"],
  "Carrinhas (Vans)": ["Carrinha de carga", "Carrinha de passageiros"],
  "Minibus": ["Minibus 15 lugares", "Minibus 18 lugares", "Minibus 22 lugares"],
  "Autocarros": ["Autocarro urbano", "Autocarro interprovincial"],
  "Camionetas": ["Camioneta 3,5 toneladas", "Camioneta 7,5 toneladas"],
  "Camiões": ["Camião 3 eixos", "Camião 4 eixos", "Camião longo curso"],
  "Porta-Contentores": ["Contentor 20 pés", "Contentor 40 pés"],
  "Cisterna": ["Cisterna de combustível", "Cisterna de água"]
};

LEVAFACIL.CATEGORIA_DE_TIPO = function (tipo) {
  var keys = Object.keys(LEVAFACIL.CATEGORIAS);
  for (var i = 0; i < keys.length; i++) {
    if (LEVAFACIL.CATEGORIAS[keys[i]].indexOf(tipo) !== -1) {
      return keys[i];
    }
  }
  return null;
};

LEVAFACIL.ICONES_CATEGORIA = {
  "Motociclos": "bi-bicycle",
  "Ligeiros": "bi-car-front",
  "Pickups e Utilitários": "bi-truck-front",
  "Carrinhas (Vans)": "bi-truck",
  "Minibus": "bi-bus-front",
  "Autocarros": "bi-bus-front",
  "Camionetas": "bi-truck-front",
  "Camiões": "bi-truck",
  "Porta-Contentores": "bi-box-seam",
  "Cisterna": "bi-droplet-half"
};

LEVAFACIL.TRANSPORTADORES = [
  {
    nome: "João Machava",
    veiculo: "Camião 4 eixos",
    categoria: "Camiões",
    matricula: "AAA-234-MZ",
    carga: "20.000 kg",
    disponivel: true,
    provincias: ["Maputo", "Gaza", "Sofala", "Manica", "Tete"],
    preco: "15 MT/km",
    telefone: "+258 82 000 0001"
  },
  {
    nome: "Maria Nhantumbo",
    veiculo: "Carrinha de carga",
    categoria: "Carrinhas (Vans)",
    matricula: "BBB-118-MZ",
    carga: "1.200 kg",
    disponivel: true,
    provincias: ["Maputo Cidade", "Maputo", "Gaza"],
    preco: "12 MT/km",
    telefone: "+258 84 000 0002"
  },
  {
    nome: "Carlos Sitoe",
    veiculo: "Minibus 22 lugares",
    categoria: "Minibus",
    matricula: "CCC-722-MZ",
    carga: "1.800 kg",
    disponivel: true,
    provincias: ["Maputo", "Inhambane", "Sofala"],
    preco: "10 MT/km",
    telefone: "+258 87 000 0003"
  },
  {
    nome: "Amélia Cossa",
    veiculo: "Pickup cabine dupla",
    categoria: "Pickups e Utilitários",
    matricula: "DDD-915-MZ",
    carga: "900 kg",
    disponivel: false,
    provincias: ["Maputo Cidade", "Maputo"],
    preco: "11 MT/km",
    telefone: "+258 86 000 0004"
  },
  {
    nome: "Ernesto Bila",
    veiculo: "Camião longo curso",
    categoria: "Camiões",
    matricula: "EEE-308-MZ",
    carga: "32.000 kg",
    disponivel: true,
    provincias: ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula"],
    preco: "13 MT/km",
    telefone: "+258 82 000 0005"
  },
  {
    nome: "Lúcia Mondlane",
    veiculo: "Moto de carga",
    categoria: "Motociclos",
    matricula: "FFF-660-MZ",
    carga: "80 kg",
    disponivel: true,
    provincias: ["Maputo Cidade"],
    preco: "8 MT/km",
    telefone: "+258 84 000 0006"
  },
  {
    nome: "António Uate",
    veiculo: "Camioneta 7,5 toneladas",
    categoria: "Camionetas",
    matricula: "GGG-544-MZ",
    carga: "7.500 kg",
    disponivel: true,
    provincias: ["Sofala", "Zambézia", "Nampula", "Cabo Delgado"],
    preco: "14 MT/km",
    telefone: "+258 87 000 0007"
  },
  {
    nome: "Rosa Mabjaia",
    veiculo: "Sedan",
    categoria: "Ligeiros",
    matricula: "HHH-203-MZ",
    carga: "250 kg",
    disponivel: true,
    provincias: ["Maputo Cidade", "Maputo", "Gaza"],
    preco: "9 MT/km",
    telefone: "+258 86 000 0008"
  },
  {
    nome: "Sérgio Vilanculos",
    veiculo: "Contentor 40 pés",
    categoria: "Porta-Contentores",
    matricula: "III-980-MZ",
    carga: "28.000 kg",
    disponivel: true,
    provincias: ["Maputo", "Gaza", "Sofala", "Nampula"],
    preco: "18 MT/km",
    telefone: "+258 82 000 0009"
  },
  {
    nome: "Beatriz Macamo",
    veiculo: "Autocarro interprovincial",
    categoria: "Autocarros",
    matricula: "JJJ-155-MZ",
    carga: "1.500 kg",
    disponivel: false,
    provincias: ["Maputo", "Sofala", "Zambézia", "Nampula", "Cabo Delgado"],
    preco: "12 MT/km",
    telefone: "+258 84 000 0010"
  }
];

LEVAFACIL.FORNECEDORES = [
  {
    nome: "Distribuidora Nhamatanda, Lda",
    produtos: "Materiais de construção",
    nif: "400123456",
    provincia: "Sofala",
    telefone: "+258 82 100 0001"
  },
  {
    nome: "Mercado Central de Maputo",
    produtos: "Produtos alimentares e frescos",
    nif: "400234567",
    provincia: "Maputo Cidade",
    telefone: "+258 84 100 0002"
  },
  {
    nome: "AgroTete, Lda",
    produtos: "Produtos agrícolas",
    nif: "400345678",
    provincia: "Tete",
    telefone: "+258 87 100 0003"
  },
  {
    nome: "Comércio do Norte, Lda",
    produtos: "Eletrodomésticos e móveis",
    nif: "400456789",
    provincia: "Nampula",
    telefone: "+258 86 100 0004"
  },
  {
    nome: "Madre Peixe, Unip. Lda",
    produtos: "Pescado e marisco",
    nif: "400567890",
    provincia: "Inhambane",
    telefone: "+258 82 100 0005"
  },
  {
    nome: "Indústria de Bebidas do Sul",
    produtos: "Bebidas e refrigerantes",
    nif: "400678901",
    provincia: "Maputo",
    telefone: "+258 84 100 0006"
  }
];
