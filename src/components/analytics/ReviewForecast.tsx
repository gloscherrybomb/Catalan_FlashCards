import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CalendarClock } from 'lucide-react';
import type { CardProgress } from '../../types/flashcard';
import { buildReviewForecast, summariseWorkload } from '../../services/reviewForecast';
import { Card } from '../ui/Card';

/**
 * Chart colours.
 *
 * One measure, so one hue - a second colour here would imply a second series
 * that does not exist. Today gets the accent because "what do I owe now" is the
 * question the chart is opened to answer; that is emphasis, not a new category,
 * and it is labelled in the axis and the tooltip so it never reads as
 * colour-alone.
 *
 * Both were checked with the palette validator against this app's light
 * (#FFF8E7) and dark (#0D0D0D) surfaces: lightness band, chroma floor, CVD
 * separation (ΔE 10.8 deutan), normal-vision floor (30.6) and >=3:1 contrast all
 * pass in both modes.
 */
const BAR = '#2A9D8F';
const BAR_TODAY = '#E63946';

interface ReviewForecastProps {
  cardProgress: Map<string, CardProgress>;
  totalCardDirections: number;
  days?: number;
}

export function ReviewForecast({
  cardProgress,
  totalCardDirections,
  days = 14,
}: ReviewForecastProps) {
  const forecast = useMemo(
    () => buildReviewForecast(cardProgress, days),
    [cardProgress, days]
  );
  const workload = useMemo(
    () => summariseWorkload(cardProgress, totalCardDirections, days),
    [cardProgress, totalCardDirections, days]
  );

  const hasScheduledWork = forecast.some(d => d.due > 0);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
          <CalendarClock className="w-5 h-5" aria-hidden="true" />
          Review forecast
        </h2>
      </div>
      <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-4">
        Reviews falling due over the next {days} days. Intervals compound, so the
        load arrives in waves — seeing a heavy day coming is what lets you spread it.
      </p>

      {hasScheduledWork ? (
        <>
          <div className="h-56" role="img" aria-label={forecastSummaryText(forecast)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                {/* Recessive grid: horizontal only, so it reads as a reference
                    rather than competing with the bars. */}
                <CartesianGrid vertical={false} stroke="currentColor" className="text-miro-blue/10 dark:text-ink-light/10" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-miro-blue/60 dark:text-ink-light/60"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-miro-blue/60 dark:text-ink-light/60"
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', className: 'text-miro-blue/5' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const day = payload[0].payload as (typeof forecast)[number];
                    return (
                      <div className="rounded-xl bg-white dark:bg-gray-900 border border-miro-blue/15 dark:border-ink-light/15 px-3 py-2 shadow-lg">
                        <p className="text-sm font-semibold text-miro-blue dark:text-ink-light">
                          {day.isToday ? 'Today' : day.label}
                        </p>
                        <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                          {day.due} {day.due === 1 ? 'review' : 'reviews'}
                          {day.isToday && ' (includes anything overdue)'}
                        </p>
                      </div>
                    );
                  }}
                />
                {/* 4px rounded data-end, anchored to the baseline. */}
                <Bar dataKey="due" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {forecast.map(day => (
                    <Cell key={day.date} fill={day.isToday ? BAR_TODAY : BAR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_TODAY }} aria-hidden="true" />
              <span className="text-miro-blue/70 dark:text-ink-light/70">
                Today: <strong className="text-miro-blue dark:text-ink-light">{workload.dueToday}</strong>
              </span>
            </span>
            <span className="text-miro-blue/70 dark:text-ink-light/70">
              Daily average: <strong className="text-miro-blue dark:text-ink-light">{workload.dailyAverage}</strong>
            </span>
            {workload.peak && workload.peak.due > workload.dailyAverage && (
              <span className="text-miro-blue/70 dark:text-ink-light/70">
                Busiest: <strong className="text-miro-blue dark:text-ink-light">{workload.peak.label}</strong> ({workload.peak.due})
              </span>
            )}
            {workload.untouched > 0 && (
              <span className="text-miro-blue/70 dark:text-ink-light/70">
                Not yet started: <strong className="text-miro-blue dark:text-ink-light">{workload.untouched}</strong>
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-center gap-1">
          <p className="text-miro-blue/60 dark:text-ink-light/60">
            Nothing scheduled yet.
          </p>
          <p className="text-sm text-miro-blue/50 dark:text-ink-light/50">
            Review some cards and their next due dates will appear here.
          </p>
        </div>
      )}
    </Card>
  );
}

/** Screen-reader summary, so the chart is not shape-only. */
function forecastSummaryText(forecast: ReturnType<typeof buildReviewForecast>): string {
  const total = forecast.reduce((sum, d) => sum + d.due, 0);
  const busiest = forecast.reduce((worst, d) => (d.due > worst.due ? d : worst), forecast[0]);
  return (
    `Review forecast: ${total} reviews due over the next ${forecast.length} days. ` +
    `${forecast[0].due} due today. Busiest day ${busiest.label} with ${busiest.due}.`
  );
}
