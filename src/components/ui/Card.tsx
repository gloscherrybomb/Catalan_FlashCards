import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'playful' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-2xl overflow-hidden relative';

  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-card dark:shadow-gray-900/30',
    elevated: 'bg-white dark:bg-gray-800 shadow-card-hover dark:shadow-gray-900/40',
    playful: 'bg-white dark:bg-gray-800 border-3 border-miro-blue dark:border-ink-light/50 shadow-playful',
    glass: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/30 dark:border-gray-700/50',
    bordered: 'bg-white dark:bg-gray-800 border-3 border-miro-blue/20 dark:border-ink-light/20',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? variant === 'playful'
      ? 'cursor-pointer'
      : 'cursor-pointer'
    : '';

  if (hover) {
    const hoverAnimation = variant === 'playful'
      ? { x: -3, y: -3 }
      : { y: -6, scale: 1.01 };

    return (
      <motion.div
        whileHover={hoverAnimation}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={clsx(
          baseStyles,
          variants[variant],
          paddings[padding],
          hoverStyles,
          variant === 'playful' && 'hover:shadow-[9px_9px_0px_0px_rgba(29,53,87,0.9)]',
          className
        )}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  decoration?: 'dot' | 'star' | 'none';
}

export function CardHeader({ children, className, decoration = 'none' }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4 relative', className)}>
      {children}
      {decoration === 'dot' && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-miro-yellow rounded-full" />
      )}
      {decoration === 'star' && (
        <span className="absolute -top-2 -right-2 text-miro-yellow text-lg">✦</span>
      )}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardTitle({ children, className, gradient = false }: CardTitleProps) {
  return (
    <h3
      className={clsx(
        'text-xl font-display font-bold',
        gradient
          ? 'gradient-text'
          : 'text-miro-blue dark:text-ink-light',
        className
      )}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={clsx('text-miro-blue/70 dark:text-ink-light/70', className)}>
      {children}
    </div>
  );
}

// Decorative card corners component
interface DecorativeCardProps {
  children: ReactNode;
  className?: string;
  colors?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
}

export function DecorativeCard({
  children,
  className,
  colors = {
    topLeft: 'bg-miro-red',
    bottomRight: 'bg-miro-yellow',
  },
}: DecorativeCardProps) {
  return (
    <div className={clsx('relative', className)}>
      {/* Corner decorations */}
      {colors.topLeft && (
        <div className={clsx('absolute -top-2 -left-2 w-5 h-5 rounded-full z-10', colors.topLeft)} />
      )}
      {colors.topRight && (
        <div className={clsx('absolute -top-2 -right-2 w-4 h-4 rounded-full z-10', colors.topRight)} />
      )}
      {colors.bottomLeft && (
        <div className={clsx('absolute -bottom-2 -left-2 w-4 h-4 rounded-full z-10', colors.bottomLeft)} />
      )}
      {colors.bottomRight && (
        <div className={clsx('absolute -bottom-2 -right-2 w-5 h-5 rounded-full z-10', colors.bottomRight)} />
      )}
      {children}
    </div>
  );
}
