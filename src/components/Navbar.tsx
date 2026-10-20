'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  User as UserIcon, 
  Heart,
  Search, 
  ChevronDown, 
  Home, 
  PhoneCall, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Menu, 
  X,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useCart } from '@/lib/cart/context';
import { useFavorites } from '@/lib/favorites/context';

const CATEGORIES_LIST = [
  { name: 'Linhas & Fios', desc: 'Cones 5.000j poliéster, fios de overloque e pesponto', icon: '🧵', href: '/products?category=Linhas+%26+Fios' },
  { name: 'Calcadores & Sapatilhas', desc: 'Teflon virgem, zíper invisível, bainha enrolada', icon: '⚙️', href: '/products?category=Calcadores+%26+Sapatilhas' },
  { name: 'Corte & Medição', desc: 'Bases auto-regenerativas, tesouras forjadas e cortadores', icon: '✂️', href: '/products?category=Corte+%26+Medi%C3%A7%C3%A3o' },
  { name: 'Agulhas & Bobinas', desc: 'Agulhas ponta bola para malhas e bobinas de alumínio', icon: '🪡', href: '/products?category=Agulhas+%26+Bobinas' },
  { name: 'Botões', desc: 'Botões de resina polida, madeira natural e 2/4 furos', icon: '🔘', href: '/products?category=Bot%C3%B5es' },
  { name: 'Zíperes', desc: 'Zíperes invisíveis, destacáveis de metal e nylon reforçado', icon: '⚡', href: '/products?category=Z%C3%ADperes' },
  { name: 'Elásticos & Viés', desc: 'Elásticos chatos reforçados e fitas de viés 100% algodão', icon: '🎗️', href: '/products?category=El%C3%A1sticos+%26+Vi%C3%A9s' },
  { name: 'Acessórios', desc: 'Fitas métricas, abridores de casa, guias e giz de alfaiate', icon: '🧰', href: '/products?category=Acess%C3%B3rios' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { favoritesCount } = useFavorites();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Estados de dropdown e busca
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const catDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
    setIsCatDropdownOpen(false);
    setIsProductsDropdownOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-xs bg-white">
        {/* =========================================
            FAIXA 1: BARRA PROMOCIONAL (100% viewport)
            - Altura compacta ~28-32px (h-7 sm:h-8)
            - Fundo terracota #a34839
            - Mensagem centralizada e tipografia legível
            - Seu projeto, nossa inspiração ♡ à direita
            ========================================= */}
        <div className="w-full bg-[#a34839] text-white h-7 sm:h-8 flex items-center">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] font-medium tracking-wide">
            <div className="hidden sm:block w-36" />
            <div className="flex-1 text-center flex items-center justify-center gap-2">
              <Truck className="w-3.5 h-3.5 text-white/90 shrink-0" />
              <span>
                Frete Grátis para todo o Brasil acima de R$ 199 <span className="opacity-60">•</span> Parcele em até 6x sem juros <span className="opacity-60">•</span> Envio Rápido
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-white/90 italic font-serif">
              <span>Seu projeto, nossa inspiração ♡</span>
            </div>
          </div>
        </div>

        {/* =========================================
            FAIXA 2: CABEÇALHO PRINCIPAL (100% viewport)
            - Altura ~80-90px (h-20 sm:h-[88px])
            - Fundo branco
            - Logo à esquerda, Busca ampla no centro, Ações à direita
            - Divisória inferior discreta
            ========================================= */}
        <div className="w-full bg-white border-b border-stone-200/70 h-20 sm:h-[88px] flex items-center">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 lg:gap-10">
            {/* Logo Oficial Costura & Ponto */}
            <Link href="/" className="flex items-center shrink-0 group py-1">
              <img
                src="/logo-mark.png"
                alt="Costura & Ponto — Aviamentos e Acessórios"
                className="h-10 sm:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Campo de Busca Amplo e Centralizado */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl hidden md:flex items-center relative"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por produtos, marca, linha, cor..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#f6f3ef] hover:bg-stone-100/90 focus:bg-white border border-stone-200/90 focus:border-[#a34839] rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Ações da Direita: Minha Conta, Favoritos, Carrinho */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Minha Conta */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 text-stone-700 hover:text-[#a34839] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                    <UserIcon className="w-4 h-4 text-[#a34839]" />
                  </div>
                  <div className="hidden lg:block text-xs leading-tight">
                    <span className="font-bold text-stone-900 block">
                      {user ? user.name.split(' ')[0] : 'Minha Conta'}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-0.5">
                      {user ? 'Acessar painel' : 'Entrar ou Cadastrar'}
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    </span>
                  </div>
                </button>

                {/* Menu Suspenso da Conta */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user ? (
                      <div className="space-y-1">
                        <div className="px-3 py-2 border-b border-stone-100">
                          <span className="font-bold text-xs text-stone-900 block truncate">{user.name}</span>
                          <span className="text-[11px] text-stone-500 block truncate">{user.email}</span>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
                        >
                          <Package className="w-4 h-4 text-[#a34839]" />
                          <span>Meus Pedidos</span>
                        </Link>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
                        >
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          <span>Dados Cadastrais</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Painel do Lojista</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full py-2 bg-[#a34839] hover:bg-[#8c3527] text-white text-center rounded-xl text-xs font-bold transition-colors shadow-2xs"
                        >
                          Entrar na Conta
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-center rounded-xl text-xs font-semibold transition-colors"
                        >
                          Criar Cadastro
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Favoritos */}
              <Link
                href="/products?favoritos=true"
                className="flex items-center gap-2 text-stone-700 hover:text-[#a34839] transition-colors"
                title="Produtos Favoritos"
              >
                <div className="relative">
                  <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-[#a34839] fill-[#a34839]' : 'text-stone-700'}`} />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#a34839] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                      {favoritesCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-semibold">Favoritos</span>
              </Link>

              {/* Carrinho */}
              <Link
                href="/cart"
                className="flex items-center gap-2 text-stone-700 hover:text-[#a34839] transition-colors"
                title="Carrinho de Compras"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-stone-800 hover:text-[#a34839]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#a34839] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-2xs">
                    {itemCount}
                  </span>
                </div>
                <span className="hidden lg:inline text-xs font-semibold">Carrinho</span>
              </Link>

              {/* Toggle Mobile */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
                aria-label="Abrir Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            FAIXA 3: NAVEGAÇÃO (100% viewport)
            - Altura ~48-54px (h-12 sm:h-[50px])
            - Fundo branco
            - Links distribuídos com espaçamento equilibrado
            - Página ativa destacada em terracota
            - Divisória inferior discreta
            ========================================= */}
        <div className="w-full bg-white border-b border-stone-200/80 h-12 sm:h-[50px] flex items-center">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
            {/* Links da Barra de Navegação */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-4 text-xs font-semibold text-stone-700 h-full">
              {/* Início */}
              <Link
                href="/"
                className={`px-2.5 h-full flex items-center gap-1.5 transition-colors border-b-2 ${
                  pathname === '/'
                    ? 'text-[#a34839] border-[#a34839] font-bold'
                    : 'border-transparent hover:text-[#a34839]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Início</span>
              </Link>

              {/* Produtos (Menu Suspenso) */}
              <div className="relative h-full flex items-center" ref={catDropdownRef}>
                <Link
                  href="/products"
                  onMouseEnter={() => setIsCatDropdownOpen(true)}
                  className={`px-2.5 h-full flex items-center gap-1 transition-colors border-b-2 ${
                    pathname.includes('/products')
                      ? 'text-[#a34839] border-[#a34839] font-bold'
                      : 'border-transparent hover:text-[#a34839]'
                  }`}
                >
                  <span>Produtos</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCatDropdownOpen ? 'rotate-180 text-[#a34839]' : 'text-stone-400'}`} />
                </Link>

                {isCatDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsCatDropdownOpen(false)}
                    className="absolute left-0 top-full mt-0 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3 py-1.5 border-b border-stone-100 mb-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Departamentos do Ateliê
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {CATEGORIES_LIST.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setIsCatDropdownOpen(false)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#faf7f2] transition-colors group"
                        >
                          <span className="text-base select-none">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-stone-800 group-hover:text-[#a34839] block transition-colors">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-stone-500 line-clamp-1">
                              {cat.desc}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Botão Fale Conosco à Direita */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Badge discreto do Painel Admin (quando logado) */}
              {user && user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                  title="Painel Administrativo"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Painel Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="px-4 py-1.5 rounded-full border border-stone-300 hover:border-[#a34839] hover:text-[#a34839] text-stone-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs group"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MessageCircle className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#a34839]" />
                <span>Fale Conosco</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 shadow-xl">
            {/* Campo de Busca no Mobile */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por produtos, marca, cor..."
                className="w-full pl-10 pr-4 py-2 bg-stone-100 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#a34839] border border-stone-200"
              />
            </form>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block px-2 mb-1">
                Navegação
              </span>
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                  pathname === '/' ? 'bg-[#a34839] text-white' : 'text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Home className="w-4 h-4" /> Início
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Package className="w-4 h-4 text-[#a34839]" /> Todos os Produtos
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Truck className="w-4 h-4 text-emerald-600" /> Meus Pedidos
              </Link>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block px-2 mb-1">
                Departamentos
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs text-stone-700 bg-stone-50/70 hover:bg-stone-100"
                  >
                    <span>{cat.icon}</span>
                    <span className="font-medium truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modal Fale Conosco */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#fcedeb] text-[#a34839] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Atendimento Costura & Ponto</h3>
                  <span className="text-[11px] text-stone-500">Estamos prontos para te ajudar!</span>
                </div>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  💬
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">WhatsApp de Vendas & Suporte</span>
                  <span className="text-stone-500">(11) 98765-4321 • Resposta em minutos</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  ✉️
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">E-mail de Atendimento</span>
                  <span className="text-stone-500">contato@costuraeponto.com.br</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold">
                  🕒
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">Horário de Funcionamento</span>
                  <span className="text-stone-500">Segunda a Sexta, das 8h às 18h</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#a34839] hover:bg-[#8c3527] text-white text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
