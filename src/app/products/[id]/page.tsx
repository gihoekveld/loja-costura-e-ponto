

import { getProductById } from '@/lib/db/products';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductAddToCart } from './AddToCart';
import { ArrowLeft, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#b85042] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="relative aspect-square rounded-2xl bg-stone-100 overflow-hidden border border-stone-200">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-stone-400">
              Sem Imagem
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="inline-block bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-stone-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-stone-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-500 block font-medium">Preço</span>
                <span className="text-3xl font-extrabold text-stone-900 font-mono">
                  R$ {Number(product.price).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  ou até 6x de R$ {(Number(product.price) / 6).toFixed(2).replace('.', ',')} sem juros
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block font-medium">Disponibilidade</span>
                <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-[#437a5b]' : 'text-[#b85042]'}`}>
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                </span>
              </div>
            </div>

            <ProductAddToCart product={product} />

            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#437a5b] shrink-0" />
                <span>Frete Grátis nas compras acima de R$ 199 para todo o Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#437a5b] shrink-0" />
                <span>Compatibilidade garantida com máquinas retas industriais e domésticas</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#437a5b] shrink-0" />
                <span>Garantia de 30 dias e emissão de Nota Fiscal Eletrônica</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
