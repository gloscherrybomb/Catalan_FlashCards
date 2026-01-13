import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { logger } from './services/logger';
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
  GamesPage,
  PracticeDrillsPage,
} from './pages';
import { useUserStore } from './stores/userStore';
import { useCardStore } from './stores/cardStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

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
            logger.warn('Initialization timeout - forcing load', 'App');
            useUserStore.setState({ isLoading: false });
          }
        }, 5000);

        await initializeUser();
        clearTimeout(timeout);

        if (mounted) {
          await loadCards();
        }
      } catch (error) {
        logger.error('Initialization error', 'App', { error: String(error) });
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
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center">
        <div className="text-center relative">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-miro-yellow/30 blob animate-pulse" />
          <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-miro-red/20 blob-2 animate-pulse" />

          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-miro-yellow blob opacity-60 animate-pulse" />
            <div className="relative w-full h-full bg-miro-red blob flex items-center justify-center shadow-playful-sm">
              <span className="text-white font-display font-bold text-3xl">C</span>
            </div>
          </div>

          <p className="text-miro-blue/60 dark:text-ink-light/60 font-medium">
            Loading your cards...
          </p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1 mt-3">
            <span className="w-2 h-2 bg-miro-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-miro-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-miro-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
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
        <Route path="/games" element={<GamesPage />} />
        <Route path="/drills" element={<PracticeDrillsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
