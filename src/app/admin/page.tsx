'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  FileText, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Printer, 
  X, 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { Product } from '@/types';

interface Customer {
  id: string;
  name: string;
  email: string;
  cpf_hash?: string;
  cpf_encrypted?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  role?: string;
  created_at?: string;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items?: any[];
}

interface NfeData {
  accessKey: string;
  naturezaOperacao: string;
  emitente: {
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual: string;
    endereco: string;
    telefone: string;
  };
  destinatario: {
    nome: string;
    cpfDescriptografado: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone: string;
  };
  pedidos: any[];
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'orders'>('overview');

  // Dados
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca e filtros de Produtos
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Busca por CPF em Clientes
  const [searchCpf, setSearchCpf] = useState('');
  const [searchResult, setSearchResult] = useState<Customer | null | undefined>(undefined);
  const [searchHash, setSearchHash] = useState<string | null>(null);
  const [searchingCpf, setSearchingCpf] = useState(false);

  // Estados de Descriptografia e Nota Fiscal
  const [decryptedCpfMap, setDecryptedCpfMap] = useState<Record<string, string>>({});
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [selectedNfe, setSelectedNfe] = useState<NfeData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Login de administrador (caso não esteja autenticado)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchSession = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [prodRes, custRes, ordRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/orders'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData.customers || []);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      setError('Erro ao carregar dados do painel administrativo.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadAllData();
    }
  }, [currentUser]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        setError(data.error || 'Credenciais de administrador incorretas.');
      }
    } catch (e) {
      setError('Erro de conexão ao realizar login administrativo.');
    } finally {
      setLoggingIn(false);
    }
  };

  // ----------------------------------------------------
  // GESTÃO DE PRODUTOS
  // ----------------------------------------------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingProduct(true);
    setError(null);

    try {
      const isNew = !editingProduct.id;
      const url = '/api/admin/products';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar produto.');
        setSavingProduct(false);
        return;
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadAllData();
    } catch (e) {
      setError('Erro de comunicação ao salvar produto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o produto "${name}" do catálogo?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Falha ao excluir produto.');
      }
    } catch (e) {
      alert('Erro de conexão ao excluir produto.');
    }
  };

  // ----------------------------------------------------
  // GESTÃO DE PEDIDOS
  // ----------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'paid' | 'cancelled') => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      } else {
        const data = await res.json();
        alert(data.error || 'Falha ao atualizar pedido.');
      }
    } catch (e) {
      alert('Erro ao atualizar status do pedido.');
    }
  };

  // ----------------------------------------------------
  // GESTÃO DE CLIENTES & CPF
  // ----------------------------------------------------
  const handleSearchCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCpf.trim()) {
      setSearchResult(undefined);
      setSearchHash(null);
      return;
    }

    setSearchingCpf(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers?cpf=${encodeURIComponent(searchCpf)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data.customer);
        setSearchHash(data.computedHash);
      } else {
        setError(data.error || 'Erro ao realizar busca por CPF.');
      }
    } catch (err) {
      setError('Erro de conexão ao buscar cliente.');
    } finally {
      setSearchingCpf(false);
    }
  };

  const handleDecrypt = async (customer: Customer, openNfeModal = false) => {
    setDecryptingId(customer.id);
    try {
      const res = await fetch('/api/admin/decrypt-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: customer.id, encryptedCpf: customer.cpf_encrypted }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDecryptedCpfMap((prev) => ({ ...prev, [customer.id]: data.decryptedCpf }));
        if (openNfeModal && data.nfePreview) {
          setSelectedNfe(data.nfePreview);
        }
      } else {
        alert(data.error || 'Falha na descriptografia.');
      }
    } catch (e) {
      alert('Erro de comunicação ao descriptografar.');
    } finally {
      setDecryptingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // SE NÃO ESTIVER AUTENTICADO COMO ADMIN
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#b85042] animate-spin mx-auto" />
        <p className="text-stone-500 text-xs">Verificando credenciais de acesso...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">Acesso Restrito: Painel do Lojista</h1>
          <p className="text-xs text-stone-600">
            Esta área é restrita a administradores para controle de produtos, pedidos e dados fiscais de clientes.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-700">E-mail do Administrador</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@exemplo.com.br"
              className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-700">Senha de Acesso</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-xs rounded-xl shadow-md shadow-[#b85042]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loggingIn ? 'Autenticando...' : 'Acessar Painel do Lojista'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs text-stone-500 hover:text-[#b85042] flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a Loja Virtual
          </Link>
        </div>
      </div>
    );
  }

  // Cálculos para o Overview
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 20);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Filtragem de produtos por busca
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b85042]" />
            <span>Sessão Administrativa Ativa • {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Painel de Gestão Costura & Ponto
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Controle integral do e-commerce: catálogo de produtos, pedidos da loja e gestão segura de clientes com duplo armazenamento de CPF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors shadow-xs"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Ir para a Loja
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#b85042] text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'products'
              ? 'bg-[#b85042] text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Gerenciar Produtos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#b85042] text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Gerenciar Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'customers'
              ? 'bg-[#b85042] text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes & Duplo CPF ({customers.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: VISÃO GERAL (OVERVIEW) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Pago</span>
                <div className="p-2 bg-emerald-50 text-[#437a5b] rounded-xl border border-emerald-200">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 font-mono">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[11px] text-[#437a5b] font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Pedidos confirmados com sucesso
              </span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total de Pedidos</span>
                <div className="p-2 bg-[#f7ece8] text-[#b85042] rounded-xl border border-[#f1d6ce]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 font-mono">
                {orders.length}
              </div>
              <span className="text-[11px] text-stone-500">
                {orders.filter((o) => o.status === 'paid').length} aprovados • {orders.filter((o) => o.status === 'pending').length} aguardando
              </span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Produtos Cadastrados</span>
                <div className="p-2 bg-stone-100 text-stone-700 rounded-xl border border-stone-200">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 font-mono">
                {products.length}
              </div>
              <span className="text-[11px] text-stone-500">
                {products.reduce((acc, p) => acc + p.stock, 0)} unidades em estoque físico
              </span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Clientes Cadastrados</span>
                <div className="p-2 bg-amber-50 text-[#c67d26] rounded-xl border border-amber-200">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 font-mono">
                {customers.length}
              </div>
              <span className="text-[11px] text-stone-500">
                100% com CPF criptografado por AES-256
              </span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#c67d26] font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Alertas de Reposição de Estoque no Ateliê
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-white border border-amber-200 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-stone-900 block truncate max-w-[200px]">{p.name}</span>
                      <span className="text-[11px] text-stone-500">{p.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-[#c67d26] font-bold font-mono">
                      {p.stock} un.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setEditingProduct({ name: '', description: '', price: 0, stock: 10, category: 'Aparelhos & Guias', image_url: '' });
                setIsProductModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#b85042] text-left space-y-2 shadow-xs transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-[#f7ece8] text-[#b85042] w-fit group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Adicionar Novo Produto</h3>
              <p className="text-xs text-stone-500">Cadastrar novo aparelho, linha ou calcador no catálogo público.</p>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#b85042] text-left space-y-2 shadow-xs transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#437a5b] w-fit group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Emitir Nota Fiscal (DANFE)</h3>
              <p className="text-xs text-stone-500">Descriptografar CPF de cliente com AES-256 e gerar espelho de NF-e.</p>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#b85042] text-left space-y-2 shadow-xs transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-amber-50 text-[#c67d26] w-fit group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Gerenciar Pedidos Recentes</h3>
              <p className="text-xs text-stone-500">Confirmar recebimentos de Pix ou atualizar status de entrega.</p>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: GERENCIAR PRODUTOS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto por nome ou categoria..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
              />
            </div>

            <button
              onClick={() => {
                setEditingProduct({ name: '', description: '', price: 0, stock: 10, category: 'Aparelhos & Guias', image_url: '' });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-stone-700 divide-y divide-stone-200">
              <thead className="bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Produto</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5 text-right">Preço</th>
                  <th className="p-3.5 text-center">Estoque</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-mono">Foto</div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block line-clamp-1">{p.name}</span>
                          <span className="text-[11px] text-stone-400 font-mono">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#f7ece8] text-[#b85042] font-semibold text-[10px] border border-[#f1d6ce]">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                      R$ {Number(p.price).toFixed(2).replace('.', ',')}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          p.stock > 20
                            ? 'bg-emerald-50 text-[#437a5b] border border-emerald-200'
                            : p.stock > 0
                            ? 'bg-amber-50 text-[#c67d26] border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.stock > 0 ? `${p.stock} un.` : 'Esgotado'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...p });
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Editar Produto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: GERENCIAR PEDIDOS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Histórico de Pedidos da Loja</h3>
                <p className="text-xs text-stone-500">Atualize o status dos pedidos e acompanhe pagamentos efetuados.</p>
              </div>
            </div>

            <table className="w-full text-left text-xs text-stone-700 divide-y divide-stone-200">
              <thead className="bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Pedido ID</th>
                  <th className="p-3.5">Data</th>
                  <th className="p-3.5">Endereço de Entrega</th>
                  <th className="p-3.5">Pagamento</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-stone-900">
                      {o.id}
                    </td>

                    <td className="p-3.5 text-stone-500 text-[11px]">
                      {new Date(o.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-3.5 text-stone-600 max-w-[240px] truncate" title={o.shipping_address}>
                      {o.shipping_address}
                    </td>

                    <td className="p-3.5 font-mono capitalize text-[11px]">
                      {o.payment_method === 'pix' ? 'Pix à Vista' : o.payment_method.replace(/_/g, ' ')}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                      R$ {Number(o.total).toFixed(2).replace('.', ',')}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'paid'
                            ? 'bg-emerald-50 text-[#437a5b] border border-emerald-200'
                            : o.status === 'pending'
                            ? 'bg-amber-50 text-[#c67d26] border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.status === 'paid' ? 'Pago' : o.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-stone-300 bg-white text-stone-800 text-[11px] font-medium focus:outline-none focus:border-[#b85042]"
                      >
                        <option value="paid">Marcar como Pago</option>
                        <option value="pending">Marcar como Pendente</option>
                        <option value="cancelled">Marcar como Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CLIENTES & DUPLO CPF */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Security Architecture Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-[#b85042] font-bold text-xs uppercase tracking-wider">
                <Key className="w-4 h-4" /> 1. Hash Determinístico de CPF (Blind Indexing)
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Armazenado na coluna <code className="text-[#b85042] bg-[#f7ece8] px-1 py-0.5 rounded font-mono font-semibold">cpf_hash</code> com índice único B-Tree no SQLite/D1. O servidor aplica SHA-256 com salt/pepper secreto aos 11 dígitos, permitindo busca instantânea por correspondência exata (<code className="text-[#437a5b] font-mono font-semibold">WHERE cpf_hash = ?</code>) sem nunca expor o CPF em texto plano no banco de dados.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-[#437a5b] font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> 2. Criptografia Reversível AES-256-GCM
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Armazenado na coluna <code className="text-[#437a5b] bg-emerald-50 px-1 py-0.5 rounded font-mono font-semibold">cpf_encrypted</code> no formato <code className="text-stone-500 font-mono text-[11px]">aes-gcm:IV:CIPHER</code>. Apenas administradores autenticados podem solicitar a descriptografia em tempo de execução para emissão da DANFE / NF-e eletrônica.
              </p>
            </div>
          </div>

          {/* Search by CPF */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#b85042]" />
                Busca Exata por CPF (Simulação de Consulta por Hash)
              </h2>
              <span className="text-[11px] text-stone-500">Ex: 234.567.890-12 ou 111.222.333-44</span>
            </div>

            <form onSubmit={handleSearchCpf} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchCpf}
                  onChange={(e) => setSearchCpf(e.target.value)}
                  placeholder="Digite o CPF para consultar (ex: 234.567.890-12)"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white placeholder-stone-400 font-mono transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={searchingCpf}
                className="px-5 py-2.5 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
              >
                {searchingCpf ? 'Calculando Hash...' : 'Buscar no Banco'}
              </button>
              {searchResult !== undefined && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchResult(undefined);
                    setSearchCpf('');
                    setSearchHash(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Limpar Busca
                </button>
              )}
            </form>

            {/* Search Result Box */}
            {searchHash && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-stone-600 font-mono">
                    Hash Calculado da Busca: <code className="text-[#b85042] break-all font-bold">{searchHash}</code>
                  </span>
                  <button
                    onClick={() => copyToClipboard(searchHash, 'search_hash')}
                    className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 shrink-0 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey === 'search_hash' ? 'Copiado!' : 'Copiar Hash'}
                  </button>
                </div>

                {searchResult ? (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#437a5b]" />
                        <span className="font-bold text-[#437a5b] text-xs">Cliente Encontrado no Banco D1!</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-[#437a5b] border border-emerald-300 font-bold">
                        Correspondência Exata
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[11px]">Nome / Razão:</span>
                        <span className="font-bold text-stone-900">{searchResult.name}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[11px]">E-mail & Telefone:</span>
                        <span className="text-stone-800">{searchResult.email} • {searchResult.phone || 'S/N'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[11px]">Endereço de Entrega:</span>
                        <span className="text-stone-800">
                          {searchResult.street}, {searchResult.number} - {searchResult.neighborhood}, {searchResult.city}/{searchResult.state} (CEP {searchResult.cep})
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      {decryptedCpfMap[searchResult.id] ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-[#437a5b] font-mono text-xs font-bold flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5" /> CPF: {decryptedCpfMap[searchResult.id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDecrypt(searchResult)}
                          disabled={decryptingId === searchResult.id}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#b85042]" />
                          {decryptingId === searchResult.id ? 'Descriptografando...' : 'Descriptografar CPF'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDecrypt(searchResult, true)}
                        className="px-3 py-1.5 rounded-lg bg-[#b85042] hover:bg-[#a33f32] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Emitir / Visualizar DANFE (NF-e)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Nenhum cliente encontrado no D1 com o hash correspondente a este CPF.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customers List Table */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#b85042]" />
                  Lista de Clientes Cadastrados ({customers.length})
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Visualização gerencial das credenciais, hashes criptográficos e cifras AES gravadas.
                </p>
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-left text-xs text-stone-700 divide-y divide-stone-200">
                <thead className="bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Cliente / Contato</th>
                    <th className="p-3">Endereço de Entrega (CEP)</th>
                    <th className="p-3">Hash Determinístico (Índice D1)</th>
                    <th className="p-3">Cifra AES-256-GCM</th>
                    <th className="p-3 text-right">Ações Fiscais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3 font-medium text-stone-900">
                        <div>
                          <span className="font-bold">{c.name}</span>
                          {c.role === 'admin' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[#f7ece8] text-[#b85042] font-mono font-bold uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {c.email} • {c.phone || '(11) 98765-4321'}
                        </div>
                      </td>

                      <td className="p-3 text-stone-700">
                        <div className="line-clamp-2 max-w-[220px]">
                          {c.street ? `${c.street}, ${c.number}${c.complement ? ' ' + c.complement : ''}` : 'Endereço não informado'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {c.neighborhood || 'Bairro'} - {c.city || 'São Paulo'}/{c.state || 'SP'} (CEP {c.cep || '00000-000'})
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[130px] truncate text-[#b85042] font-medium" title={c.cpf_hash}>
                            {c.cpf_hash || 'Sem hash'}
                          </span>
                          {c.cpf_hash && (
                            <button
                              onClick={() => copyToClipboard(c.cpf_hash!, `hash_${c.id}`)}
                              className="p-1 hover:text-stone-900 text-stone-400 transition-colors"
                              title="Copiar Hash Completo"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {decryptedCpfMap[c.id] ? (
                          <span className="px-2 py-1 rounded bg-emerald-50 text-[#437a5b] font-bold border border-emerald-200 flex items-center gap-1 w-fit">
                            <Unlock className="w-3 h-3" /> {decryptedCpfMap[c.id]}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="max-w-[130px] truncate text-stone-500" title={c.cpf_encrypted}>
                              {c.cpf_encrypted ? c.cpf_encrypted.slice(0, 20) + '...' : 'Sem cifra'}
                            </span>
                            {c.cpf_encrypted && (
                              <button
                                onClick={() => handleDecrypt(c)}
                                disabled={decryptingId === c.id}
                                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-sans font-semibold border border-stone-200 transition-colors"
                                title="Descriptografar via AES-256-GCM"
                              >
                                {decryptingId === c.id ? 'Decript...' : 'Descriptografar'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDecrypt(c, true)}
                          className="px-3 py-1.5 rounded-lg bg-[#b85042] hover:bg-[#a33f32] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Gerar NF-e</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE PRODUTO */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative border border-stone-200">
            <button
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 transition-colors"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Insira as especificações do item para disponibilizar na loja virtual.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ex: Aparelho de Viés Dobra Simples 35mm"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700">Categoria</label>
                  <select
                    value={editingProduct.category || 'Aparelhos & Guias'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
                  >
                    <option value="Aparelhos & Guias">Aparelhos & Guias</option>
                    <option value="Linhas & Fios">Linhas & Fios</option>
                    <option value="Calcadores & Sapatilhas">Calcadores & Sapatilhas</option>
                    <option value="Corte & Medição">Corte & Medição</option>
                    <option value="Agulhas & Bobinas">Agulhas & Bobinas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Quantidade em Estoque</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct.stock ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">URL da Imagem</label>
                <input
                  type="url"
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Descrição do Produto</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Detalhes técnicos, compatibilidade com máquinas de costura e acabamentos."
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#b85042] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2.5 bg-[#b85042] hover:bg-[#a33f32] text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {savingProduct ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DANFE / NF-E PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedNfe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative border border-stone-200">
            <button
              onClick={() => setSelectedNfe(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 transition-colors"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>

            {/* DANFE Header */}
            <div className="border-2 border-stone-800 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Identificação do Emitente</span>
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {selectedNfe.emitente.razaoSocial}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">{selectedNfe.emitente.endereco}</p>
                  <p className="text-xs text-stone-600">Telefone: {selectedNfe.emitente.telefone}</p>
                  <p className="text-xs font-mono font-semibold text-stone-800 mt-1">
                    CNPJ: {selectedNfe.emitente.cnpj} | IE: {selectedNfe.emitente.inscricaoEstadual}
                  </p>
                </div>

                <div className="md:col-span-3 text-center border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0">
                  <span className="text-xs font-bold uppercase block text-stone-700">DANFE</span>
                  <span className="text-[10px] text-stone-500 block">Documento Auxiliar da Nota Fiscal Eletrônica</span>
                  <div className="my-1 py-1 px-3 bg-stone-100 rounded text-xs font-bold inline-block">
                    0 - ENTRADA<br />1 - SAÍDA: <span className="text-[#437a5b]">1</span>
                  </div>
                  <span className="text-xs font-mono font-bold block mt-1">Nº 000.048.219</span>
                  <span className="text-[10px] text-stone-500">SÉRIE 1</span>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Chave de Acesso</span>
                  <div className="h-9 bg-stone-900 flex items-center justify-center text-white font-mono text-[10px] tracking-widest rounded px-2">
                    ||| | |||| | ||||| ||| |||| | |||| |||
                  </div>
                  <span className="text-[10px] font-mono text-stone-800 block text-center break-all font-semibold mt-1">
                    {selectedNfe.accessKey}
                  </span>
                  <span className="text-[9px] text-stone-500 block text-center">
                    Consulta de autenticidade no portal nacional da NF-e
                  </span>
                </div>
              </div>
            </div>

            {/* Destinatário */}
            <div className="border border-stone-300 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block border-b border-stone-200 pb-1">
                Destinatário / Remetente
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px]">Nome / Razão Social:</span>
                  <span className="font-bold text-stone-900">{selectedNfe.destinatario.nome}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">CPF (Descriptografado com AES-256):</span>
                  <span className="font-bold text-[#437a5b] font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {selectedNfe.destinatario.cpfDescriptografado}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Data de Emissão:</span>
                  <span className="font-semibold text-stone-800">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-500 block text-[11px]">Endereço:</span>
                  <span className="text-stone-800">{selectedNfe.destinatario.endereco} - {selectedNfe.destinatario.bairro}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Município / UF / CEP:</span>
                  <span className="text-stone-800">
                    {selectedNfe.destinatario.cidade}/{selectedNfe.destinatario.uf} - CEP {selectedNfe.destinatario.cep}
                  </span>
                </div>
              </div>
            </div>

            {/* Itens */}
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <div className="bg-stone-50 p-2.5 text-[11px] font-bold text-stone-700 uppercase tracking-wider border-b border-stone-300">
                Dados dos Produtos / Serviços
              </div>
              <table className="w-full text-left text-xs divide-y divide-stone-200">
                <thead className="bg-stone-50/50 text-[10px] text-stone-500 uppercase">
                  <tr>
                    <th className="p-2">Cód. / NCM</th>
                    <th className="p-2">Descrição do Produto</th>
                    <th className="p-2 text-center">CFOP</th>
                    <th className="p-2 text-center">Qtd</th>
                    <th className="p-2 text-right">Vlr. Unitário</th>
                    <th className="p-2 text-right">Vlr. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2">8452.90.20</td>
                    <td className="p-2 font-sans font-medium text-stone-800">
                      Aparelho de Viés Dobra Dupla Industrial (Regulável)
                    </td>
                    <td className="p-2 text-center">5.102</td>
                    <td className="p-2 text-center">1</td>
                    <td className="p-2 text-right">R$ 68,90</td>
                    <td className="p-2 text-right font-bold text-stone-900">R$ 68,90</td>
                  </tr>
                  <tr>
                    <td className="p-2">5402.61.00</td>
                    <td className="p-2 font-sans font-medium text-stone-800">
                      Fio de Overloque Texturizado 100g 100% Poliamida (Kit 4 Cones)
                    </td>
                    <td className="p-2 text-center">5.102</td>
                    <td className="p-2 text-center">1</td>
                    <td className="p-2 text-right">R$ 54,90</td>
                    <td className="p-2 text-right font-bold text-stone-900">R$ 54,90</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totais & Dados Fiscais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-stone-300 rounded-xl p-3 text-xs bg-stone-50 font-mono">
              <div>
                <span className="text-[10px] text-stone-500 block font-sans">Base Cálculo ICMS</span>
                <span className="font-bold text-stone-800">R$ 123,80</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-sans">Valor do ICMS (18%)</span>
                <span className="font-bold text-stone-800">R$ 22,28</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-sans">Valor do Frete</span>
                <span className="font-bold text-[#437a5b]">R$ 0,00 (Grátis)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block font-sans font-bold text-stone-900">TOTAL DA NOTA</span>
                <span className="font-extrabold text-sm text-stone-900">R$ 123,80</span>
              </div>
            </div>

            {/* Informações Complementares */}
            <div className="p-3 bg-[#f7ece8] border border-[#f1d6ce] rounded-xl text-[11px] text-stone-800 leading-relaxed">
              <strong>Informações Complementares:</strong> Documento gerado para simulação de processo fiscal. O CPF do cliente (<span className="font-mono font-bold text-[#b85042]">{selectedNfe.destinatario.cpfDescriptografado}</span>) foi decifrado através de chave AES-256-GCM estritamente para a impressão desta Nota Fiscal Eletrônica, cumprindo as diretrizes de privacidade e LGPD.
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#b85042] hover:bg-[#a33f32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" /> Imprimir DANFE
              </button>
              <button
                onClick={() => setSelectedNfe(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
