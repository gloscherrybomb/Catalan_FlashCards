import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  ChevronLeft,
  BookOpen,
  Trophy,
  Sparkles,
  Play,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SkillTree } from '../components/curriculum/SkillTree';
import { LessonCard } from '../components/curriculum/LessonCard';
import { PlacementTest } from '../components/curriculum/PlacementTest';
import {
  CURRICULUM_UNITS,
  getUnitsByLevel,
  type CurriculumUnit,
  type CEFRLevel,
} from '../data/curriculum';
import { useCurriculumStore, type PlacementResult } from '../stores/curriculumStore';

type ViewMode = 'overview' | 'placement' | 'unit-detail';

export function LearningPathPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedUnit, setSelectedUnit] = useState<CurriculumUnit | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');

  const {
    currentLevel,
    placementResult,
    getLessonProgress,
    isUnitUnlocked,
    getLevelProgress,
    getTotalXPEarned,
    getNextLesson,
    startLesson,
    resetPlacement,
  } = useCurriculumStore();

  const filteredUnits = useMemo(() => {
    if (selectedLevel === 'all') return CURRICULUM_UNITS;
    return getUnitsByLevel(selectedLevel);
  }, [selectedLevel]);

  const nextLesson = getNextLesson();
  const totalXP = getTotalXPEarned();

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  const handleSelectUnit = (unit: CurriculumUnit) => {
    setSelectedUnit(unit);
    setViewMode('unit-detail');
  };

  const handleStartLesson = (lessonId: string) => {
    startLesson(lessonId);

    // Find the lesson to determine navigation
    const lesson = selectedUnit?.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      navigate('/study');
      return;
    }

    // Navigate based on lesson type
    switch (lesson.content.type) {
      case 'vocabulary':
        // Navigate to study with category filter
        if (lesson.content.cardCategories && lesson.content.cardCategories.length > 0) {
          navigate(`/study?categories=${lesson.content.cardCategories.join(',')}`);
        } else {
          navigate('/study');
        }
        break;
      case 'grammar':
        // Navigate to grammar lesson
        if (lesson.content.grammarLessonId) {
          navigate(`/grammar/${lesson.content.grammarLessonId}`);
        } else {
          navigate('/grammar');
        }
        break;
      case 'conversation':
        // Navigate to conversation practice
        navigate('/conversation');
        break;
      case 'culture':
        // Navigate to stories/culture content
        navigate('/stories');
        break;
      default:
        navigate('/study');
    }
  };

  const handlePlacementComplete = (_result: PlacementResult) => {
    setViewMode('overview');
  };

  const handleRetakePlacement = () => {
    resetPlacement();
    setViewMode('placement');
  };

  // Render Placement Test
  if (viewMode === 'placement') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <PlacementTest
          onComplete={handlePlacementComplete}
          onCancel={() => setViewMode('overview')}
        />
      </div>
    );
  }

  // Render Unit Detail
  if (viewMode === 'unit-detail' && selectedUnit) {
    const isUnlocked = isUnitUnlocked(selectedUnit.id);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-6">
          <button
            onClick={() => {
              setSelectedUnit(null);
              setViewMode('overview');
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Path</span>
          </button>

          {/* Unit Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${selectedUnit.color}
            `}>
              <span className="text-4xl">{selectedUnit.icon}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`
                  text-xs font-bold px-2 py-0.5 rounded-full text-white
                  bg-gradient-to-r ${selectedUnit.color}
                `}>
                  {selectedUnit.level}
                </span>
                {selectedUnit.milestoneTitle && (
                  <span className="text-xs font-medium text-miro-yellow flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {selectedUnit.milestoneTitle}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedUnit.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedUnit.titleCatalan}
              </p>
            </div>
          </motion.div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {selectedUnit.description}
          </p>
        </div>

        {/* Lessons List */}
        <div className="max-w-2xl mx-auto space-y-3">
          {selectedUnit.lessons.map((lesson, index) => {
            const progress = getLessonProgress(lesson.id);
            const previousLessonCompleted = index === 0 ||
              getLessonProgress(selectedUnit.lessons[index - 1].id)?.completed;
            const lessonUnlocked = isUnlocked && previousLessonCompleted;

            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={progress}
                isLocked={!lessonUnlocked}
                index={index}
                onClick={() => lessonUnlocked && handleStartLesson(lesson.id)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Render Overview
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
              <GraduationCap className="w-8 h-8 text-miro-blue" />
              Learning Path
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Follow a structured curriculum from beginner to advanced
          </p>
        </motion.div>

        {/* Stats Bar */}
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
                  {currentLevel}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Level
                </p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalXP}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  XP Earned
                </p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {getLevelProgress(currentLevel).completed}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lessons Done
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Placement Test Card */}
        {!placementResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Card className="p-6 bg-gradient-to-br from-miro-blue/10 to-miro-red/10 dark:from-miro-blue/20 dark:to-miro-red/20 border-2 border-miro-blue/30 dark:border-miro-blue/50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-miro-blue to-miro-red flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    Find Your Level
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Take a quick placement test to discover where to start your learning journey.
                  </p>
                  <Button
                    onClick={() => setViewMode('placement')}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Start Placement Test
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-300 dark:border-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed at Level
                    </p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">
                      {placementResult.level} ({placementResult.score}%)
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetakePlacement}
                  leftIcon={<RefreshCcw className="w-4 h-4" />}
                >
                  Retake
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Next Lesson Card */}
        {nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-miro-yellow/20 to-amber-100/50 dark:from-miro-yellow/10 dark:to-amber-900/20 border-2 border-miro-yellow/50 dark:border-miro-yellow/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-miro-yellow to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-miro-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-miro-blue dark:text-miro-yellow font-medium">
                    Continue Learning
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {CURRICULUM_UNITS.find(u => u.id === nextLesson.unitId)?.title}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartLesson(nextLesson.lessonId)}
                >
                  Start
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Level Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`
                px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${selectedLevel === 'all'
                  ? 'bg-miro-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              All Levels
            </button>
            {levels.map(level => {
              const progress = getLevelProgress(level);
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`
                    px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all
                    ${selectedLevel === level
                      ? 'bg-miro-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {level}
                  {progress.completed > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      ({progress.completed}/{progress.total})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Skill Tree */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SkillTree
              units={filteredUnits}
              onSelectUnit={handleSelectUnit}
              selectedUnitId={selectedUnit?.id}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
