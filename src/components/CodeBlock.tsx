import React from 'react';

interface CodeBlockProps {
  title: string;
  code: string;
  type?: 'secure' | 'insecure' | 'neutral';
}

export function CodeBlock({ title, code, type = 'neutral' }: CodeBlockProps) {
  const getBadgeStyle = () => {
    switch (type) {
      case 'secure':
        return 'bg-emerald-50 border-emerald-200 text-[#437a5b]';
      case 'insecure':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-stone-100 border-stone-200 text-stone-700';
    }
  };

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-stone-900 overflow-hidden text-xs shadow-xs">
      <div className={`px-4 py-2 border-b flex items-center justify-between font-mono font-medium ${getBadgeStyle()}`}>
        <span>{title}</span>
        <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-white/80 font-bold">
          {type === 'secure' ? '✓ Implementação Segura' : type === 'insecure' ? '✕ Vulnerável (Exemplo Acadêmico)' : 'Código'}
        </span>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-stone-200 leading-relaxed bg-stone-950">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
