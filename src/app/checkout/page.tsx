'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart/context';
import { 
  Lock, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Truck, 
  MapPin, 
  ShieldCheck,
  Scissors
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    address: '',
    number: '',
    city: '',
    state: 'SP',
    cep: '',
    paymentMethod: 'pix',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setFormData((prev) => ({
              ...prev,
              name: data.user.name || prev.name,
              address: data.user.street || prev.address,
              number: data.user.number || prev.number,
              city: data.user.city || prev.city,
              state: data.user.state || prev.state,
              cep: data.user.cep || prev.cep,
              cpf: '234.567.890-12',
            }));
          }
        }
      } catch (e) {
        // Ignorar
      }
    }
    loadUser();
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-[#f7ece8] border border-[#f1d6ce] rounded-full flex items-center justify-center mx-auto text-[#b85042]">
          <Scissors className="w-7 h-7 transform -rotate-45" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Seu carrinho está vazio</h2>
        <p className="text-stone-500 text-xs">Adicione aparelhos, linhas ou calcadores para finalizar seu pedido.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-2.5 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-[#b85042]/20"
        >
          Explorar Catálogo
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        ...formData,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Falha ao processar pagamento do pedido.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message);
      clearCart();
      setTimeout(() => {
        if (data.order?.id) {
          router.push(`/orders/${data.order.id}`);
        } else {
          router.push('/orders');
        }
      }, 1200);
    } catch (err) {
      setError('Erro de conexão ao processar o checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#b85042]" /> Finalizar Compra Segura
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Confirme os dados de envio para seu ateliê e selecione a forma de pagamento.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg} Redirecionando para o comprovante...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Shipping and Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dados de Entrega */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-[#b85042] uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 1. Endereço de Entrega
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">Nome do Destinatário</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo ou Razão Social do Ateliê"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">CPF (Para Nota Fiscal)</label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">CEP</label>
                <input
                  type="text"
                  required
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">Logradouro / Rua</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Avenida, Alameda"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Número</label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="123"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Cidade</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Estado (UF)</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  placeholder="SP"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white uppercase font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-[#b85042] uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 2. Forma de Pagamento
            </h2>

            <div className="space-y-3 text-xs">
              <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                formData.paymentMethod === 'pix'
                  ? 'bg-[#f7ece8] border-[#b85042] text-stone-900 shadow-xs'
                  : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={formData.paymentMethod === 'pix'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                  className="text-[#b85042] focus:ring-0"
                />
                <QrCode className="w-5 h-5 text-[#437a5b] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">Pix com Confirmação Imediata</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#437a5b] text-[10px] font-bold">
                      Aprovação Rápida
                    </span>
                  </div>
                  <span className="text-stone-500 text-[11px] block mt-0.5">
                    O código Pix é gerado automaticamente na próxima tela para pagamento instantâneo.
                  </span>
                </div>
              </label>

              <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                formData.paymentMethod === 'credit_card_approved'
                  ? 'bg-[#f7ece8] border-[#b85042] text-stone-900 shadow-xs'
                  : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="credit_card_approved"
                  checked={formData.paymentMethod === 'credit_card_approved'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'credit_card_approved' })}
                  className="text-[#b85042] focus:ring-0"
                />
                <CreditCard className="w-5 h-5 text-[#c67d26] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">Cartão de Crédito</span>
                    <span className="text-[10px] text-stone-500 font-medium">Até 6x sem juros</span>
                  </div>
                  <span className="text-stone-500 text-[11px] block mt-0.5">
                    Transação segura processada com criptografia de ponta a ponta.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-sm sticky top-24">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider border-b border-stone-200 pb-2">
              Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </h3>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto space-y-2 text-xs">
              {items.map((i) => (
                <div key={i.product.id} className="pt-2 flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="font-medium text-stone-900 line-clamp-1">{i.product.name}</span>
                    <span className="text-[11px] text-stone-500">Qtd: {i.quantity} x R$ {Number(i.product.price).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0 font-mono">
                    R$ {(Number(i.product.price) * i.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal dos produtos</span>
                <span className="font-mono text-stone-900 font-medium">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#437a5b]" /> Frete Ateliê
                </span>
                <span className="text-[#437a5b] font-bold">Grátis</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 text-sm">Total do Pedido</span>
                <span className="text-2xl font-extrabold text-[#b85042] font-mono">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-sm rounded-xl shadow-md shadow-[#b85042]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando Pedido...' : 'Concluir Pedido'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#437a5b]" />
              <span>Compra 100% Segura com Emissão de NF-e</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
