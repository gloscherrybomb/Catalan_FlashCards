import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { logger } from './services/logger';
import { Layout } from './components/layout/Layout';
import { RouteFallback } from './components/ui/RouteFallback';
import { useUserStore } from './stores/userStore';
import { useCardStore } from './stores/cardStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// HomePage is the landing route, so it stays in the entry chunk — lazy-loading
// it would only add a network round-trip before the first paint.
import { HomePage } from './pages/HomePage';

// Every other route is code-split. These are imported from their own modules
// rather than the `pages` barrel on purpose: importing through the barrel would
// pull all fourteen pages (and their data files) into a single chunk again.
const StudyPage = lazy(() => import('./pages/StudyPage').then(m => ({ default: m.StudyPage })));
const BrowsePage = lazy(() => import('./pages/BrowsePage').then(m => ({ default: m.BrowsePage })));
const ImportPage = lazy(() => import('./pages/ImportPage').then(m => ({ default: m.ImportPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const GrammarPage = lazy(() => import('./pages/GrammarPage').then(m => ({ default: m.GrammarPage })));
const LearningPathPage = lazy(() => import('./pages/LearningPathPage').then(m => ({ default: m.LearningPathPage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));
const ConversationPage = lazy(() => import('./pages/ConversationPage').then(m => ({ default: m.ConversationPage })));
const GamesPage = lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })));
const PracticeDrillsPage = lazy(() => import('./pages/PracticeDrillsPage').then(m => ({ default: m.PracticeDrillsPage })));
const MorePage = lazy(() => import('./pages/MorePage').then(m => ({ default: m.MorePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

/** Hard ceiling on how long the splash screen may block the UI. */
const INIT_TIMEOUT_MS = 5000;

function AppContent() {
  const initializeUser = useUserStore((state) => state.initialize);
  const loadCards = useCardStore((state) => state.loadCards);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    let mounted = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const init = async () => {
      try {
        // Never let a hanging network call strand the user on the splash screen.
        timeout = setTimeout(() => {
          if (mounted) {
            logger.warn('Initialization timeout - forcing load', 'App');
            useUserStore.setState({ isLoading: false });
          }
        }, INIT_TIMEOUT_MS);

        await initializeUser();

        if (mounted) {
          await loadCards();
        }
      } catch (error) {
        logger.error('Initialization error', 'App', { error: String(error) });
        if (mounted) {
          useUserStore.setState({ isLoading: false });
        }
      } finally {
        // Previously this only ran on the success path, so a thrown error left
        // the timeout armed and it could flip isLoading long after init failed.
        clearTimeout(timeout);
      }
    };
    init();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [initializeUser, loadCards]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center relative">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-miro-yellow/30 blob animate-pulse" aria-hidden="true" />
          <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-miro-red/20 blob-2 animate-pulse" aria-hidden="true" />

          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-4" aria-hidden="true">
            <div className="absolute inset-0 bg-miro-yellow blob opacity-60 animate-pulse" />
            <div className="relative w-full h-full bg-miro-red blob flex items-center justify-center shadow-playful-sm">
              <span className="text-white font-display font-bold text-3xl">C</span>
            </div>
          </div>

          <p className="text-miro-blue/70 dark:text-ink-light/70 font-medium">
            Loading your cards…
          </p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1 mt-3" aria-hidden="true">
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
        <Route index element={<HomePage />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/study" element={<StudyPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/grammar" element={<GrammarPage />} />
                <Route path="/grammar/:lessonId" element={<GrammarPage />} />
                <Route path="/learn" element={<LearningPathPage />} />
                <Route path="/learning-path" element={<LearningPathPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/conversation" element={<ConversationPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/drills" element={<PracticeDrillsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      {/*
        Honour the OS "reduce motion" setting across the whole app.

        index.css already neutralises CSS animation for these users, but Framer
        Motion drives transforms from JavaScript and ignores that stylesheet
        entirely - so with animation in 87 components, someone who asked for
        less motion was still getting all of it. reducedMotion="user" makes
        Framer Motion drop transform and layout animations while keeping
        opacity changes, so the interface stays legible without moving.
      */}
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
