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
      {/*
        Keyboard users otherwise have to tab through the entire header and its
        overflow menu on every navigation to reach the page itself.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-miro-blue focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="relative z-10">
        <Header />
        <main id="main-content" tabIndex={-1} className="pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileNav />
      </div>

      {/* Toast notifications */}
      <AchievementToastContainer />
    </div>
  );
}
