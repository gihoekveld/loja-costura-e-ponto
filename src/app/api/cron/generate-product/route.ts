import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function cleanPassword(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function isAuthorized(request: NextRequest): boolean {
  const validKeys = new Set(['senha123']);
  const cronSecret = cleanPassword(process.env.CRON_SECRET);
  const profPwd = cleanPassword(process.env.PROFESSOR_PASSWORD);
  if (cronSecret) validKeys.add(cronSecret);
  if (profPwd) validKeys.add(profPwd);

  const searchParams = request.nextUrl.searchParams;
  const fromQuery = cleanPassword(searchParams.get('key') || searchParams.get('senha') || searchParams.get('token'));
  if (fromQuery && validKeys.has(fromQuery)) {
    return true;
  }

  const headerKey = cleanPassword(request.headers.get('x-cron-key') || request.headers.get('x-professor-password'));
  if (headerKey && validKeys.has(headerKey)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const rawToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const token = cleanPassword(rawToken);
    if (token && validKeys.has(token)) return true;
  }

  const host = request.headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return true;
  }

  return false;
}

const PRODUCT_CATALOG_TEMPLATES = [
  {
    category: 'Linhas & Fios',
    names: [
      'Cone de Linha Poliéster 120 Lubrificada',
      'Fio para Overloque Poliamida Texturizado',
      'Linha de Pesponto Extra Forte Bonderizada',
      'Kit Cones Linha Invisível Monofilamento',
      'Linha de Algodão Egípcio Mercerizado para Bordado',
    ],
    specs: ['5.000 Jardas', '2.000m', 'Cone 150g', 'Kit 6 Unidades', '4.000m Alta Tenacidade'],
    colors: ['Branco Óptico', 'Preto Intenso', 'Cru Natural', 'Azul Marinho', 'Terracota', 'Sortido Neutro', 'Cinza Chumbo'],
    description: 'Linha profissional de torção equilibrada e baixa pilosidade, projetada para costuras industriais e domésticas de alta velocidade sem arrebentar.',
    priceRange: [18.9, 139.9],
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421610/sec-store/kit-12-linhas-coloridas-costura-geral-120-reta.webp',
  },
  {
    category: 'Aparelhos & Guias',
    names: [
      'Aparelho de Viés Dobra Dupla em Aço Inox',
      'Guia Magnético de Borda para Reta Industrial',
      'Aparelho Pregador de Elástico com Tensor',
      'Guia de Bainha Regulável com Parafuso Micrométrico',
      'Aparelho Franzidor Automático para Reta e Galoneira',
    ],
    specs: ['25mm', '30mm', '35mm', '40mm Regulável', 'Encaixe Universal'],
    colors: ['Aço Inox Polido', 'Cromado', 'Galvanizado'],
    description: 'Aparelho de precisão fabricado em aço inoxidável temperado, garantindo dobras milimétricas e padronização na produção em série no ateliê.',
    priceRange: [24.9, 89.9],
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421443/sec-store/aparelho-vies-2-dobras-maquina-reta-industrial-domestica.webp',
  },
  {
    category: 'Calcadores & Sapatilhas',
    names: [
      'Calcador de Teflon Antiaderente Base Lisa',
      'Sapatilha para Zíper Invisível Guia Duplo',
      'Calcador de Bainha Enrolada Fina',
      'Calcador com Rolamento para Couro e Sintéticos',
      'Sapatilha de Pesponto com Guia Direito 1/4"',
    ],
    specs: ['Haste Alta Industrial', 'Haste Baixa Doméstica', '3mm', '5mm', 'Base PTFE Virgem'],
    colors: ['Branco PTFE', 'Aço Temperado', 'Niquelado'],
    description: 'Sapatilha de engenharia precisa para alimentação contínua do tecido sem franzir ou travar em camadas espessas, sintéticos ou tecidos delicados.',
    priceRange: [22.5, 64.9],
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421875/sec-store/calcador-teflon-roller-foot-maquina-industrial-couro-vinil.webp',
  },
  {
    category: 'Corte & Medição',
    names: [
      'Tesoura de Alfaiate Forjada em Aço Carbono',
      'Cortador Circular Rotativo com Trava',
      'Base de Corte Auto-regenerativa Dupla Face',
      'Régua de Modelagem Curva Francesa Acrílica',
      'Tesoura de Arremate Tecelão com Mola',
    ],
    specs: ['8 Polegadas', '10 Polegadas', '45mm Profissional', 'A3 (45x30cm)', 'A2 (60x45cm)'],
    colors: ['Prateado Clássico', 'Cabo Emborrachado', 'Verde Milimetrado', 'Titânio'],
    description: 'Ferramenta de corte e modelagem de alta durabilidade com afiação a laser para cortes limpos e precisos em múltiplas camadas de tecido.',
    priceRange: [34.9, 149.9],
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427660/sec-store/tesoura-forjada-10-pol-alfaiate-costura-profissional-tecidos-cor-prateado.webp',
  },
  {
    category: 'Agulhas & Bobinas',
    names: [
      'Kit Agulhas Ponta Bola para Malha e Jersey',
      'Caixa de Bobinas de Alumínio Balanceadas',
      'Kit Agulhas Cabo Grosso para Jeans e Sarja',
      'Caixa de Bobina Rotativa em Aço para Reta Industrial',
      'Envelope Agulhas Duplas para Galoneira Doméstica',
    ],
    specs: ['Nº 70/10', 'Nº 80/12', 'Nº 90/14', 'Nº 100/16', 'Kit 25 Unidades'],
    colors: ['Cromado Alemão', 'Ponta Dourada Titânio', 'Alumínio Anodizado'],
    description: 'Componentes calibrados para formação perfeita da laçada do ponto, reduzindo quebras de linha e evitando furos em malhas e tecidos planos.',
    priceRange: [19.9, 98.0],
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427911/sec-store/stojo-porta-bobinas-reta-industrial-25-bobinas-aluminio.webp',
  },
  {
    category: 'Botões',
    names: [
      'Pote de Botões de Resina Polida 4 Furos',
      'Kit Botões de Madeira Natural Trabalhada',
      'Botões de Pressão Ritas com Matriz',
      'Botão Forrado em Latão para Alfaiataria',
    ],
    specs: ['11mm (50 un.)', '15mm (40 un.)', '18mm (30 un.)', '22mm Casaco (20 un.)'],
    colors: ['Tartaruga', 'Perolado', 'Preto Fosco', 'Sortido Pastel', 'Amadeirado'],
    description: 'Botões de acabamento premium resistentes à lavagem industrial e ao calor do ferro de passar.',
    priceRange: [16.9, 59.9],
    image: '/images/cat_botoes.jpg',
  },
  {
    category: 'Zíperes',
    names: [
      'Kit Zíper Invisível Nylon Fino',
      'Zíper de Metal Destacável para Jaquetas',
      'Rolo de Zíper a Metro nº 5 com 20 Cursores',
      'Zíper Tratorado Reforçado para Bolsas e Mochilas',
    ],
    specs: ['20cm (Kit 10 un.)', '50cm (Kit 5 un.)', 'Rolo 10 Metros', '15cm Braguilha (12 un.)'],
    colors: ['Preto', 'Branco', 'Bege Areia', 'Marinho', 'Dourado Envelhecido'],
    description: 'Zíperes de deslizamento macio com cadarço de poliéster de alta densidade e dentes resistentes à tração.',
    priceRange: [21.9, 74.9],
    image: '/images/cat_ziperes.jpg',
  },
  {
    category: 'Elásticos & Viés',
    names: [
      'Rolo de Elástico Chato Embutido Reforçado',
      'Rolo de Viés de Algodão 100% Dobra Simples',
      'Elástico Bico de Pato para Lingerie',
      'Viés de Cetim Acetinado para Acabamento',
    ],
    specs: ['10mm (Rolo 50m)', '25mm (Rolo 25m)', '35mm (Rolo 20m)', '15mm (Rolo 50m)'],
    colors: ['Cru', 'Branco', 'Preto', 'Rosé', 'Terracota'],
    description: 'Aviamento flexível de excelente memória elástica e toque macio, ideal para cós, punhos, lingeries e debruns.',
    priceRange: [24.0, 68.0],
    image: '/images/cat_elasticos.jpg',
  },
  {
    category: 'Acessórios',
    names: [
      'Fita Métrica Fibra de Vidro Dupla Face',
      'Caixa de Alfinetes Cabeça de Vidro Extra Finos',
      'Giz de Alfaiate em Cera Termo-apagável (Caixa)',
      'Abridor de Casas / Desmanchador de Costura Ergonômico',
    ],
    specs: ['1,50m Profissional', 'Caixa 100g', 'Kit 10 Unidades', 'Ponta Fina Aço'],
    colors: ['Sortido', 'Branco/Azul', 'Amarelo/Rosa', 'Inox'],
    description: 'Acessório indispensável de bancada para marcação, ajustes rápidos e conferência de medidas em ateliês de costura.',
    priceRange: [12.9, 49.9],
    image: '/images/cat_acessorios.jpg',
  },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function handleProductGeneration() {
  const db = getDb();

  const tpl = randomItem(PRODUCT_CATALOG_TEMPLATES);
  const baseName = randomItem(tpl.names);
  const spec = randomItem(tpl.specs);
  const color = randomItem(tpl.colors);
  const refCode = crypto.randomBytes(2).toString('hex').toUpperCase();

  const productId = `prod_${crypto.randomBytes(6).toString('hex')}`;
  const fullName = `${baseName} ${spec} — ${color} (Ref. ${refCode})`;
  const [minPrice, maxPrice] = tpl.priceRange;
  const rawPrice = minPrice + Math.random() * (maxPrice - minPrice);
  const price = Math.round(rawPrice * 10) / 10 + 0.9; // ex: 34.90
  const stock = Math.floor(Math.random() * 65) + 10;

  await db.query(
    `INSERT INTO products (
      id, name, description, price, stock, category, image_url, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
    [
      productId,
      fullName,
      tpl.description,
      Number(price.toFixed(2)),
      stock,
      tpl.category,
      tpl.image,
    ]
  );

  const countRes = await db.query('SELECT COUNT(*)::int as total FROM products');
  const totalProducts = countRes.results[0]?.total ?? 0;

  return {
    success: true,
    message: 'Produto incremental criado com sucesso no PostgreSQL.',
    created_product: {
      id: productId,
      name: fullName,
      category: tpl.category,
      price: Number(price.toFixed(2)),
      stock,
      image_url: tpl.image,
      created_at: new Date().toISOString(),
    },
    totalProductsInDatabase: totalProducts,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.',
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleProductGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar produto via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir produto no banco PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso não autorizado. Forneça a chave via ?key=senha123 ou cabeçalho x-cron-key.',
      },
      { status: 401 }
    );
  }

  try {
    const result = await handleProductGeneration();
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao gerar produto via cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao inserir produto no banco PostgreSQL.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

