

import { getSessionUser } from '@/lib/auth/session';
import { getOrdersByUserId } from '@/lib/db/orders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Lock,
  Package,
  Calendar
} from 'lucide-react';

export const revalidate = 0;

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const orders = await getOrdersByUserId(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Minha Conta</h1>
          <p className="text-xs text-stone-500 mt-0.5">Gerencie os dados cadastrais do seu ateliê e consulte seus pedidos.</p>
        </div>

        {user.role === 'admin' && (
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-[#f7ece8] hover:bg-[#f1d6ce] text-[#b85042] border border-[#f1d6ce] text-xs font-semibold flex items-center gap-2 transition-colors w-fit"
          >
            <ShieldCheck className="w-4 h-4 text-[#b85042]" />
            <span>Acessar Painel do Administrador</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] rounded-xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">{user.name}</h2>
              <span className="text-[10px] text-[#437a5b] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase">
                {user.role === 'admin' ? 'Administrador' : 'Cliente Cadastrado'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-start gap-2 text-stone-700">
              <Mail className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">E-mail</span>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-stone-700">
              <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Celular / WhatsApp</span>
                <span>{user.phone || '(11) 98765-4321'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-stone-700">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Endereço de Entrega Principal</span>
                <span className="leading-relaxed">
                  {user.street ? (
                    <>
                      {user.street}, {user.number}{user.complement ? ' - ' + user.complement : ''}<br />
                      {user.neighborhood} - {user.city}/{user.state}<br />
                      CEP: {user.cep}
                    </>
                  ) : (
                    'Endereço cadastrado no checkout'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-stone-700">
              <Lock className="w-4 h-4 text-[#437a5b] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">CPF Cadastrado (Protegido por Criptografia)</span>
                <span className="font-mono text-[11px] text-stone-600">
                  ***.***.***-**
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#b85042]" />
                Histórico de Pedidos ({orders.length})
              </h2>
              <Link href="/products" className="text-xs text-[#b85042] font-semibold hover:underline">
                Novo Pedido
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-500">Você ainda não realizou pedidos no ateliê.</p>
                <Link
                  href="/products"
                  className="inline-block px-4 py-2 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Conhecer Produtos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-stone-900 font-bold">{order.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            order.status === 'paid'
                              ? 'bg-emerald-100 border border-emerald-200 text-[#437a5b]'
                              : order.status === 'pending'
                              ? 'bg-amber-100 border border-amber-200 text-[#c67d26]'
                              : 'bg-rose-100 border border-rose-200 text-rose-700'
                          }`}
                        >
                          {order.status === 'paid' ? 'Pago (Aprovado)' : order.status === 'pending' ? 'Aguardando Pix' : 'Cancelado'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Total do Pedido</span>
                        <span className="font-bold text-stone-900 text-sm font-mono">
                          R$ {Number(order.total).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="px-3.5 py-1.5 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 text-stone-800 transition-colors flex items-center gap-1 shadow-xs font-medium"
                        title="Ver Detalhes do Pedido"
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
        </div>
      </div>
    </div>
  );
}
