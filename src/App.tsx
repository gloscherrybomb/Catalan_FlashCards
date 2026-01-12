import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import {
  HomePage,
  StudyPage,
  BrowsePage,
  ImportPage,
  StatsPage,
  AchievementsPage,
  SettingsPage,
  AnalyticsPage,
  GrammarPage,
  LearningPathPage,
  StoriesPage,
  ConversationPage,
} from './pages';
import { useUserStore } from './stores/userStore';
import { useCardStore } from './stores/cardStore';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const initializeUser = useUserStore((state) => state.initialize);
  const loadCards = useCardStore((state) => state.loadCards);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    let mounted = true;

    // Initialize the app with timeout fallback
    const init = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          if (mounted) {
            console.warn('Initialization timeout - forcing load');
            useUserStore.setState({ isLoading: false });
          }
        }, 5000);

        await initializeUser();
        clearTimeout(timeout);

        if (mounted) {
          await loadCards();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) {
          useUserStore.setState({ isLoading: false });
        }
      }
    };
    init();

    return () => {
      mounted = false;
    };
  }, [initializeUser, loadCards]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/grammar/:lessonId" element={<GrammarPage />} />
        <Route path="/learn" element={<LearningPathPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/conversation" element={<ConversationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
