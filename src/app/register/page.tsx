'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Scissors, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
  });

  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatação de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}.${val.slice(3)}`;
    }
    setFormData({ ...formData, cpf: val });
  };

  // Formatação de Celular / WhatsApp: (00) 00000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 10) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setFormData({ ...formData, phone: val });
  };

  // Formatação de CEP: 00000-000
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setFormData({ ...formData, cep: val });
    if (val.replace(/\D/g, '').length === 8) {
      fetchViaCep(val.replace(/\D/g, ''));
    }
  };

  const fetchViaCep = async (cleanCep: string) => {
    setSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      }
    } catch (e) {
      // Ignorar falha de API externa
    } finally {
      setSearchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('A confirmação da senha não confere com a senha informada.');
      return;
    }

    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf,
        phone: formData.phone,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state.toUpperCase(),
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar cadastro.');
        setLoading(false);
        return;
      }

      window.location.href = '/account';
    } catch (err) {
      setError('Erro de conexão ao processar o cadastro.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Scissors className="w-6 h-6 transform -rotate-45" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Criar Minha Conta</h1>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          Cadastre seu ateliê ou oficina para comprar com facilidade, acompanhar pedidos e receber promoções exclusivas.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Seção 1: Dados Pessoais */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#b85042] uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
            <UserIcon className="w-4 h-4" /> 1. Dados Pessoais & Contato
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-stone-700 font-medium">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Mariana Silva (ou Ateliê Silva)"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">CPF (Para Nota Fiscal)</label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Celular / WhatsApp</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Acesso à Conta */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#b85042] uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
            <Lock className="w-4 h-4" /> 2. Dados de Acesso
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-stone-700 font-medium">E-mail</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seuemail@exemplo.com.br"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Senha</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres (1 maiúscula + 1 número)"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Confirmar Senha</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repita sua senha"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Endereço de Entrega */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#b85042] uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
            <MapPin className="w-4 h-4" /> 3. Endereço de Entrega (Ateliê / Residência)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-stone-700 font-medium">CEP</label>
                {searchingCep && <span className="text-[10px] text-[#b85042]">Buscando...</span>}
              </div>
              <input
                type="text"
                required
                value={formData.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-stone-700 font-medium">Logradouro / Rua / Avenida</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Ex: Rua das Flores"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Número</label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="123"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Complemento (Opcional)</label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto 42, Bloco B, Ateliê"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Bairro</label>
              <input
                type="text"
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Bairro"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-stone-700 font-medium">Cidade</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-stone-700 font-medium">Estado (UF)</label>
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

        {/* Termos & Submissão */}
        <div className="pt-4 border-t border-stone-200 space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-stone-600">
            <ShieldCheck className="w-4 h-4 text-[#437a5b] shrink-0" />
            <span>Seus dados são protegidos por criptografia de ponta a ponta e utilizados estritamente para faturamento e entrega.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-sm rounded-xl shadow-md shadow-[#b85042]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Cadastrando dados...' : 'Criar Minha Conta'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-stone-600">
        Já possui uma conta?{' '}
        <Link href="/login" className="text-[#b85042] font-semibold hover:underline">
          Acessar minha conta
        </Link>
      </div>
    </div>
  );
}
