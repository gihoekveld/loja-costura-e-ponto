import Link from 'next/link';
import { getAllProducts } from '@/lib/db/products';
import { ProductCard } from '@/components/ProductCard';
import { 
  ArrowRight, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Package, 
  Headphones, 
  Star,
  Sparkles,
  Heart
} from 'lucide-react';

export const revalidate = 0;

const CATEGORIES_CIRCLES = [
  {
    name: 'Linhas & Fios',
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421610/sec-store/kit-12-linhas-coloridas-costura-geral-120-reta.webp',
    href: '/products?category=Linhas+%26+Fios',
  },
  {
    name: 'Calcadores & Sapatilhas',
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792421937/sec-store/calcador-para-ziper-invisivel-de-aco.webp',
    href: '/products?category=Calcadores+%26+Sapatilhas',
  },
  {
    name: 'Corte & Medição',
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427660/sec-store/tesoura-forjada-10-pol-alfaiate-costura-profissional-tecidos-cor-prateado.webp',
    href: '/products?category=Corte+%26+Medi%C3%A7%C3%A3o',
  },
  {
    name: 'Agulhas & Bobinas',
    image: 'https://res.cloudinary.com/hoekveld-dev/image/upload/v1792427984/sec-store/kit-50-agulhas-singer-2020-maquina-caseira-agulha-domestica.webp',
    href: '/products?category=Agulhas+%26+Bobinas',
  },
  {
    name: 'Botões',
    image: '/images/cat_botoes.jpg',
    href: '/products?category=Bot%C3%B5es',
  },
  {
    name: 'Zíperes',
    image: '/images/cat_ziperes.jpg',
    href: '/products?category=Z%C3%ADperes',
  },
  {
    name: 'Elásticos & Viés',
    image: '/images/cat_elasticos.jpg',
    href: '/products?category=El%C3%A1sticos+%26+Vi%C3%A9s',
  },
  {
    name: 'Acessórios',
    image: '/images/cat_acessorios.jpg',
    href: '/products?category=Acess%C3%B3rios',
  },
];

