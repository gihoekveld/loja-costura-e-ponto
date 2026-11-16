import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let value = trimmed.slice(eqIdx + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnv();

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
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'costura_user'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'costura_ponto_db'}`;

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();

  try {
    const tpl = randomItem(PRODUCT_CATALOG_TEMPLATES);
    const baseName = randomItem(tpl.names);
    const spec = randomItem(tpl.specs);
    const color = randomItem(tpl.colors);
    const refCode = crypto.randomBytes(2).toString('hex').toUpperCase();

    const productId = `prod_${crypto.randomBytes(6).toString('hex')}`;
    const fullName = `${baseName} ${spec} — ${color} (Ref. ${refCode})`;
    const [minPrice, maxPrice] = tpl.priceRange;
    const rawPrice = minPrice + Math.random() * (maxPrice - minPrice);
    const price = Number((Math.round(rawPrice * 10) / 10 + 0.9).toFixed(2));
    const stock = Math.floor(Math.random() * 65) + 10;

    await client.query(
      `INSERT INTO products (id, name, description, price, stock, category, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [productId, fullName, tpl.description, price, stock, tpl.category, tpl.image]
    );

    const countRes = await client.query('SELECT COUNT(*)::int as total FROM products');
    console.log(
      JSON.stringify({
        success: true,
        created_product: { id: productId, name: fullName, category: tpl.category, price, stock },
        totalProductsInDatabase: countRes.rows[0].total,
        timestamp: new Date().toISOString(),
      })
    );
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Erro ao gerar produto:', err.message);
  process.exit(1);
});

