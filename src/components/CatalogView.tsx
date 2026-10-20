'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { 
  Filter, 
  Search, 
  X, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ChevronRight, 
  Star,
  Package,
  RotateCcw,
  Check
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  initialCategory?: string;
  initialSearch?: string;
  initialFavoritos?: boolean;
}

const CATEGORY_NAMES = [
  'Linhas & Fios',
  'Calcadores & Sapatilhas',
  'Corte & Medição',
  'Agulhas & Bobinas',
  'Botões',
  'Zíperes',
  'Elásticos & Viés',
  'Acessórios',
  'Aparelhos & Guias'
];

const BRANDS_LIST = [
  { id: 'singer', name: 'Singer' },
  { id: 'brother', name: 'Brother' },
  { id: 'janome', name: 'Janome' },
  { id: 'elgin', name: 'Elgin' },
  { id: 'outras', name: 'Outras' },
];

const COLORS_LIST = [
  { id: 'vermelho', name: 'Vermelho', hex: '#dc2626' },
  { id: 'terracota', name: 'Terracota', hex: '#a34839' },
  { id: 'amarelo', name: 'Amarelo', hex: '#facc15' },
  { id: 'verde', name: 'Verde', hex: '#16a34a' },
  { id: 'azul', name: 'Azul Claro', hex: '#0284c7' },
  { id: 'marinho', name: 'Azul Marinho', hex: '#1e3a8a' },
  { id: 'roxo', name: 'Roxo', hex: '#9333ea' },
  { id: 'preto', name: 'Preto', hex: '#1c1917' },
  { id: 'cinza', name: 'Cinza', hex: '#9ca3af' },
  { id: 'branco', name: 'Branco', hex: '#ffffff', border: true },
];

