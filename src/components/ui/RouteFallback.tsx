import { MiroDotsLoader } from './MiroLoader';

/**
 * Fallback shown while a lazily-loaded route chunk is being fetched.
 *
 * Deliberately quiet: route chunks are small and usually resolve in well under
 * a frame on a warm cache, so an eye-catching spinner would flash distractingly
 * on every navigation. The `delay` class keeps it invisible for the first
 * 300ms and only fades in if the network is genuinely slow.
 */
export function RouteFallback() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center animate-fade-in-delayed"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading page…</span>
      {/* Uses the shared loader rather than a second copy of the same dots. */}
      <MiroDotsLoader />
    </div>
  );
}
