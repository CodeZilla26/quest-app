"use client";
import useQuests from '../hooks/useQuests';

export default function Button({ as: Tag = 'button', className = '', variant = 'primary', ...props }) {
  const { state } = useQuests();
  const isDominio = state.theme === 'dominio' || state.theme === 'shadow';
  const base = 'btn inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  const variants = {
    primary: isDominio
      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-glow-purple hover:brightness-110 hover:translate-y-[-1px] active:translate-y-0 focus:ring-purple-500/60'
      : 'bg-gradient-to-r from-solo-indigo-600 to-blue-500 text-white shadow-glow-indigo hover:brightness-110 hover:translate-y-[-1px] active:translate-y-0 focus:ring-indigo-500/60',
    ghost: 'btn-ghost bg-transparent text-slate-200 hover:bg-slate-800/60 focus:ring-slate-600/60',
    danger: 'btn-danger bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.35)] hover:brightness-110',
  };
  const variantClass = variants[variant] ?? '';
  const semanticVariant = `btn-${variant}`;
  return <Tag className={`${base} ${semanticVariant} ${variantClass} ${className}`} {...props} />;
}
