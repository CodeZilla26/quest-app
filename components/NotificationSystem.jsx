"use client";
import { useState, useEffect, useRef } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const recentRef = useRef(new Map()); // key -> expiry ts

  useEffect(() => {
    // Deduplicación básica por (type|text) en ventana corta para evitar dobles en dev/efectos repetidos
    const handleToast = (event) => {
      const { type, text, duration = 4000 } = event.detail || {};
      if (!text) return;
      const key = `${type || 'default'}|${text}`;
      const now = Date.now();
      const ttlMs = 5000; // 5s para cubrir bursts/estrict mode
      const exp = recentRef.current.get(key);
      if (exp && exp > now) return; // ignorar duplicado en ventana
      recentRef.current.set(key, now + ttlMs);
      // Limpieza perezosa
      for (const [k, v] of recentRef.current.entries()) {
        if (v <= now) recentRef.current.delete(k);
      }

      const id = Date.now() + Math.random();
      const notification = { id, type, text, duration, timestamp: Date.now() };
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after duration
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'achievement': return '🏆';
      case 'quest': return '⚔️';
      case 'exp': return '⚡';
      case 'essence': return '💎';
      default: return '📢';
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return 'from-emerald-500 to-green-600 border-emerald-400/50';
      case 'error':
        return 'from-red-500 to-rose-600 border-red-400/50';
      case 'warning':
        return 'from-amber-500 to-orange-600 border-amber-400/50';
      case 'info':
        return 'from-blue-500 to-cyan-600 border-blue-400/50';
      case 'achievement':
        return 'from-purple-500 to-fuchsia-600 border-purple-400/50';
      case 'quest':
        return 'from-indigo-500 to-purple-600 border-indigo-400/50';
      case 'exp':
        return 'from-cyan-500 to-blue-600 border-cyan-400/50';
      case 'essence':
        return 'from-amber-500 to-yellow-600 border-amber-400/50';
      default:
        return 'from-slate-500 to-slate-600 border-slate-400/50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto transform transition-all duration-500 ease-out
            animate-in slide-in-from-right-full fade-in
            ${index === 0 ? 'translate-x-0' : `translate-y-${index * 2}`}
          `}
          style={{
            animationDelay: `${index * 100}ms`,
            zIndex: 9999 - index
          }}
        >
          <div
            className={`
              relative overflow-hidden rounded-lg border backdrop-blur-sm
              bg-gradient-to-r ${getNotificationColors(notification.type)}
              shadow-lg shadow-black/25 min-w-[300px] max-w-sm
              hover:scale-105 transition-transform duration-200
            `}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
            
            {/* Content */}
            <div className="relative p-4 flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 text-xl">
                {getNotificationIcon(notification.type)}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm leading-relaxed break-words">
                  {notification.text}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors duration-200 text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-white/30 transition-all ease-linear"
                style={{
                  animation: `shrink ${notification.duration}ms linear forwards`
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-right-full {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right-full {
          animation-name: slide-in-from-right-full;
        }
        
        .fade-in {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
