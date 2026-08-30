import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Target,
  Check,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlacementTest } from '../curriculum/PlacementTest';
import { useCardStore } from '../../stores/cardStore';
import { useUserStore } from '../../stores/userStore';
import { useCurriculumStore } from '../../stores/curriculumStore';
import { STARTER_VOCABULARY_COUNT } from '../../data/starterVocabulary';
import { markOnboardingComplete } from '../../services/onboarding';
import { logger } from '../../services/logger';
import type { CEFRLevel } from '../../data/curriculum';

/**
 * One-time introduction for a new learner.
 *
 * Four short steps: what this is, what you already know, how much you want to
 * do per day, and then a starting deck. Every step is skippable, and skipping
 * lands on the same place as finishing - an introduction that can trap someone
 * is worse than none.
 *
 * The experience question exists to route people away from unit 1 when unit 1
 * is wrong for them. Previously the placement test existed but nothing offered
 * it, so every learner started from "hola" whatever their background.
 */

type Step = 'welcome' | 'experience' | 'placement' | 'goal' | 'ready';

type Experience = 'new' | 'some' | 'romance';

const DAILY_GOALS = [
  { cards: 10, label: '10 cards', detail: 'About 5 minutes' },
  { cards: 20, label: '20 cards', detail: 'About 10 minutes' },
  { cards: 40, label: '40 cards', detail: 'About 20 minutes' },
];

interface OnboardingFlowProps {
  onFinish: () => void;
}

