'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Package,
  Users,
  ShoppingBag,
  ListOrdered,
  Cpu,
  Search,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

interface DatabaseData {
  database: string;
  host: string;
  port: string;
  timestamp: string;
  stats: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    totalOrderItems: number;
    totalSessions: number;
  };
  tables: {
    products: any[];
    users: any[];
    orders: any[];
    order_items: any[];
    sessions: any[];
  };
}

interface DatabaseViewerProps {
  initialPassword?: string;
  isInsideAdmin?: boolean;
}

function formatDateTime(val: any): string {
  if (!val) return '-';
  const d = new Date(typeof val === 'string' && /^\d+$/.test(val) ? Number(val) : val);
  if (isNaN(d.getTime())) return String(val);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

export function DatabaseViewer({ initialPassword = '', isInsideAdmin = false }: DatabaseViewerProps) {
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DatabaseData | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders' | 'order_items' | 'sessions' | 'json'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [generatingUser, setGeneratingUser] = useState(false);

  const fetchDatabase = async (pwd?: string) => {
    setLoading(true);
    setError(null);

    const queryPwd = pwd !== undefined ? pwd : password;
    const url = queryPwd
      ? `/api/admin/database?senha=${encodeURIComponent(queryPwd)}`
      : '/api/admin/database';

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 401) {
          setNeedsAuth(true);
        }
        throw new Error(json.error || 'Falha ao autenticar para visualizar o banco.');
      }

      setData(json);
      setNeedsAuth(false);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar dados do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPwd = params.get('senha') || params.get('password') || initialPassword;
      if (urlPwd) {
        setPassword(urlPwd);
        fetchDatabase(urlPwd);
        return;
      }
    }
    // Tenta carregar (funciona direto se já for admin autenticado)
    fetchDatabase();
  }, [initialPassword]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, digite a senha de acesso.');
      return;
    }
    fetchDatabase(password.trim());
  };

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateUser = async () => {
    setGeneratingUser(true);
    try {
      const key = password || 'senha123';
      const res = await fetch(`/api/cron/generate-user?key=${encodeURIComponent(key)}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchDatabase();
        setActiveTab('users');
      } else {
        alert(json.error || 'Erro ao gerar usuário');
      }
    } catch {
      alert('Erro de conexão ao acionar gerador de usuário');
    } finally {
      setGeneratingUser(false);
    }
  };

  const currentTableData = useMemo(() => {
    if (!data || activeTab === 'json') return [];
    const list = data.tables[activeTab] || [];
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter((item: any) =>
      Object.values(item).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [data, activeTab, searchTerm]);

  // Se requer senha para visualizar
  if (needsAuth && !data) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-xl">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-center text-stone-900 mb-1">
          Visualização do Banco de Dados
        </h2>
        <p className="text-center text-xs text-stone-500 mb-6">
          Inspeção direta de todas as tabelas PostgreSQL da loja Costura & Ponto.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Senha de Acesso ao Banco
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: senha123"
                className="w-full px-4 py-2.5 pr-11 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-stone-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Dica: Senha padrão configurada é <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-700">senha123</code>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consultando PostgreSQL...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Desbloquear Visualização</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CONTADORES EM CIMA (KPI METRICS) */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl shadow-md border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PostgreSQL 16 Conectado
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono border border-stone-700">
                Database: {data?.database || 'costura_ponto_db'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono border border-stone-700">
                Porta: {data?.port || '5432'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
              Inspeção de Dados do PostgreSQL
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
              Tabelas em tempo real com contadores e estruturas completas de schema e LGPD.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGenerateUser}
              disabled={generatingUser || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
              title="Dispara a rota /api/cron/generate-user para criar 1 novo usuário no PostgreSQL"
            >
              <UserPlus className={`w-3.5 h-3.5 ${generatingUser ? 'animate-bounce' : ''}`} />
              <span>{generatingUser ? 'Criando Usuário...' : '+ Gerar 1 Usuário (Simular Cron)'}</span>
            </button>

            <button
              onClick={() => fetchDatabase()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition border border-stone-700"
              title="Recarregar dados do banco"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
              title="Copiar JSON com todos os dados"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Exportar JSON'}</span>
            </button>
          </div>
        </div>

        {/* Grade de Contadores Principais em Cima */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          <div
            onClick={() => setActiveTab('products')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              activeTab === 'products'
                ? 'bg-stone-800 border-amber-500/80 ring-1 ring-amber-500/50'
                : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Produtos</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {data?.stats.totalProducts ?? 0}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">tabela: products</span>
          </div>

          <div
            onClick={() => setActiveTab('users')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              activeTab === 'users'
                ? 'bg-stone-800 border-sky-500/80 ring-1 ring-sky-500/50'
                : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Usuários</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {data?.stats.totalUsers ?? 0}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">tabela: users (LGPD)</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              activeTab === 'orders'
                ? 'bg-stone-800 border-emerald-500/80 ring-1 ring-emerald-500/50'
                : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Pedidos</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {data?.stats.totalOrders ?? 0}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">tabela: orders</span>
          </div>

          <div
            onClick={() => setActiveTab('order_items')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              activeTab === 'order_items'
                ? 'bg-stone-800 border-purple-500/80 ring-1 ring-purple-500/50'
                : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Itens Pedidos</span>
              <ListOrdered className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {data?.stats.totalOrderItems ?? 0}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">tabela: order_items</span>
          </div>

          <div
            onClick={() => setActiveTab('sessions')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              activeTab === 'sessions'
                ? 'bg-stone-800 border-rose-500/80 ring-1 ring-rose-500/50'
                : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Sessões</span>
              <Cpu className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {data?.stats.totalSessions ?? 0}
            </div>
            <span className="text-[11px] text-stone-400 block mt-0.5">tabela: sessions</span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGAÇÃO DE ABAS & BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#b85042] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Produtos ({data?.stats.totalProducts ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#b85042] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Usuários ({data?.stats.totalUsers ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#b85042] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Pedidos ({data?.stats.totalOrders ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('order_items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'order_items'
                ? 'bg-[#b85042] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Itens ({data?.stats.totalOrderItems ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'bg-[#b85042] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Sessões ({data?.stats.totalSessions ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Raw JSON
          </button>
        </div>

        {activeTab !== 'json' && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Filtrar ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* Destaque LGPD e Cron se estiver na aba de Usuários */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-sky-950">
                Conformidade com a LGPD no Banco de Dados:
              </strong>
              Observe que a tabela <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">users</code> não armazena CPF em texto claro. O campo <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">cpf_hash</code> armazena o SHA-256 determinístico com pepper para pesquisas exatas, e o campo <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">cpf_encrypted</code> contém a cifra AES-256-GCM para faturamento fiscal.
            </div>
          </div>

          <div className="bg-stone-900 text-stone-200 p-3 rounded-xl text-xs font-mono border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-400 font-bold">Cron na VM (a cada 5m):</span>
              <code className="text-stone-300 bg-stone-800 px-2 py-0.5 rounded text-[11px]">
                */5 * * * * curl -s &quot;http://127.0.0.1:8080/api/cron/generate-user?key=senha123&quot;
              </code>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTEÚDO DAS TABELAS (EXATAMENTE COMO ESTÁ NO BANCO) */}
      {activeTab === 'json' ? (
        <div className="bg-stone-900 text-stone-200 p-5 rounded-2xl border border-stone-800 shadow">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
            <span className="text-xs font-mono text-stone-400">
              Endpoint: GET /api/admin/database
            </span>
            <button
              onClick={handleCopyJson}
              className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
          </div>
          <pre className="text-xs font-mono overflow-auto max-h-[550px] p-2 leading-relaxed scrollbar-thin">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                {activeTab === 'products' && (
                  <tr>
                    <th className="p-3 font-bold text-stone-700">id</th>
                    <th className="p-3 font-bold text-stone-700">name</th>
                    <th className="p-3 font-bold text-stone-700">category</th>
                    <th className="p-3 font-bold text-stone-700">price</th>
                    <th className="p-3 font-bold text-stone-700">stock</th>
                    <th className="p-3 font-bold text-stone-700">description</th>
                    <th className="p-3 font-bold text-stone-700">created_at</th>
                  </tr>
                )}

                {activeTab === 'users' && (
                  <tr>
                    <th className="p-3 font-bold text-stone-700">id</th>
                    <th className="p-3 font-bold text-stone-700">name</th>
                    <th className="p-3 font-bold text-stone-700">email</th>
                    <th className="p-3 font-bold text-stone-700">role</th>
                    <th className="p-3 font-bold text-stone-700">city / state</th>
                    <th className="p-3 font-bold text-sky-900">cpf_hash (SHA-256)</th>
                    <th className="p-3 font-bold text-sky-900">cpf_encrypted (AES-GCM)</th>
                    <th className="p-3 font-bold text-stone-700">created_at</th>
                  </tr>
                )}

                {activeTab === 'orders' && (
                  <tr>
                    <th className="p-3 font-bold text-stone-700">id</th>
                    <th className="p-3 font-bold text-stone-700">user_id</th>
                    <th className="p-3 font-bold text-stone-700">total</th>
                    <th className="p-3 font-bold text-stone-700">status</th>
                    <th className="p-3 font-bold text-stone-700">payment_method</th>
                    <th className="p-3 font-bold text-stone-700">shipping_address</th>
                    <th className="p-3 font-bold text-stone-700">created_at</th>
                  </tr>
                )}

                {activeTab === 'order_items' && (
                  <tr>
                    <th className="p-3 font-bold text-stone-700">id</th>
                    <th className="p-3 font-bold text-stone-700">order_id</th>
                    <th className="p-3 font-bold text-stone-700">product_id</th>
                    <th className="p-3 font-bold text-stone-700">product_name</th>
                    <th className="p-3 font-bold text-stone-700">quantity</th>
                    <th className="p-3 font-bold text-stone-700">unit_price</th>
                  </tr>
                )}

                {activeTab === 'sessions' && (
                  <tr>
                    <th className="p-3 font-bold text-stone-700">id (token)</th>
                    <th className="p-3 font-bold text-stone-700">user_id</th>
                    <th className="p-3 font-bold text-stone-700">expires_at</th>
                    <th className="p-3 font-bold text-stone-700">created_at</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-stone-100">
                {currentTableData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      Nenhum registro encontrado nesta tabela.
                    </td>
                  </tr>
                ) : (
                  currentTableData.map((row: any, idx: number) => (
                    <tr key={row.id || idx} className="hover:bg-amber-50/40 transition">
                      {activeTab === 'products' && (
                        <>
                          <td className="p-3 font-mono text-stone-500 font-semibold">{row.id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px]">
                              {row.category}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-stone-900 font-mono">
                            R$ {Number(row.price || 0).toFixed(2)}
                          </td>
                          <td className="p-3 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              row.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {row.stock} un
                            </span>
                          </td>
                          <td className="p-3 text-stone-500 max-w-[200px] truncate" title={row.description}>
                            {row.description}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {formatDateTime(row.created_at)}
                          </td>
                        </>
                      )}

                      {activeTab === 'users' && (
                        <>
                          <td className="p-3 font-mono text-stone-400 text-[11px]">{row.id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.name}</td>
                          <td className="p-3 text-stone-600">{row.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-700'
                            }`}>
                              {row.role}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600">{row.city} / {row.state}</td>
                          <td className="p-3 font-mono text-[10px] text-stone-500 max-w-[140px] truncate" title={row.cpf_hash}>
                            {row.cpf_hash}
                          </td>
                          <td className="p-3 font-mono text-[10px] text-stone-500 max-w-[140px] truncate" title={row.cpf_encrypted}>
                            {row.cpf_encrypted}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {formatDateTime(row.created_at)}
                          </td>
                        </>
                      )}

                      {activeTab === 'orders' && (
                        <>
                          <td className="p-3 font-mono text-stone-800 font-bold">{row.id}</td>
                          <td className="p-3 font-mono text-stone-400 text-[11px]">{row.user_id}</td>
                          <td className="p-3 font-bold text-stone-900 font-mono">
                            R$ {Number(row.total || 0).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              row.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 uppercase text-stone-600 font-medium">{row.payment_method}</td>
                          <td className="p-3 text-stone-500 max-w-[220px] truncate" title={row.shipping_address}>
                            {row.shipping_address}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {formatDateTime(row.created_at)}
                          </td>
                        </>
                      )}

                      {activeTab === 'order_items' && (
                        <>
                          <td className="p-3 font-mono text-stone-500">{row.id}</td>
                          <td className="p-3 font-mono text-stone-700 font-semibold">{row.order_id}</td>
                          <td className="p-3 font-mono text-stone-400 text-[11px]">{row.product_id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.product_name || '-'}</td>
                          <td className="p-3 font-mono font-semibold">{row.quantity}</td>
                          <td className="p-3 font-bold text-stone-800 font-mono">
                            R$ {Number(row.unit_price || 0).toFixed(2)}
                          </td>
                        </>
                      )}

                      {activeTab === 'sessions' && (
                        <>
                          <td className="p-3 font-mono text-stone-500 text-[11px] max-w-[180px] truncate" title={row.id}>
                            {row.id}
                          </td>
                          <td className="p-3 font-mono text-stone-600">{row.user_id}</td>
                          <td className="p-3 text-stone-600 font-mono text-[11px] whitespace-nowrap">
                            {formatDateTime(row.expires_at)}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {formatDateTime(row.created_at)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
