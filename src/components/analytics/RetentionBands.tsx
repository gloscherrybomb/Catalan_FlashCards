import { useMemo } from 'react';
import { Brain, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import type { CardProgress } from '../../types/flashcard';
import { retentionByStage } from '../../services/reviewForecast';
import { Card } from '../ui/Card';

/**
 * Recall accuracy split by scheduling stage.
 *
 * Three numbers, so this is deliberately not a chart - a three-slice pie or a
 * three-bar plot would add chrome without adding information. Labelled bars
 * carry the magnitude, the percentage and the sample size in one line each.
 *
 * On colour: the bar uses a single hue because there is one measure. Health is
 * carried by an icon and a word, not by the fill. A good/warning/bad hue trio
 * was the obvious first choice and was rejected on evidence - validated against
 * this app's dark surface, every orange that sat inside the required lightness
 * band collapsed toward the red (normal-vision ΔE 13-15, below the floor of 15).
 * Red and orange are adjacent hues; forcing the trio would have shipped two
 * statuses that a full-colour reader cannot reliably tell apart.
 */
const BAR = '#2A9D8F';

/** SM-2 targets roughly 90% on mature cards; materially below that is a signal. */
const HEALTHY_RETENTION = 85;
const LOW_RETENTION = 70;
/** Below this many reviews a percentage is noise, not a measurement. */
const MIN_MEANINGFUL_REVIEWS = 10;

interface RetentionBandsProps {
  cardProgress: Map<string, CardProgress>;
}

export function RetentionBands({ cardProgress }: RetentionBandsProps) {
  const bands = useMemo(() => retentionByStage(cardProgress), [cardProgress]);
  const hasData = bands.some(b => b.reviews > 0);

  return (
    <Card>
      <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light mb-1 flex items-center gap-2">
        <Brain className="w-5 h-5" aria-hidden="true" />
        Recall by stage
      </h2>
      <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-5">
        One overall accuracy figure blends a card you saw yesterday with one on a
        six-month interval. Splitting by stage shows where recall is actually leaking.
      </p>

      {hasData ? (
        <ul className="space-y-4">
          {bands.map(band => {
            const status = describe(band.retention, band.reviews);
            const StatusIcon = status.icon;

            return (
              <li key={band.stage}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="font-semibold text-miro-blue dark:text-ink-light">
                    {band.stage}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className={`flex items-center gap-1 ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {status.label}
                    </span>
                    <strong className="text-miro-blue dark:text-ink-light tabular-nums">
                      {band.reviews > 0 ? `${band.retention}%` : '—'}
                    </strong>
                  </span>
                </div>

                <div
                  className="h-2 rounded-full bg-miro-blue/10 dark:bg-ink-light/10 overflow-hidden"
                  role="img"
                  aria-label={`${band.stage}: ${band.retention}% recall across ${band.reviews} reviews`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${band.reviews > 0 ? band.retention : 0}%`, background: BAR }}
                  />
                </div>

                <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mt-1">
                  {band.cards} {band.cards === 1 ? 'card' : 'cards'} · {band.reviews}{' '}
                  {band.reviews === 1 ? 'review' : 'reviews'}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="h-32 flex items-center justify-center text-center text-miro-blue/50 dark:text-ink-light/50">
          No reviews recorded yet.
        </div>
      )}
    </Card>
  );
}

function describe(retention: number, reviews: number) {
  if (reviews < MIN_MEANINGFUL_REVIEWS) {
    return {
      label: 'Too few reviews',
      icon: HelpCircle,
      className: 'text-miro-blue/50 dark:text-ink-light/50',
    };
  }
  if (retention >= HEALTHY_RETENTION) {
    return { label: 'Healthy', icon: CheckCircle2, className: 'text-miro-green' };
  }
  if (retention >= LOW_RETENTION) {
    return { label: 'Watch', icon: AlertTriangle, className: 'text-miro-orange' };
  }
  return { label: 'Low', icon: AlertTriangle, className: 'text-miro-red' };
}
