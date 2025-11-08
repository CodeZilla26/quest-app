import './globals.css';
import Particles from '../components/Particles';
import Header from '../components/Header';
import NotificationSystem from '../components/NotificationSystem';
import Providers from './providers';
import ThemeApplier from '../components/ThemeApplier';
import RewardModal from '../components/RewardModal';
import ChestOpenModal from '../components/ChestOpenModal';

export const metadata = {
  title: 'TodoList - Next + Tailwind (JSX)',
  description: 'App de tareas con Next.js 14, React 18 y Tailwind CSS, sin TypeScript',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Capa sutil para atmósfera */}
        <div className="pointer-events-none fixed inset-0 opacity-60" aria-hidden>
          <div className="absolute inset-0 bg-solo-gradient" />
        </div>
        <Particles />
        <NotificationSystem />
        <Providers>
          <div className="relative">
            <ThemeApplier />
            <Header />
            {children}
            {/* Modales globales */}
            <RewardModal />
            <ChestOpenModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