export default async function HomePage() {
  const products = await getAllProducts();

  // Selecionar produtos em alta (6 a 8 produtos para a grade inicial)
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* =========================================
          SEÇÃO A: HERO BANNER EDITORIAL
          ========================================= */}
      <section className="relative rounded-[32px] border border-[#f1ded6] bg-gradient-to-r from-[#fbf4ee] via-[#faeae3] to-[#fbf5f2] overflow-hidden p-6 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Lado Esquerdo: Textos e Ações */}
          <div className="lg:col-span-6 space-y-6 z-10">
            {/* Traço de Costura e Eyebrow */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#a34839]">
                {/* Linha pontilhada com coração estilizado */}
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M2 12 Q 10 2 20 10 T 38 4" stroke="#a34839" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="38" cy="4" r="2" fill="#a34839" />
                </svg>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a34839]">
                  TUDO PARA O SEU MUNDO DA COSTURA
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2c2725] tracking-tight leading-[1.12]">
                Aviamentos, tecidos e muito mais!
              </h1>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg">
              Encontre os melhores produtos para suas criações, com qualidade, variedade e o melhor atendimento.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className="px-6 py-3.5 bg-[#a34839] hover:bg-[#8c3527] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-md shadow-[#a34839]/20 flex items-center gap-2 group"
              >
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Ver Produtos da Loja</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#categorias"
                className="px-6 py-3.5 bg-white/90 hover:bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs sm:text-sm font-semibold rounded-full transition-all shadow-2xs"
              >
                Conheça nossas Categorias
              </a>
            </div>
          </div>

          {/* Lado Direito: Composição Fotográfica da Referência */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 bg-stone-100 aspect-16/10">
              <img
                src="/images/hero_banner.jpg"
                alt="Composição de aviamentos e acessórios de costura: linhas, tesoura, fita métrica e botões"
                className="w-full h-full object-cover"
              />

              {/* Selo Flutuante da Referência */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs border border-dashed border-[#a34839]/60 px-3.5 py-1.5 rounded-full shadow-md text-stone-800 flex items-center gap-1.5 animate-in fade-in duration-300">
                <span className="text-xs font-serif italic text-stone-900">
                  Mais cor para os seus projetos!
                </span>
                <Heart className="w-3.5 h-3.5 fill-[#a34839] text-[#a34839]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SEÇÃO B: FAIXA DE BENEFÍCIOS (5 ITENS)
          ========================================= */}
      <section className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-200/70">
          {/* Benefício 1 */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 md:px-2">
            <div className="w-10 h-10 rounded-xl bg-[#fcedeb] border border-[#f5dbd5] flex items-center justify-center text-[#a34839] shrink-0">
              <Truck className="w-5 h-5 text-[#a34839]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Frete Grátis
              </span>
              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                para todo o Brasil acima de R$ 199
              </span>
            </div>
          </div>

          {/* Benefício 2 */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 md:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#fcedeb] border border-[#f5dbd5] flex items-center justify-center text-[#a34839] shrink-0">
              <CreditCard className="w-5 h-5 text-[#a34839]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Até 6x sem Juros
              </span>
              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                no cartão de crédito
              </span>
            </div>
          </div>

          {/* Benefício 3 */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 md:px-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#437a5b] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#437a5b]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Compra Segura
              </span>
              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                com proteção de dados
              </span>
            </div>
          </div>

          {/* Benefício 4 */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 md:px-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c67d26] shrink-0">
              <Package className="w-5 h-5 text-[#c67d26]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Envio Rápido
              </span>
              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                para todo o Brasil
              </span>
            </div>
          </div>

          {/* Benefício 5 */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 md:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#fcedeb] border border-[#f5dbd5] flex items-center justify-center text-[#a34839] shrink-0">
              <Headphones className="w-5 h-5 text-[#a34839]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Atendimento Especializado
              </span>
              <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                para tirar suas dúvidas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SEÇÃO C: NAVEGUE POR CATEGORIAS (8 CÍRCULOS)
          ========================================= */}
      <section id="categorias" className="scroll-mt-24 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c2725] tracking-tight">
            Navegue por Categorias
          </h2>
          <div className="w-12 h-1 bg-[#a34839] rounded-full mt-2" />
        </div>

        {/* Grade de 8 Categorias Circulares */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
          {CATEGORIES_CIRCLES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#faede8] border-2 border-white shadow-sm overflow-hidden p-1 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <span className="mt-3 text-xs font-bold text-stone-800 group-hover:text-[#a34839] transition-colors leading-tight line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[#a34839] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================
          SEÇÃO D: PRODUTOS EM DESTAQUE (PRODUTOS EM ALTA)
          ========================================= */}
      <section id="produtos-em-alta" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c2725] tracking-tight">
            Produtos em Alta
          </h2>

          <Link
            href="/products"
            className="px-4 py-2 rounded-full border border-stone-300 hover:border-[#a34839] hover:text-[#a34839] text-stone-700 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto group"
          >
            <span>Ver Todos os Produtos</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grade de Cards de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* =========================================
          SEÇÃO E: FAIXA EDITORIAL COMPLEMENTAR
          ========================================= */}
      <section className="rounded-3xl border border-[#edd5cf] bg-[#fbf5f2] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold text-[#a34839] uppercase tracking-wider">
            Qualidade para o seu ateliê
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#2c2725] tracking-tight">
            Tudo o que sua máquina de costura precisa para produzir com perfeição
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Linhas bonderizadas de alta tenacidade que não arrebentam, calcadores antiaderentes para couro e sintéticos, zíperes de deslize suave e aparelhos reguláveis para agilizar sua confecção.
          </p>
        </div>

        <Link
          href="/products"
          className="px-6 py-3 bg-[#a34839] hover:bg-[#8c3527] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <span>Explorar Catálogo Completo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
