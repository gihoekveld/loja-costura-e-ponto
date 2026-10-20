export const runtime = 'edge';

import { getSessionUser } from '@/lib/auth/session';
import { getOrdersByUserId } from '@/lib/db/orders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Calendar, Package } from 'lucide-react';

export const revalidate = 0;

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const orders = await getOrdersByUserId(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#b85042]" /> Meus Pedidos
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Acompanhe o status e histórico de compras realizadas para o seu ateliê.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <Package className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-600 text-xs">Nenhum pedido foi realizado nesta conta ainda.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Ir para o Catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      order.status === 'paid'
                        ? 'bg-emerald-50 border border-emerald-200 text-[#437a5b]'
                        : order.status === 'pending'
                        ? 'bg-amber-50 border border-amber-200 text-[#c67d26]'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}
                  >
                    {order.status === 'paid' ? 'Pago' : order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                <div>
                  <span className="text-[11px] text-stone-400 block font-medium">Total do Pedido</span>
                  <span className="font-extrabold text-stone-900 text-base font-mono">
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Detalhes</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#b85042]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
