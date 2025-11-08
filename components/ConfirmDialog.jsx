"use client";

import { useEffect, useRef, useState } from "react";

export default function ConfirmDialog({ open, title = "Confirmar", message, confirmText = "Confirmar", cancelText = "Cancelar", confirmDisabledForMs = 2000, onConfirm, onCancel, inline = false, themeDominio = false }) {
  if (!open) return null;
  const cancelRef = useRef(null);
  // Cerrar con Escape y enfocar Cancel
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    }
    document.addEventListener('keydown', onKey);
    // Enfocar cancelar al montar
    if (cancelRef.current) cancelRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
  const containerCls = inline
    ? 'absolute inset-0 z-[1200] flex items-center justify-center p-3'
    : 'fixed inset-0 z-[2000] flex items-center justify-center p-4';
  const panelBorder = themeDominio ? 'border-purple-700/60' : 'border-indigo-700/60';
  return (
    <div className={containerCls}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={onCancel} />
      <div className={`relative w-full max-w-sm rounded-xl border ${panelBorder} bg-slate-900/95 p-4 shadow-2xl`}>
        <div className="mb-2 text-sm font-semibold text-slate-100">{title}</div>
        {message && <div className="mb-4 text-xs text-slate-300 whitespace-pre-line">{message}</div>}
        <ConfirmButtons confirmText={confirmText} cancelText={cancelText} confirmDisabledForMs={confirmDisabledForMs} onConfirm={onConfirm} onCancel={onCancel} themeDominio={themeDominio} cancelRef={cancelRef} />
      </div>
    </div>
  );
}

function ConfirmButtons({ confirmText, cancelText, confirmDisabledForMs, onConfirm, onCancel, themeDominio, cancelRef }) {
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    setDisabled(true);
    const t = setTimeout(() => setDisabled(false), Math.max(0, confirmDisabledForMs || 0));
    return () => clearTimeout(t);
  }, [confirmDisabledForMs]);
  const cancelCls = themeDominio
    ? 'rounded-md border border-purple-700/60 bg-slate-800/60 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700/60'
    : 'rounded-md border border-indigo-700/60 bg-slate-800/60 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700/60';
  return (
    <div className="flex justify-end gap-2">
      <button ref={cancelRef} onClick={onCancel} className={cancelCls}>{cancelText}</button>
      <button disabled={disabled} onClick={onConfirm} className={`rounded-md px-3 py-1 text-xs font-medium ${disabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_16px_rgba(244,63,94,0.35)] hover:brightness-110'}`}>{confirmText}</button>
    </div>
  );
}
