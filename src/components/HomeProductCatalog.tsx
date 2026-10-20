'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Search, Sparkles, Filter, ArrowUpDown, Scissors } from 'lucide-react';

export function HomeProductCatalog({ initialProducts }: { initialProducts: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialProducts.map((p) => p.category)));
    return ['all', ...cats];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          searchQuery.trim() === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // featured/default
      });
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalogo" className="space-y-8 scroll-mt-24">
      {/* Header and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#b85042] font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#b85042]" />
              <span>Catálogo Oficial do Ateliê & Oficina Doméstica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Todos os Produtos Disponíveis ({filteredProducts.length})
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Linhas resistentes, aparelhos industriais, calcadores especiais e ferramentas de corte a pronta entrega.
            </p>
          </div>

          {/* Quick Stats or Highlights */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs text-xs text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[11px] text-stone-500 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Mais Relevantes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name">Ordem Alfabética</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por viés, linha, calcador, tesoura..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#b85042] shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#b85042] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-xs'
                }`}
              >
                {cat === 'all' ? 'Todos os Produtos' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            <Scissors className="w-6 h-6 transform -rotate-45" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Nenhum produto encontrado</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Não encontramos itens correspondentes à sua busca &ldquo;{searchQuery}&rdquo;. Tente buscar por outros termos ou limpe o filtro.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Limpar Filtros de Busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
