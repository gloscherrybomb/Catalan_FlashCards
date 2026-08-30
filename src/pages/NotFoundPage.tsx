import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

/**
 * Catch-all route. Previously an unknown URL rendered an empty shell with no
 * explanation and no way back, which looked like the app had crashed.
 */
export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-miro-yellow/40 blob" />
        <div className="relative w-full h-full bg-miro-red blob flex items-center justify-center shadow-playful-sm">
          <Compass className="w-11 h-11 text-white" aria-hidden="true" />
        </div>
      </div>

      <h1 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
        Aquesta pàgina no existeix
      </h1>
      <p className="text-miro-blue/60 dark:text-ink-light/60 mb-1">
        This page doesn&rsquo;t exist.
      </p>
      <p className="text-sm text-miro-blue/50 dark:text-ink-light/50 mb-8">
        The link may be out of date, or the address mistyped.
      </p>

      <Link to="/">
        <Button leftIcon={<Home className="w-4 h-4" />}>Back to home</Button>
      </Link>
    </div>
  );
}
