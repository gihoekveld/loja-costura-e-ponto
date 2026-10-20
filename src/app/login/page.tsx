'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Scissors, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'E-mail ou senha incorretos.');
        setLoading(false);
        return;
      }

      window.location.href = redirect;
    } catch (err) {
      setError('Erro de conexão ao realizar login.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Scissors className="w-6 h-6 transform -rotate-45" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Acessar Minha Conta</h1>
        <p className="text-xs text-stone-600">
          Informe seu e-mail e senha para acompanhar seus pedidos e gerenciar seu ateliê.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="space-y-1">
          <label className="block text-xs text-stone-700 font-medium">E-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com.br"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs text-stone-700 font-medium">Senha</label>
            <a href="#" className="text-[11px] text-[#b85042] hover:underline">
              Esqueci minha senha
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-xs rounded-xl shadow-md shadow-[#b85042]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar na Conta'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-stone-600">
        Ainda não tem uma conta?{' '}
        <Link href="/register" className="text-[#b85042] font-semibold hover:underline">
          Cadastre seu ateliê
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-stone-500 text-xs py-8">Carregando formulário...</div>}>
      <LoginForm />
    </Suspense>
  );
}
