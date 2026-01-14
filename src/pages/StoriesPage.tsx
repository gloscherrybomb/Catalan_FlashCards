import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StoryCard } from '../components/stories/StoryCard';
import { StoryReader } from '../components/stories/StoryReader';
import { ComprehensionQuiz } from '../components/stories/ComprehensionQuiz';
import { VocabularyPreview } from '../components/stories/VocabularyPreview';
import {
  STORIES,
  type Story,
  type StoryLevel,
  type StoryCategory,
} from '../data/stories';
import { useStoryStore } from '../stores/storyStore';
import { useUserStore } from '../stores/userStore';
import { useCurriculumStore } from '../stores/curriculumStore';

type ViewMode = 'list' | 'vocab-preview' | 'reading' | 'quiz';

export function StoriesPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StoryLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');

  // Get curriculum lesson ID from URL (for Learning Path progress tracking)
  const lessonId = useMemo(() => searchParams.get('lesson') || undefined, [searchParams]);

  const {
    getStoryProgress,
    startStory,
    completeStory,
    getCompletedStoriesCount,
    goToParagraph,
  } = useStoryStore();

  const addXP = useUserStore(state => state.addXP);
  const completeCurriculumLesson = useCurriculumStore(state => state.completeLesson);

  const filteredStories = useMemo(() => {
    let stories = STORIES;

    if (selectedLevel !== 'all') {
      stories = stories.filter(s => s.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      stories = stories.filter(s => s.category === selectedCategory);
    }

    return stories;
  }, [selectedLevel, selectedCategory]);

  const completedCount = getCompletedStoriesCount();
  const levels: StoryLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const categories: StoryCategory[] = ['daily-life', 'travel', 'culture', 'history', 'fiction'];

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    startStory(story.id);

    // Check if story has been completed before - if so, skip vocab preview
    const progress = getStoryProgress(story.id);
    if (progress?.completed) {
      setViewMode('reading');
    } else {
      // First time reading - show vocab preview
      setViewMode('vocab-preview');
    }
  };

  const handleVocabPreviewComplete = () => {
    setViewMode('reading');
  };

  const handleSkipVocabPreview = () => {
    setViewMode('reading');
  };

  const handleStartQuiz = () => {
    setViewMode('quiz');
  };

  const handleCompleteQuiz = async (score: number) => {
    if (selectedStory) {
      completeStory(selectedStory.id, score);

      // Award XP if passing score (70%+)
      if (score >= 70) {
        await addXP(selectedStory.xpReward);
      }

      // Mark curriculum lesson as complete if we came from Learning Path
      if (lessonId && score >= 60) {
        completeCurriculumLesson(lessonId, score);
      }
    }
  };

  const handleReread = () => {
    goToParagraph(0);
    setViewMode('reading');
  };

  const handleBack = () => {
    setSelectedStory(null);
    setViewMode('list');
  };

  const getCategoryLabel = (cat: StoryCategory) => {
    switch (cat) {
      case 'daily-life': return 'Daily Life';
      case 'travel': return 'Travel';
      case 'culture': return 'Culture';
      case 'history': return 'History';
      case 'fiction': return 'Fiction';
      default: return cat;
    }
  };

  // Vocabulary preview mode
  if (viewMode === 'vocab-preview' && selectedStory) {
    const progress = getStoryProgress(selectedStory.id);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <VocabularyPreview
          story={selectedStory}
          onComplete={handleVocabPreviewComplete}
          onSkip={handleSkipVocabPreview}
          isReread={progress?.completed}
        />
      </div>
    );
  }

  // Reading mode
  if (viewMode === 'reading' && selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
        <StoryReader
          story={selectedStory}
          onComplete={handleStartQuiz}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Quiz mode
  if (viewMode === 'quiz' && selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
        <ComprehensionQuiz
          story={selectedStory}
          onComplete={handleCompleteQuiz}
          onReread={handleReread}
        />
      </div>
    );
  }

  // List mode
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-miro-blue" />
              Stories
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Read stories and test your comprehension
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-miro-blue dark:text-miro-yellow">
                  {completedCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Completed
                </p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {STORIES.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Stories
                </p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((completedCount / STORIES.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Progress
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 space-y-3"
        >
          {/* Level filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setSelectedLevel('all')}
              className={`
                px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${selectedLevel === 'all'
                  ? 'bg-miro-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              All Levels
            </button>
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`
                  px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                  ${selectedLevel === level
                    ? 'bg-miro-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${selectedCategory === 'all'
                  ? 'bg-miro-green text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              All Topics
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                  ${selectedCategory === cat
                    ? 'bg-miro-green text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Story List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedLevel}-${selectedCategory}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredStories.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No stories found for this filter combination.
                </p>
              </Card>
            ) : (
              filteredStories.map((story, index) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  progress={getStoryProgress(story.id)}
                  index={index}
                  onClick={() => handleSelectStory(story)}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
