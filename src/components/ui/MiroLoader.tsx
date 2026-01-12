import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface MiroLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * A playful loader component matching the Miro-inspired design system.
 * Features organic blob shapes and the brand color palette.
 */
export function MiroLoader({ size = 'md', className, label = 'Loading...' }: MiroLoaderProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', blob: 'w-2 h-2' },
    md: { container: 'w-12 h-12', blob: 'w-3 h-3' },
    lg: { container: 'w-16 h-16', blob: 'w-4 h-4' },
  };

  const colors = ['bg-miro-red', 'bg-miro-yellow', 'bg-miro-green', 'bg-miro-blue'];

  return (
    <div
      className={clsx('flex flex-col items-center gap-3', className)}
      role="status"
      aria-label={label}
    >
      <div className={clsx('relative', sizes[size].container)}>
        {/* Animated blobs in orbit */}
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className={clsx(
              'absolute rounded-full',
              sizes[size].blob,
              color
            )}
            style={{
              top: '50%',
              left: '50%',
              marginTop: `-${parseInt(sizes[size].blob.split('-')[1]) / 2}px`,
              marginLeft: `-${parseInt(sizes[size].blob.split('-')[1]) / 2}px`,
            }}
            animate={{
              x: [
                Math.cos((index * Math.PI) / 2) * 16,
                Math.cos((index * Math.PI) / 2 + Math.PI / 2) * 16,
                Math.cos((index * Math.PI) / 2 + Math.PI) * 16,
                Math.cos((index * Math.PI) / 2 + (3 * Math.PI) / 2) * 16,
                Math.cos((index * Math.PI) / 2) * 16,
              ],
              y: [
                Math.sin((index * Math.PI) / 2) * 16,
                Math.sin((index * Math.PI) / 2 + Math.PI / 2) * 16,
                Math.sin((index * Math.PI) / 2 + Math.PI) * 16,
                Math.sin((index * Math.PI) / 2 + (3 * Math.PI) / 2) * 16,
                Math.sin((index * Math.PI) / 2) * 16,
              ],
              scale: [1, 1.2, 1, 0.8, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Center blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-miro-cream dark:bg-miro-black rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.75, repeat: Infinity }}
        />
      </div>

      {/* Accessible text for screen readers */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * A simpler bouncing dots loader for inline use.
 */
export function MiroDotsLoader({ className }: { className?: string }) {
  return (
    <div
      className={clsx('flex items-center gap-1', className)}
      role="status"
      aria-label="Loading"
    >
      {['bg-miro-red', 'bg-miro-yellow', 'bg-miro-green'].map((color, index) => (
        <motion.span
          key={index}
          className={clsx('w-2 h-2 rounded-full', color)}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/**
 * A full-page loading overlay with the Miro loader.
 */
export function MiroLoaderOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas/90 dark:bg-canvas-dark/90 backdrop-blur-sm"
    >
      <MiroLoader size="lg" label={message} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-miro-blue/60 dark:text-ink-light/60 font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
