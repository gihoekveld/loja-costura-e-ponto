'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart/context';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';

export function ProductAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.stock > 0) {
      addItem(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            disabled={product.stock <= 0}
            aria-label="Diminuir quantidade"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center text-xs font-semibold text-stone-900 font-mono">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            disabled={product.stock <= 0}
            aria-label="Aumentar quantidade"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            added
              ? 'bg-[#437a5b] text-white shadow-xs'
              : product.stock > 0
              ? 'bg-[#b85042] hover:bg-[#a33f32] text-white shadow-md shadow-[#b85042]/20'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Adicionado ao Carrinho!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho
            </>
          )}
        </button>
      </div>
    </div>
  );
}
