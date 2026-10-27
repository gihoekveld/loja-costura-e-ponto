'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Database,
  Lock,
  KeyRound,
  ShieldCheck,
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
  Eye,
  EyeOff,
  Terminal,
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

function ProfessorInspectorContent() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DatabaseData | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders' | 'order_items' | 'sessions' | 'json'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDatabase = async (pwd: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/professor?senha=${encodeURIComponent(pwd)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Senha incorreta ou erro ao consultar banco.');
      }

      setData(json);
      setAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar no banco de dados.');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlPwd = searchParams.get('senha') || searchParams.get('password');
    if (urlPwd) {
      setPassword(urlPwd);
      fetchDatabase(urlPwd);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }
    fetchDatabase(password.trim());
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

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-xl">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Database className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-center text-stone-900 mb-1">
          Inspeção do Banco de Dados
        </h1>
        <p className="text-center text-sm text-stone-500 mb-6">
          Área de avaliação de dados da loja <strong className="text-stone-700">Costura & Ponto</strong>.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-4 py-2.5 pr-11 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm bg-stone-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              Dica: A senha padrão configurada é <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-mono">senha123</code>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm transition shadow hover:shadow-md disabled:opacity-50"
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

        <div className="mt-8 pt-5 border-t border-stone-100 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Protegido via variável de ambiente <code className="font-mono text-stone-700">PROFESSOR_PASSWORD</code>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl shadow-lg border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PostgreSQL 16 Ativo
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 font-mono border border-stone-700">
                DB: {data?.database}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 font-mono border border-stone-700">
                Porta: {data?.port}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2 text-white">
              Painel de Inspeção do Banco de Dados
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">
              Visualização segura de leitura para avaliação acadêmica. Última consulta: {new Date(data?.timestamp || '').toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDatabase(password)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition border border-stone-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dados
            </button>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Exportar JSON'}
            </button>
            <button
              onClick={() => {
                setAuthenticated(false);
                setPassword('');
              }}
              className="px-3.5 py-2 text-stone-400 hover:text-stone-200 text-xs transition"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          <div className="bg-stone-800/70 border border-stone-700/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Produtos</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.stats.totalProducts ?? 0}
            </div>
          </div>
          <div className="bg-stone-800/70 border border-stone-700/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Usuários</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.stats.totalUsers ?? 0}
            </div>
          </div>
          <div className="bg-stone-800/70 border border-stone-700/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Pedidos</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.stats.totalOrders ?? 0}
            </div>
          </div>
          <div className="bg-stone-800/70 border border-stone-700/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Itens Pedidos</span>
              <ListOrdered className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.stats.totalOrderItems ?? 0}
            </div>
          </div>
          <div className="bg-stone-800/70 border border-stone-700/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Sessões</span>
              <Cpu className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.stats.totalSessions ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'products'
                ? 'bg-stone-900 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Produtos ({data?.stats.totalProducts})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'users'
                ? 'bg-stone-900 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Usuários & LGPD ({data?.stats.totalUsers})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Pedidos ({data?.stats.totalOrders})
          </button>

          <button
            onClick={() => setActiveTab('order_items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'order_items'
                ? 'bg-stone-900 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Itens ({data?.stats.totalOrderItems})
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'sessions'
                ? 'bg-stone-900 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Sessões ({data?.stats.totalSessions})
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'json'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            API / JSON
          </button>
        </div>

        {activeTab !== 'json' && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* Special Security / LGPD Notice if on users tab */}
      {activeTab === 'users' && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-sky-950">
              Conformidade LGPD Demonstrada no Banco de Dados:
            </strong>
            Note que nenhum CPF está em texto claro. O campo <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-950 font-mono">cpf_hash</code> armazena hash determinístico (SHA-256 + Pepper) para buscas exatas, e o campo <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-950 font-mono">cpf_encrypted</code> contém a criptografia reversível militar (AES-256-GCM) para uso estrito de faturamento.
          </div>
        </div>
      )}

      {/* Table Content */}
      {activeTab === 'json' ? (
        <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl border border-stone-800 shadow">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
            <span className="text-xs font-mono text-stone-400">
              Endpoint: GET /api/professor?senha=...
            </span>
            <button
              onClick={handleCopyJson}
              className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copiado!' : 'Copiar JSON Bruto'}
            </button>
          </div>
          <pre className="text-xs font-mono overflow-auto max-h-[550px] p-2 leading-relaxed scrollbar-thin">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                {activeTab === 'products' && (
                  <tr>
                    <th className="p-3 font-semibold text-stone-700">ID</th>
                    <th className="p-3 font-semibold text-stone-700">Nome</th>
                    <th className="p-3 font-semibold text-stone-700">Categoria</th>
                    <th className="p-3 font-semibold text-stone-700">Preço</th>
                    <th className="p-3 font-semibold text-stone-700">Estoque</th>
                    <th className="p-3 font-semibold text-stone-700">Cadastrado em</th>
                  </tr>
                )}
                {activeTab === 'users' && (
                  <tr>
                    <th className="p-3 font-semibold text-stone-700">ID</th>
                    <th className="p-3 font-semibold text-stone-700">Nome</th>
                    <th className="p-3 font-semibold text-stone-700">E-mail</th>
                    <th className="p-3 font-semibold text-stone-700">Role</th>
                    <th className="p-3 font-semibold text-stone-700">Cidade / UF</th>
                    <th className="p-3 font-semibold text-sky-800">CPF Hash (SHA-256)</th>
                    <th className="p-3 font-semibold text-sky-800">CPF Encrypted (AES-GCM)</th>
                  </tr>
                )}
                {activeTab === 'orders' && (
                  <tr>
                    <th className="p-3 font-semibold text-stone-700">ID Pedido</th>
                    <th className="p-3 font-semibold text-stone-700">ID Usuário</th>
                    <th className="p-3 font-semibold text-stone-700">Total</th>
                    <th className="p-3 font-semibold text-stone-700">Status</th>
                    <th className="p-3 font-semibold text-stone-700">Pagamento</th>
                    <th className="p-3 font-semibold text-stone-700">Endereço de Entrega</th>
                    <th className="p-3 font-semibold text-stone-700">Data</th>
                  </tr>
                )}
                {activeTab === 'order_items' && (
                  <tr>
                    <th className="p-3 font-semibold text-stone-700">ID Item</th>
                    <th className="p-3 font-semibold text-stone-700">ID Pedido</th>
                    <th className="p-3 font-semibold text-stone-700">Produto</th>
                    <th className="p-3 font-semibold text-stone-700">Qtd</th>
                    <th className="p-3 font-semibold text-stone-700">Preço Unitário</th>
                  </tr>
                )}
                {activeTab === 'sessions' && (
                  <tr>
                    <th className="p-3 font-semibold text-stone-700">Token ID</th>
                    <th className="p-3 font-semibold text-stone-700">ID Usuário</th>
                    <th className="p-3 font-semibold text-stone-700">Expira em</th>
                    <th className="p-3 font-semibold text-stone-700">Criado em</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentTableData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Nenhum registro encontrado nesta tabela.
                    </td>
                  </tr>
                ) : (
                  currentTableData.map((row: any, idx: number) => (
                    <tr key={row.id || idx} className="hover:bg-amber-50/40 transition">
                      {activeTab === 'products' && (
                        <>
                          <td className="p-3 font-mono text-stone-500">{row.id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                              {row.category}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-stone-900">
                            R$ {Number(row.price || 0).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-mono ${
                              row.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {row.stock} un
                            </span>
                          </td>
                          <td className="p-3 text-stone-500">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                          </td>
                        </>
                      )}

                      {activeTab === 'users' && (
                        <>
                          <td className="p-3 font-mono text-stone-400 text-[11px]">{row.id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.name}</td>
                          <td className="p-3 text-stone-600">{row.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
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
                        </>
                      )}

                      {activeTab === 'orders' && (
                        <>
                          <td className="p-3 font-mono text-stone-800 font-semibold">{row.id}</td>
                          <td className="p-3 font-mono text-stone-400 text-[11px]">{row.user_id}</td>
                          <td className="p-3 font-bold text-stone-900">
                            R$ {Number(row.total || 0).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase ${
                              row.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 uppercase text-stone-600 font-medium">{row.payment_method}</td>
                          <td className="p-3 text-stone-500 max-w-[220px] truncate" title={row.shipping_address}>
                            {row.shipping_address}
                          </td>
                          <td className="p-3 text-stone-500">
                            {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
                          </td>
                        </>
                      )}

                      {activeTab === 'order_items' && (
                        <>
                          <td className="p-3 font-mono text-stone-500">{row.id}</td>
                          <td className="p-3 font-mono text-stone-700 font-semibold">{row.order_id}</td>
                          <td className="p-3 font-medium text-stone-900">{row.product_name || row.product_id}</td>
                          <td className="p-3 font-mono">{row.quantity}</td>
                          <td className="p-3 font-semibold text-stone-800">
                            R$ {Number(row.unit_price || 0).toFixed(2)}
                          </td>
                        </>
                      )}

                      {activeTab === 'sessions' && (
                        <>
                          <td className="p-3 font-mono text-stone-400 text-[11px] max-w-[180px] truncate" title={row.id}>
                            {row.id}
                          </td>
                          <td className="p-3 font-mono text-stone-600">{row.user_id}</td>
                          <td className="p-3 text-stone-600">
                            {row.expires_at ? new Date(Number(row.expires_at)).toLocaleString() : '-'}
                          </td>
                          <td className="p-3 text-stone-500">
                            {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
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

      {/* Terminal Curl / Node script instructions for professor */}
      <div className="bg-stone-100 border border-stone-200 p-4 rounded-2xl text-xs text-stone-700">
        <h4 className="font-semibold text-stone-900 mb-1.5 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-stone-600" />
          Como o professor pode testar via Terminal / Curl:
        </h4>
        <pre className="bg-stone-900 text-stone-200 p-3 rounded-xl overflow-x-auto font-mono text-[11px]">
          curl &quot;http://10.81.211.15:8080/api/professor?senha=senha123&quot;
        </pre>
      </div>
    </div>
  );
}

export default function ProfessorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Carregando painel...</div>}>
      <ProfessorInspectorContent />
    </Suspense>
  );
}
