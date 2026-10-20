'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/lib/cart/context';
import { useFavorites } from '@/lib/favorites/context';
import { ShoppingCart, Check, Heart, Star, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  // Badges e dados complementares inspirados na referência visual
  const isOferta = product.badge === 'Oferta' || product.id === 'prod_02' || product.id === 'prod_10';
  const isMaisVendido = product.badge === 'Mais Vendido' || product.id === 'prod_01' || product.id === 'prod_03' || product.id === 'prod_06' || product.id === 'prod_16';
  const isLancamento = product.badge === 'Lançamento' || product.id === 'prod_13' || product.id === 'prod_18';

  const badgeText = product.badge || (isMaisVendido ? 'Mais vendido' : isOferta ? 'Oferta' : isLancamento ? 'Lançamento' : null);
  const badgeColor = isMaisVendido 
    ? 'bg-[#8c3527] text-white' 
    : isOferta 
    ? 'bg-[#a34839] text-white' 
    : 'bg-[#c85a48] text-white';

  const originalPrice = product.original_price || (isOferta ? Number((Number(product.price) * 1.3).toFixed(2)) : null);
  const rating = product.rating || (product.id.charCodeAt(product.id.length - 1) % 2 === 0 ? 4.9 : 4.8);
  const reviewsCount = product.reviews_count || (Math.floor(Number(product.price) * 3 + 45));
  const installments = (Number(product.price) / 6).toFixed(2).replace('.', ',');
  const favorited = isFavorite(product.id);

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#dfb5ab] transition-all flex flex-col sm:flex-row items-stretch group relative p-3 sm:p-4 gap-4">
        {/* Left: Image with Badge & Favorite */}
        <div className="relative w-full sm:w-48 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-[#faf8f5]">
          {badgeText && (
            <span className={`absolute top-2 left-2 z-10 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide ${badgeColor}`}>
              {badgeText}
            </span>
          )}
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200 flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 ${
              favorited ? 'text-[#a34839] border-[#a34839]' : 'text-stone-400 hover:text-[#a34839]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#a34839]' : ''}`} />
          </button>

          <Link href={`/products/${product.id}`} className="block w-full h-full">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 font-mono text-xs">
                {product.name}
              </div>
            )}
          </Link>
        </div>

        {/* Center: Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-stone-800">{rating}</span>
              <span className="text-[11px] text-stone-400">({reviewsCount} avaliações)</span>
            </div>

            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-bold text-stone-900 text-base hover:text-[#a34839] transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium">{product.category}</span>
            <span>•</span>
            <span className={product.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
              {product.stock > 0 ? `Em estoque (${product.stock} un.)` : 'Esgotado'}
            </span>
          </div>
        </div>

        {/* Right: Price and Action */}
        <div className="w-full sm:w-48 shrink-0 flex flex-col justify-center sm:items-end sm:border-l sm:border-stone-100 sm:pl-4 space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="sm:text-right">
            {originalPrice && (
              <span className="text-[11px] text-stone-400 line-through block font-mono">
                R$ {originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="font-extrabold text-stone-900 text-xl font-mono leading-none block">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              ou 6x de R$ {installments}
            </span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                added
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#a34839] hover:bg-[#8c3527] text-white shadow-[#a34839]/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Adicionar ao carrinho</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 text-xs font-medium flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Produto Esgotado</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#dfb5ab] transition-all flex flex-col justify-between h-full group relative">
      {/* Top Badges & Favorite Button */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {badgeText ? (
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide pointer-events-auto ${badgeColor}`}>
            {badgeText}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200 flex items-center justify-center transition-all shadow-xs pointer-events-auto hover:scale-110 active:scale-95 ${
            favorited ? 'text-[#a34839] border-[#a34839]' : 'text-stone-400 hover:text-[#a34839]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#a34839]' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} className="block relative aspect-[4/3] bg-[#faf8f5] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 font-mono text-xs">
            {product.name}
          </div>
        )}
      </Link>

      {/* Content & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Avaliação */}
          <div className="flex items-center gap-1.5 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-stone-800">{rating}</span>
            <span className="text-[11px] text-stone-400">({reviewsCount})</span>
          </div>

          {/* Nome */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-stone-900 text-sm hover:text-[#a34839] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Descrição */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {product.description}
          </p>
        </div>

        {/* Preço e Botão */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div>
            {originalPrice ? (
              <span className="text-[11px] text-stone-400 line-through block font-mono">
                R$ {originalPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <span className="text-[11px] text-transparent block font-mono select-none">
                -
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-stone-900 text-lg sm:text-xl font-mono leading-none">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              ou 6x de R$ {installments}
            </span>
          </div>

          {/* Ação de Adicionar ao Carrinho */}
          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                added
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#a34839] hover:bg-[#8c3527] text-white shadow-[#a34839]/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Adicionar ao carrinho</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 text-xs font-medium flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Produto Esgotado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
