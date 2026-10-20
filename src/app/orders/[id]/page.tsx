export const runtime = 'edge';

import { getSessionUser } from '@/lib/auth/session';
import { getOrderByIdForUser } from '@/lib/db/orders';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle, MapPin, CreditCard } from 'lucide-react';

export const revalidate = 0;

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  // IDOR Protection: Garante no D1 que order.user_id === user.id
  const order = await getOrderByIdForUser(params.id, user.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#b85042] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar aos Meus Pedidos
      </Link>

      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">Código do Pedido</span>
            <h1 className="text-xl font-bold text-stone-900 font-mono">{order.id}</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
              {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                order.status === 'paid'
                  ? 'bg-emerald-50 border border-emerald-200 text-[#437a5b]'
                  : order.status === 'pending'
                  ? 'bg-amber-50 border border-amber-200 text-[#c67d26]'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {order.status === 'paid' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#437a5b]" /> Pagamento Aprovado
                </>
              ) : order.status === 'pending' ? (
                <>
                  <Clock className="w-4 h-4 text-[#c67d26]" /> Aguardando Confirmação Pix
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" /> Cancelado
                </>
              )}
            </span>
          </div>
        </div>

        {/* Shipping & Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#b85042]" /> Endereço de Entrega
            </span>
            <p className="text-stone-700 leading-relaxed">{order.shipping_address}</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#437a5b]" /> Forma de Pagamento
            </span>
            <p className="text-stone-800 font-mono capitalize">
              {order.payment_method === 'pix' ? 'Pix à Vista' : order.payment_method.replace(/_/g, ' ')}
            </p>
            <span className="text-[10px] text-[#437a5b] font-medium block">Emissão de Nota Fiscal Eletrônica</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Produtos Comprados</h3>
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 grid grid-cols-12 gap-2">
              <span className="col-span-6">Produto</span>
              <span className="col-span-2 text-center">Qtd</span>
              <span className="col-span-2 text-right">Unitário</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3.5 grid grid-cols-12 gap-2 items-center text-stone-700">
                  <span className="col-span-6 font-medium text-stone-900">{item.product_name || item.product_id}</span>
                  <span className="col-span-2 text-center font-mono">{item.quantity}</span>
                  <span className="col-span-2 text-right font-mono">
                    R$ {Number(item.unit_price).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="col-span-2 text-right font-mono font-bold text-stone-900">
                    R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total and Actions */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Total do Pedido</span>
            <span className="text-2xl font-extrabold text-[#b85042] font-mono">
              R$ {Number(order.total).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/products"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors text-center w-full sm:w-auto"
            >
              Comprar Mais Itens
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
