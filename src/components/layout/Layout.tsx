import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AchievementToastContainer } from '../gamification/AchievementToast';

// Floating decorative blobs component
function FloatingShapes() {
  return (
    <div className="floating-shapes" aria-hidden="true">
      <div className="floating-blob floating-blob-1" />
      <div className="floating-blob floating-blob-2" />
      <div className="floating-blob floating-blob-3" />

      {/* Miró-style decorative stars */}
      <div
        className="absolute top-[15%] left-[10%] text-4xl text-miro-yellow animate-float opacity-20"
        style={{ animationDelay: '1s' }}
      >
        ✦
      </div>
      <div
        className="absolute top-[60%] right-[15%] text-3xl text-miro-red animate-float opacity-15"
        style={{ animationDelay: '3s' }}
      >
        ✦
      </div>
      <div
        className="absolute bottom-[30%] left-[20%] text-2xl text-miro-blue animate-float opacity-10 dark:opacity-20"
        style={{ animationDelay: '5s' }}
      >
        ●
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark relative">
      {/* Floating decorative elements */}
      <FloatingShapes />

      {/* Main content */}
      <div className="relative z-10">
        <Header />
        <main className="pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileNav />
      </div>

      {/* Toast notifications */}
      <AchievementToastContainer />
    </div>
  );
}
