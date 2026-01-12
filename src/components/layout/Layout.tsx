import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AchievementToastContainer } from '../gamification/AchievementToast';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
      <AchievementToastContainer />
    </div>
  );
}
