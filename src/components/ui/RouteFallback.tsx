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
      <div className="flex gap-1.5" aria-hidden="true">
        <span
          className="w-2.5 h-2.5 bg-miro-red rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2.5 h-2.5 bg-miro-yellow rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2.5 h-2.5 bg-miro-green rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
