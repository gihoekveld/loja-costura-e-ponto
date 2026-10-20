'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';
import { Trash2, ArrowRight, ArrowLeft, Plus, Minus, Truck, ShieldCheck, Scissors } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 bg-[#f7ece8] border border-[#f1d6ce] rounded-full flex items-center justify-center mx-auto text-[#b85042]">
          <Scissors className="w-8 h-8 transform -rotate-45" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-stone-900">Seu carrinho de compras está vazio</h1>
          <p className="text-xs text-stone-500">
            Encontre linhas, aparelhos de máquinas, calcadores e ferramentas para o seu ateliê.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-[#b85042]/20"
        >
          Explorar Catálogo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Carrinho de Compras</h1>
          <p className="text-xs text-stone-500 mt-0.5">Revise os itens e quantidades antes de seguir para a entrega.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-[#b85042] transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-mono">
                    Foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="hover:text-[#b85042] transition-colors">
                  <h3 className="text-sm font-bold text-stone-900 truncate">{product.name}</h3>
                </Link>
                <p className="text-xs text-stone-500 mt-0.5">
                  Unitário: R$ {Number(product.price).toFixed(2).replace('.', ',')}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-stone-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 text-stone-400 hover:text-[#b85042] transition-colors"
                    title="Remover produto do carrinho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-stone-400 block font-medium">Subtotal</span>
                <span className="font-bold text-stone-900 text-sm font-mono">
                  R$ {(Number(product.price) * quantity).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-xl bg-[#f7f4ef] border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-[#b85042] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Continuar Comprando
            </Link>
            <span className="flex items-center gap-1 text-[#437a5b] font-medium">
              <Truck className="w-4 h-4" /> Frete Grátis acima de R$ 199
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 h-fit space-y-6 shadow-sm">
          <h2 className="font-bold text-stone-900 text-base border-b border-stone-200 pb-3">Resumo do Pedido</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal dos produtos</span>
              <span className="font-mono text-stone-900 font-medium">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Frete Estimado</span>
              <span className="font-mono text-[#437a5b] font-bold">Grátis</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <span className="font-bold text-stone-900 text-sm">Valor Total</span>
              <span className="font-extrabold text-[#b85042] text-2xl font-mono">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <span className="text-[10px] text-stone-500 block text-right">
              ou até 6x sem juros no cartão
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3.5 px-4 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#b85042]/20 transition-all"
          >
            <span>Avançar para o Pagamento</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#437a5b]" />
            <span>Compra 100% Segura • Garantia de Entrega</span>
          </div>
        </div>
      </div>
    </div>
  );
}
