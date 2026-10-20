import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { ShieldCheck, Lock, Database, Terminal, FileText, Bug, CheckCircle, AlertOctagon } from 'lucide-react';

export const metadata = {
  title: 'Documentação Técnica de Segurança - Costura & Ponto',
  description: 'Relatório técnico da arquitetura de segurança, duplo armazenamento de CPF e blind indexing.',
};

export default function SecurityDocPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Title */}
      <div className="border-b border-stone-200 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7ece8] border border-[#f1d6ce] text-[#b85042] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#b85042]" />
          <span>Relatório de Arquitetura & Segurança da Informação</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Arquitetura de Segurança, Criptografia de CPF & Proteções
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Esta documentação detalha os controles de segurança implementados na aplicação <span className="text-[#b85042] font-semibold">Costura & Ponto</span>, cobrindo o modelo de duplo armazenamento de CPF, autenticação forte, isolamento IDOR e defesas contra injeção de dados.
        </p>
      </div>

      {/* 1. Arquitetura da Aplicação */}
      <section id="arquitetura" className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#b85042]" /> 1. Arquitetura da Aplicação
        </h2>
        <p className="text-xs text-stone-700 leading-relaxed">
          A aplicação adota uma arquitetura Serverless baseada em <strong>Next.js App Router</strong> executada sobre o runtime global da <strong>Cloudflare Workers / Pages</strong>, integrado ao banco de dados relacional <strong>Cloudflare D1</strong> (SQLite distribuído na borda).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Runtime Edge (Cloudflare)</h3>
            <p className="text-stone-600">
              Execução server-side rápida, isolada em V8 isolates sem dependências nativas legadas, reduzindo a superfície de ataque no servidor.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Zero Third-Party Backend</h3>
            <p className="text-stone-600">
              Toda a regra de negócio, autenticação e recálculo de checkout ocorrem dentro do próprio contorno de segurança da aplicação.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Autenticação & Armazenamento de Senhas */}
      <section id="autenticacao" className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#437a5b]" /> 2. Autenticação e Hash de Senhas
        </h2>
        <p className="text-xs text-stone-700 leading-relaxed">
          Senhas nunca são armazenadas ou trafegadas em texto puro. Utiliza-se o algoritmo padrão da indústria <strong>PBKDF2-HMAC-SHA256</strong> com <strong>100.000 iterações</strong> e um <i>salt</i> aleatório de 16 bytes gerado individualmente por usuário via <code>crypto.getRandomValues()</code>.
        </p>

        <CodeBlock
          title="Exemplo Inseguro (Vulnerável a Leitura de Banco e Rainbow Tables)"
          type="insecure"
          code={`// ✕ VULNERÁVEL: Armazenar senha em MD5 ou texto puro
const query = \`INSERT INTO users (email, password) VALUES ('\${email}', '\${password}')\`;
// Se o banco for vazado, todas as senhas ficam expostas instantaneamente.`}
        />

        <CodeBlock
          title="Implementação Segura (Implementada na Loja)"
          type="secure"
          code={`// ✓ SEGURANÇA: Web Crypto API PBKDF2 (100.000 iterações + Salt de 16 bytes)
const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
const storedHash = \`pbkdf2:100000:\${saltHex}:\${hashHex}\`;`}
        />
      </section>

      {/* 3. Duplo Armazenamento de CPF */}
      <section id="cpf-crypto" className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#b85042]" /> 3. Duplo Armazenamento de CPF (Blind Index + AES-256-GCM)
        </h2>
        <p className="text-xs text-stone-700 leading-relaxed">
          Para conciliar a necessidade gerencial de busca exata rápida no painel admin com o cumprimento rigoroso da LGPD e a emissão de Notas Fiscais (NF-e):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-[#b85042] uppercase tracking-wider text-[11px]">1. Hash Determinístico (cpf_hash)</h3>
            <p className="text-stone-600">
              SHA-256 com pepper secreto da aplicação aplicado sobre os 11 dígitos normalizados. Permite busca exata (<code>WHERE cpf_hash = ?</code>) indexada por B-Tree sem nunca gravar o CPF legível no índice.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-[#437a5b] uppercase tracking-wider text-[11px]">2. Criptografia Reversível (cpf_encrypted)</h3>
            <p className="text-stone-600">
              AES-256-GCM com IV aleatório de 96 bits por registro. Apenas administradores autenticados podem solicitar o CPF original decifrado para gerar e imprimir o DANFE da NF-e.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Proteção IDOR */}
      <section id="idor" className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#437a5b]" /> 4. Autorização e Prevenção de IDOR (Broken Access Control)
        </h2>
        <p className="text-xs text-stone-700 leading-relaxed">
          A vulnerabilidade IDOR (Insecure Direct Object Reference) ocorre quando uma aplicação confia no ID do recurso enviado na requisição pelo cliente sem verificar os direitos de propriedade da sessão.
        </p>

        <CodeBlock
          title="Implementação Segura com Cláusula Composta no Banco D1"
          type="secure"
          code={`// ✓ SEGURANÇA: Validação estrita de escopo (user_id === session.user_id) no banco D1
export async function getOrderByIdForUser(orderId: string, userId: string) {
  const order = await db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .bind(orderId, userId)
    .first();
  if (!order) return null; // Retorna 404 neutro se não pertencer ao usuário
  return order;
}`}
        />
      </section>

      {/* 5. Headers HTTP */}
      <section id="headers" className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-[#b85042]" /> 5. Headers de Segurança HTTP
        </h2>
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 text-xs space-y-2 font-mono text-stone-800 shadow-xs">
          <p><span className="text-[#b85042] font-semibold">Content-Security-Policy:</span> default-src &apos;self&apos;; ...</p>
          <p><span className="text-[#b85042] font-semibold">X-Content-Type-Options:</span> nosniff</p>
          <p><span className="text-[#b85042] font-semibold">X-Frame-Options:</span> DENY</p>
          <p><span className="text-[#b85042] font-semibold">Referrer-Policy:</span> strict-origin-when-cross-origin</p>
        </div>
      </section>
    </div>
  );
}
