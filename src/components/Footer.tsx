'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Send,
  Instagram, 
  Facebook, 
  Youtube, 
  Phone, 
  Mail, 
  Clock,
  Heart
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#fbf8f5] text-stone-700">
      {/* =========================================
          FAIXA DE NEWSLETTER (DA REFERÊNCIA)
          ========================================= */}
      <div className="border-b border-stone-200/80 bg-[#fbf3ee] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Texto de Chamada */}
          <div className="text-center lg:text-left space-y-1">
            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
              Receba novidades, ofertas e dicas de costura!
            </h3>
            <p className="text-xs text-stone-600">
              Cadastre seu e-mail e fique por dentro de tudo em primeira mão.
            </p>
          </div>

          {/* Formulário de Inscrição */}
          <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#a34839] shadow-2xs transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#a34839] hover:bg-[#8c3527] text-white text-xs font-bold rounded-full transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            >
              {subscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Cadastrado!</span>
                </>
              ) : (
                <>
                  <span>Cadastrar</span>
                </>
              )}
            </button>
          </form>

          {/* Frase Manuscrita da Referência */}
          <div className="hidden xl:flex items-center gap-2 text-[#a34839] font-serif italic text-xs max-w-xs text-right leading-tight">
            <span>Porque toda criação começa com um bom aviamento! ♡</span>
          </div>
        </div>
      </div>

      {/* =========================================
          LINKS PRINCIPAIS DO RODAPÉ
          ========================================= */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Coluna 1: Logo & Sobre */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo-mark.png"
                alt="Costura & Ponto — Aviamentos e Acessórios"
                className="h-10 sm:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>

            <p className="text-xs text-stone-600 leading-relaxed pt-1">
              Sua loja especializada em aviamentos, linhas de costura, fios de overloque, calcadores e ferramentas de corte para ateliês, pequenas confecções e oficinas de costura doméstica.
            </p>
          </div>

          {/* Coluna 2: Atendimento */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Atendimento
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#a34839] shrink-0" />
                <span>(11) 98765-4321</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#a34839] shrink-0" />
                <span>contato@costuraeponto.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#a34839] shrink-0 mt-0.5" />
                <span>Segunda a sexta, das 8h às 18h</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/products" className="hover:text-[#a34839] transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#a34839] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#a34839] transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#a34839] transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Formas de Pagamento & Redes */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                Formas de Pagamento
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-bold text-emerald-800">
                  PIX
                </span>
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-bold text-blue-800">
                  VISA
                </span>
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-bold text-rose-700">
                  MASTERCARD
                </span>
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-bold text-amber-700">
                  ELO
                </span>
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-bold text-stone-700">
                  BOLETO
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                Siga-nos
              </h4>
              <div className="flex items-center gap-2.5">
                <a
                  href="#instagram"
                  className="w-7 h-7 rounded-full bg-white border border-stone-200 hover:border-[#a34839] hover:text-[#a34839] text-stone-600 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#facebook"
                  className="w-7 h-7 rounded-full bg-white border border-stone-200 hover:border-[#a34839] hover:text-[#a34839] text-stone-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#youtube"
                  className="w-7 h-7 rounded-full bg-white border border-stone-200 hover:border-[#a34839] hover:text-[#a34839] text-stone-600 flex items-center justify-center transition-colors"
                  aria-label="Youtube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          COPYRIGHT BAR INFERIOR
          ========================================= */}
      <div className="bg-[#a34839] text-white text-[11px] py-3.5 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>© 2026 Costura & Ponto. Todos os direitos reservados.</span>
          <span className="flex items-center justify-center gap-1 opacity-90">
            Desenvolvido com <Heart className="w-3 h-3 fill-white text-white" /> para quem ama costura.
          </span>
        </div>
      </div>
    </footer>
  );
}
