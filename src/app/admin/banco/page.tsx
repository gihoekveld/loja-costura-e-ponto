import React from 'react';
import { DatabaseViewer } from '@/components/admin/DatabaseViewer';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Visualização do Banco de Dados — Painel Admin Costura & Ponto',
  description: 'Inspeção direta das tabelas do PostgreSQL da aplicação.',
};

export default function AdminBancoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel Admin</span>
        </Link>
        <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-[#b85042]" />
          Visualizador de Banco de Dados Oficial
        </span>
      </div>

      <DatabaseViewer initialPassword="" isInsideAdmin={false} />
    </div>
  );
}
