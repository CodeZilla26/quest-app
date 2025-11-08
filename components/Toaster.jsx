"use client";
import { useEffect, useState } from 'react';

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const t = e.detail || { text: 'Mensaje', type: 'info' };
      const id = Math.random().toString(36).slice(2);
      setToasts((arr) => [...arr, { id, ...t }]);
      setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 3000);
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  const color = (type) =>
    type === 'success'
      ? 'from-emerald-500 to-green-600'
      : type === 'error'
      ? 'from-rose-500 to-red-600'
      : 'from-solo-indigo-600 to-solo-purple-600';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[1000] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-md rounded-lg border border-slate-800/70 bg-slate-900/70 p-3 shadow-inner-card`}
        >
          <div className={`mb-2 h-1 w-full overflow-hidden rounded bg-slate-800/70`}>
            <div className={`h-full bg-gradient-to-r ${color(t.type)} animate-shimmer shimmer-bar`} style={{ width: '100%' }} />
          </div>
          <div className="text-sm text-slate-100">{t.text}</div>
        </div>
      ))}
    </div>
  );
}
