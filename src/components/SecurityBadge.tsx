import React from 'react';
import { ShieldCheck, Lock, Database, FileCode } from 'lucide-react';

interface SecurityBadgeProps {
  title: string;
  description: string;
  icon?: 'shield' | 'lock' | 'db' | 'code';
}

export function SecurityBadge({ title, description, icon = 'shield' }: SecurityBadgeProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'lock':
        return <Lock className="w-5 h-5 text-[#437a5b]" />;
      case 'db':
        return <Database className="w-5 h-5 text-[#c67d26]" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-[#b85042]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#b85042]" />;
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-4 my-2 flex items-start gap-3 text-stone-800 shadow-xs">
      <div className="p-2 bg-stone-100 rounded-lg shrink-0">{renderIcon()}</div>
      <div>
        <h4 className="text-xs font-bold text-[#b85042] uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-stone-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
