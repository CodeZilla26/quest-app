"use client";
import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ isOpen, open, onClose, title, children, size = 'md', align = 'center', closeVariant = 'icon', closeText = 'Cerrar' }) {
  const visible = typeof isOpen === 'boolean' ? isOpen : !!open;
  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${align === 'start' ? 'items-start' : 'items-center'} justify-center p-4 animate-in fade-in duration-200`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}>
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl backdrop-blur-md">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
              {closeVariant === 'button' ? (
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={onClose}>{closeText}</Button>
              ) : (
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