export function OnboardingFlow({ onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [dailyGoal, setDailyGoal] = useState(20);
  const [startingLevel, setStartingLevel] = useState<CEFRLevel>('A1');
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStarterVocabulary = useCardStore((state) => state.loadStarterVocabulary);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const setCurrentLevel = useCurriculumStore((state) => state.setCurrentLevel);
  const startPlacementTest = useCurriculumStore((state) => state.startPlacementTest);

  const finish = useCallback(async () => {
    setIsFinishing(true);
    setLoadError(null);

    try {
      await updateSettings({ dailyGoal });
      setCurrentLevel(startingLevel);
      await loadStarterVocabulary();
      markOnboardingComplete();
      onFinish();
    } catch (error) {
      // Never strand someone inside the introduction. Mark it done, tell them
      // what failed, and let them into the app - the starter deck is one tap
      // away on the home page.
      logger.error('Onboarding setup failed', 'Onboarding', { error: String(error) });
      markOnboardingComplete();
      setLoadError(
        "Your settings are saved, but the starter deck didn't load. You can add it from the home page."
      );
      setIsFinishing(false);
    }
  }, [dailyGoal, startingLevel, updateSettings, setCurrentLevel, loadStarterVocabulary, onFinish]);

  const skip = useCallback(() => {
    markOnboardingComplete();
    onFinish();
  }, [onFinish]);

  const chooseExperience = (experience: Experience) => {
    if (experience === 'new') {
      // A complete beginner does not need testing to find out they are a
      // beginner; sending them through twelve questions they cannot answer is
      // a discouraging way to start.
      setStartingLevel('A1');
      setStep('goal');
      return;
    }
    startPlacementTest();
    setStep('placement');
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <Panel key="welcome">
              <div className="relative w-20 h-20 mx-auto mb-6" aria-hidden="true">
                <div className="absolute inset-0 bg-miro-yellow blob opacity-70" />
                <div className="relative w-full h-full bg-miro-red blob flex items-center justify-center shadow-playful-sm">
                  <span className="text-white font-display font-bold text-3xl">C</span>
                </div>
              </div>

              <h1 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light text-center mb-2">
                Benvingut!
              </h1>
              <p className="text-center text-miro-blue/70 dark:text-ink-light/70 mb-8">
                Learn Catalan with spaced repetition, a 20-unit course, stories,
                and conversation practice. Two minutes of setup and you can start.
              </p>

              <Button fullWidth size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} onClick={() => setStep('experience')}>
                Get started
              </Button>
              <SkipLink onClick={skip} />
            </Panel>
          )}

          {step === 'experience' && (
            <Panel key="experience">
              <StepHeading
                icon={<GraduationCap className="w-6 h-6" aria-hidden="true" />}
                title="How much Catalan do you have?"
                subtitle="This decides where you start. You can change it later."
              />

              <div className="space-y-3">
                <ChoiceButton
                  title="I'm starting from scratch"
                  detail="Begin at unit 1 with greetings and the basics"
                  onClick={() => chooseExperience('new')}
                />
                <ChoiceButton
                  title="I know some Catalan"
                  detail="Take a short placement test to find your level"
                  onClick={() => chooseExperience('some')}
                />
                <ChoiceButton
                  title="I speak Spanish, French or Italian"
                  detail="Much will look familiar — the test will place you fairly"
                  onClick={() => chooseExperience('romance')}
                />
              </div>
              <SkipLink onClick={skip} />
            </Panel>
          )}

          {step === 'placement' && (
            <motion.div
              key="placement"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <PlacementTest
                onComplete={(result) => {
                  setStartingLevel(result.level);
                  setStep('goal');
                }}
                onCancel={() => {
                  // Cancelling the test is not cancelling setup.
                  setStartingLevel('A1');
                  setStep('goal');
                }}
              />
            </motion.div>
          )}

          {step === 'goal' && (
            <Panel key="goal">
              <StepHeading
                icon={<Target className="w-6 h-6" aria-hidden="true" />}
                title="How much per day?"
                subtitle="A goal you actually hit beats an ambitious one you don't."
              />

              <div className="space-y-3 mb-6">
                {DAILY_GOALS.map((option) => {
                  const selected = dailyGoal === option.cards;
                  return (
                    <button
                      key={option.cards}
                      type="button"
                      onClick={() => setDailyGoal(option.cards)}
                      aria-pressed={selected}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                        selected
                          ? 'border-miro-red bg-miro-red/5'
                          : 'border-miro-blue/15 dark:border-ink-light/15 hover:border-miro-red/40'
                      }`}
                    >
                      <span>
                        <span className="block font-semibold text-miro-blue dark:text-ink-light">
                          {option.label}
                        </span>
                        <span className="block text-sm text-miro-blue/60 dark:text-ink-light/60">
                          {option.detail}
                        </span>
                      </span>
                      {selected && <Check className="w-5 h-5 text-miro-red flex-shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              <Button fullWidth size="lg" onClick={() => setStep('ready')} rightIcon={<ArrowRight className="w-5 h-5" />}>
                Continue
              </Button>
              <SkipLink onClick={skip} />
            </Panel>
          )}

          {step === 'ready' && (
            <Panel key="ready">
              <StepHeading
                icon={<BookOpen className="w-6 h-6" aria-hidden="true" />}
                title="Ready to start"
                subtitle={`We'll add ${STARTER_VOCABULARY_COUNT} starter words so you have something to study straight away.`}
              />

              <ul className="space-y-2 mb-6 text-sm text-miro-blue/70 dark:text-ink-light/70">
                <Summary label="Starting level" value={startingLevel} />
                <Summary label="Daily goal" value={`${dailyGoal} cards`} />
                <Summary label="Starter vocabulary" value={`${STARTER_VOCABULARY_COUNT} words`} />
              </ul>

              {loadError && (
                <p role="alert" className="mb-4 text-sm text-center text-miro-red">
                  {loadError}
                </p>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={loadError ? onFinish : finish}
                isLoading={isFinishing}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {loadError ? 'Continue to the app' : 'Start learning'}
              </Button>
              {!loadError && <SkipLink onClick={skip} label="Set up later" />}
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-7">{children}</Card>
    </motion.div>
  );
}

function StepHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="w-12 h-12 rounded-xl bg-miro-blue/10 dark:bg-ink-light/10 flex items-center justify-center text-miro-blue dark:text-ink-light mb-3">
        {icon}
      </div>
      <h1 className="text-2xl font-display font-bold text-miro-blue dark:text-ink-light mb-1">
        {title}
      </h1>
      <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">{subtitle}</p>
    </div>
  );
}

function ChoiceButton({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-miro-blue/15 dark:border-ink-light/15 text-left hover:border-miro-red/50 hover:bg-miro-red/5 transition-colors"
    >
      <span className="flex-1">
        <span className="block font-semibold text-miro-blue dark:text-ink-light">{title}</span>
        <span className="block text-sm text-miro-blue/60 dark:text-ink-light/60">{detail}</span>
      </span>
      <ArrowRight className="w-4 h-4 text-miro-blue/40 dark:text-ink-light/40 flex-shrink-0" aria-hidden="true" />
    </button>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span>{label}</span>
      <strong className="text-miro-blue dark:text-ink-light">{value}</strong>
    </li>
  );
}

function SkipLink({ onClick, label = 'Skip for now' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full mt-4 text-sm text-miro-blue/50 dark:text-ink-light/50 hover:text-miro-blue dark:hover:text-ink-light transition-colors"
    >
      {label}
    </button>
  );
}