export function CatalogView({
  products,
  initialCategory = '',
  initialSearch = '',
  initialFavoritos = false,
}: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showMoreColors, setShowMoreColors] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevant' | 'price_asc' | 'price_desc' | 'name'>('relevant');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Contagem de itens por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Contagem de marcas
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {
      singer: 0,
      brother: 0,
      janome: 0,
      elgin: 0,
      outras: 0,
    };
    for (const p of products) {
      const text = `${p.name} ${p.description}`.toLowerCase();
      if (text.includes('singer')) counts.singer++;
      else if (text.includes('brother')) counts.brother++;
      else if (text.includes('janome')) counts.janome++;
      else if (text.includes('elgin')) counts.elgin++;
      else counts.outras++;
    }
    return counts;
  }, [products]);

  // Filtragem
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Categoria
        if (selectedCategory && selectedCategory !== 'all') {
          if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        // Busca textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        // Faixa de preço (atualizada conforme a referência)
        const price = Number(p.price);
        if (priceRange === 'under20' && price >= 20) return false;
        if (priceRange === '20to50' && (price < 20 || price > 50)) return false;
        if (priceRange === '50to100' && (price < 50 || price > 100)) return false;
        if (priceRange === '100to200' && (price < 100 || price > 200)) return false;
        if (priceRange === 'over200' && price <= 200) return false;

        // Marca
        if (selectedBrand) {
          const text = `${p.name} ${p.description}`.toLowerCase();
          if (selectedBrand === 'singer' && !text.includes('singer')) return false;
          if (selectedBrand === 'brother' && !text.includes('brother')) return false;
          if (selectedBrand === 'janome' && !text.includes('janome')) return false;
          if (selectedBrand === 'elgin' && !text.includes('elgin')) return false;
          if (selectedBrand === 'outras' && (text.includes('singer') || text.includes('brother') || text.includes('janome') || text.includes('elgin'))) return false;
        }

        // Cor
        if (selectedColor) {
          const text = `${p.name} ${p.description}`.toLowerCase();
          if (!text.includes(selectedColor.toLowerCase())) {
            // Se for cor geral, aceita se for colorida ou se produto for neutro/geral
            if (!text.includes('cor') && !text.includes('color')) return false;
          }
        }

        // Avaliação
        if (minRating > 0 && (p.rating || 4.8) < minRating) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // Mais relevantes
      });
  }, [products, selectedCategory, searchQuery, priceRange, selectedBrand, selectedColor, minRating, sortBy]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange('all');
    setSelectedBrand('');
    setSelectedColor('');
    setMinRating(0);
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || priceRange !== 'all' || selectedBrand || selectedColor || minRating > 0
  );

  const filteredBrands = BRANDS_LIST.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* =========================================
          SEÇÃO 1: BREADCRUMB
          ========================================= */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#a34839] transition-colors">
          Início
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link 
          href="/products" 
          onClick={() => setSelectedCategory('')}
          className={selectedCategory ? 'hover:text-[#a34839] transition-colors' : 'text-[#a34839] font-bold'}
        >
          Produtos
        </Link>
        {selectedCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#a34839] font-bold">{selectedCategory}</span>
          </>
        )}
      </div>

      {/* =========================================
          SEÇÃO 2: BANNER ELEGANTE DA PÁGINA (REFERÊNCIA)
          - Altura ~160-180px em desktop
          - Fundo creme/off-white #fbf5f2
          - Imagem à direita com acabamento harmônico
          - Texto à esquerda com hierarquia visual precisa
          ========================================= */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#fbf5f2] border border-[#edd8d2] overflow-hidden min-h-[160px] sm:h-[175px] flex items-center justify-between shadow-2xs">
        {/* Lado Esquerdo: Conteúdo Textual */}
        <div className="px-6 sm:px-10 py-6 max-w-xl space-y-2 z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2c2725] tracking-tight">
            Todos os Produtos
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg">
            Explore nossa variedade de aviamentos, tecidos e acessórios para deixar suas criações ainda mais especiais.
          </p>
        </div>

        {/* Lado Direito: Imagem Hero Banner com Integração Suave */}
        <div className="relative w-full md:w-[48%] lg:w-[44%] h-full shrink-0 hidden md:block overflow-hidden">
          <img
            src="/images/products_hero_banner.jpg"
            alt="Mais cor para os seus projetos!"
            className="w-full h-full object-cover object-right select-none pointer-events-none"
          />
          {/* Degradê de fusão suave entre a foto e o fundo creme */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fbf5f2] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Botão de Filtros no Mobile */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl"
        >
          <Filter className="w-3.5 h-3.5 text-[#a34839]" />
          <span>Filtros {hasActiveFilters && '(Ativos)'}</span>
        </button>

        <span className="text-xs text-stone-500 font-medium">
          {filteredProducts.length} produtos encontrados
        </span>
      </div>

      {/* =========================================
          SEÇÃO 3: ESTRUTURA PRINCIPAL (SIDEBAR + GRID)
          ========================================= */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* =========================================
            COLUNA ESQUERDA: SIDEBAR DE FILTROS
            Largura desktop: ~280-300px
            ========================================= */}
        <aside
          className={`w-full lg:w-[280px] shrink-0 bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Cabeçalho da Sidebar */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#a34839]" />
              <span>Filtros</span>
            </h3>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-[#a34839] hover:underline"
              >
                Limpar
              </button>
            )}
          </div>

          {/* 1. Filtro: Categorias */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Categorias</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCategory || selectedCategory === 'all'}
                    onChange={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className="accent-[#a34839] rounded"
                  />
                  <span className={`${!selectedCategory ? 'font-bold text-[#a34839]' : 'text-stone-700'} group-hover:text-[#a34839]`}>
                    Todas as Categorias
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">({products.length})</span>
              </label>

              {CATEGORY_NAMES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory?.toLowerCase() === cat.toLowerCase();

                return (
                  <label key={cat} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="category"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className="accent-[#a34839] rounded"
                      />
                      <span className={`${isSelected ? 'font-bold text-[#a34839]' : 'text-stone-700'} group-hover:text-[#a34839]`}>
                        {cat}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Filtro: Faixa de Preço */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Faixa de Preço</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </h4>

            <div className="space-y-2 text-xs text-stone-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'all'}
                  onChange={() => { setPriceRange('all'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>Todos os preços</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'under20'}
                  onChange={() => { setPriceRange('under20'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>Até R$ 19,90</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === '20to50'}
                  onChange={() => { setPriceRange('20to50'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>R$ 20,00 — R$ 49,90</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === '50to100'}
                  onChange={() => { setPriceRange('50to100'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>R$ 50,00 — R$ 99,90</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === '100to200'}
                  onChange={() => { setPriceRange('100to200'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>R$ 100,00 — R$ 199,90</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'over200'}
                  onChange={() => { setPriceRange('over200'); setCurrentPage(1); }}
                  className="accent-[#a34839]"
                />
                <span>Acima de R$ 200,00</span>
              </label>
            </div>
          </div>

          {/* 3. Filtro: Marca */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Marca</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </h4>

            {/* Input de Busca de Marca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Buscar marca..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#a34839]"
              />
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              {filteredBrands.map((b) => {
                const count = brandCounts[b.id] || 0;
                const isSelected = selectedBrand === b.id;

                return (
                  <label key={b.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedBrand(isSelected ? '' : b.id);
                          setCurrentPage(1);
                        }}
                        className="accent-[#a34839] rounded"
                      />
                      <span className={`${isSelected ? 'font-bold text-[#a34839]' : 'text-stone-700'} group-hover:text-[#a34839]`}>
                        {b.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Filtro: Cor (Paleta em Círculos) */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Cor</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </h4>

            <div className="flex flex-wrap gap-2.5 items-center">
              {(showMoreColors ? COLORS_LIST : COLORS_LIST.slice(0, 7)).map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    onClick={() => {
                      setSelectedColor(isSelected ? '' : color.name);
                      setCurrentPage(1);
                    }}
                    style={{ backgroundColor: color.hex }}
                    className={`w-6 h-6 rounded-full transition-all relative flex items-center justify-center ${
                      color.border ? 'border border-stone-300' : ''
                    } ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#a34839] scale-110 shadow-xs' : 'hover:scale-110'
                    }`}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${color.id === 'branco' || color.id === 'amarelo' ? 'text-stone-900' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowMoreColors(!showMoreColors)}
              className="text-[11px] font-semibold text-[#a34839] hover:underline flex items-center gap-1 pt-1"
            >
              <span>{showMoreColors ? 'Ver menos' : 'Ver mais'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMoreColors ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 5. Filtro: Avaliação */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Avaliação</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </h4>

            <div className="space-y-1.5 text-xs">
              {[
                { stars: 5, label: '5 estrelas', count: 38 },
                { stars: 4, label: '4 e 5 estrelas', count: 112 },
                { stars: 3, label: '3 e 4 estrelas', count: 156 },
                { stars: 2, label: '2 e 3 estrelas', count: 48 },
                { stars: 1, label: '1 e 2 estrelas', count: 18 },
              ].map(({ stars, label, count }) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => {
                    setMinRating(minRating === stars ? 0 : stars);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                    minRating === stars ? 'bg-[#fcedeb] font-bold text-[#a34839]' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                    <span className="text-[11px] text-stone-700 ml-1.5 font-sans">
                      {label}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">({count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full py-2.5 rounded-xl border border-stone-300 hover:border-[#a34839] hover:text-[#a34839] text-stone-700 text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        </aside>

        {/* =========================================
            COLUNA DIREITA: ÁREA DE PRODUTOS
            Ocupa todo o espaço restante disponível
            ========================================= */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Barra de Informações e Ordenação Superior */}
          <div className="bg-white border border-stone-200/90 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            {/* Seletor de Ordenação à Esquerda */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#a34839] cursor-pointer"
              >
                <option value="relevant">Mais relevantes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name">Ordem Alfabética</option>
              </select>
            </div>

            {/* Ações da Direita: Alternância Grade/Lista e Contagem */}
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Visualização em Grade"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-[#a34839] shadow-xs' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Visualização em Lista"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-[#a34839] shadow-xs' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-px bg-stone-200 hidden sm:block" />

              <span className="text-xs text-stone-600 font-medium">
                <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> produtos encontrados
              </span>
            </div>
          </div>

          {/* Tags de Filtros Ativos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-[#fbf5f2] p-3 rounded-2xl border border-[#f1ded6] text-xs">
              <span className="font-semibold text-stone-600">Filtros ativos:</span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>Categoria: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('')} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>Busca: &ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedBrand && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>Marca: {BRANDS_LIST.find(b => b.id === selectedBrand)?.name}</span>
                  <button onClick={() => setSelectedBrand('')} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedColor && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>Cor: {selectedColor}</span>
                  <button onClick={() => setSelectedColor('')} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>
                    Preço: {
                      priceRange === 'under20' ? 'Até R$ 19,90' :
                      priceRange === '20to50' ? 'R$ 20,00 — R$ 49,90' :
                      priceRange === '50to100' ? 'R$ 50,00 — R$ 99,90' :
                      priceRange === '100to200' ? 'R$ 100,00 — R$ 199,90' :
                      'Acima de R$ 200,00'
                    }
                  </span>
                  <button onClick={() => setPriceRange('all')} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold shadow-2xs">
                  <span>Avaliação: {minRating}★ ou mais</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-[#a34839] hover:underline font-bold text-xs ml-auto"
              >
                Limpar todos
              </button>
            </div>
          )}

          {/* Grade ou Lista de Produtos */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
              <Package className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-900">Nenhum produto encontrado</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Não encontramos produtos que correspondam aos filtros selecionados. Tente remover filtros ou buscar por outro termo.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-[#a34839] hover:bg-[#8c3527] text-white text-xs font-bold rounded-full transition-colors shadow-2xs"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="list" />
              ))}
            </div>
          )}

          {/* Paginação Estilizada da Referência: ‹ 1 2 3 4 5 › */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:border-[#a34839] flex items-center justify-center text-xs font-bold text-stone-700 transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-[#a34839] text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:border-[#a34839]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-9 h-9 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:border-[#a34839] flex items-center justify-center text-xs font-bold text-stone-700 transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                aria-label="Próxima página"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
