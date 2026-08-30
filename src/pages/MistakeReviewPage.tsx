import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MistakeReview } from '../components/cards/MistakeReview';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCardStore } from '../stores/cardStore';
import { MISTAKE_CONFIG } from '../config/constants';

/**
 * Review of recent mistakes.
 *
 * MistakeReview was a complete 300-line component with no importer. Every
 * mistake has been recorded in cardStore.mistakeHistory all along - the
 * analytics page aggregates them into patterns - but there was no way to look
 * at the individual mistakes and see what you actually got wrong.
 */

/** How many recent mistakes to show; beyond this it stops being a review. */
const REVIEW_LIMIT = 20;

export function MistakeReviewPage() {
  const navigate = useNavigate();
  const mistakeHistory = useCardStore((state) => state.mistakeHistory);
  const flashcards = useCardStore((state) => state.flashcards);

  const mistakes = useMemo(() => {
    const byId = new Map(flashcards.map(card => [card.id, card]));

    return (
      mistakeHistory
        .slice(-REVIEW_LIMIT)
        .reverse()
        // A mistake whose card has since been deleted has nothing to review.
        .flatMap(record => {
          const flashcard = byId.get(record.cardId);
          if (!flashcard) return [];

          return [
            {
              flashcard,
              direction: record.direction,
              userAnswer: record.userAnswer,
              correctAnswer: record.correctAnswer,
              // MistakeReview distinguishes three kinds; the recorded types are
              // finer-grained, so accent and spelling both read as typos.
              errorType: (record.errorType === 'accent' || record.errorType === 'spelling'
                ? 'typo'
                : 'wrong') as 'wrong' | 'timeout' | 'typo',
            },
          ];
        })
    );
  }, [mistakeHistory, flashcards]);

  const handlePracticeAgain = useCallback(() => {
    // The weakness deck is built from exactly this history, so send them there
    // rather than assembling a second, parallel notion of "cards I got wrong".
    navigate('/study?mode=weakness');
  }, [navigate]);

  if (mistakes.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-2xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
            No mistakes to review
          </h1>
          <p className="text-miro-blue/60 dark:text-ink-light/60 mb-6">
            Nothing has gone wrong recently — or the cards involved have since
            been deleted.
          </p>
          <Button onClick={() => navigate('/analytics')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to analytics
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <MistakeReview
        mistakes={mistakes}
        onComplete={() => navigate('/analytics')}
        onPracticeAgain={handlePracticeAgain}
      />
      <p className="text-center text-xs text-miro-blue/40 dark:text-ink-light/40 mt-6">
        Showing your {mistakes.length} most recent mistakes (last{' '}
        {MISTAKE_CONFIG.MAX_HISTORY_SIZE} are kept).
      </p>
    </div>
  );
}
