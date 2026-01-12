import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'playful' | 'glass';
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
  const baseStyles = 'rounded-2xl overflow-hidden';

  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/40',
    playful: 'bg-white dark:bg-gray-800 shadow-playful',
    glass: 'glass border border-white/20 dark:border-gray-700/50',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={clsx(
          baseStyles,
          variants[variant],
          paddings[padding],
          'cursor-pointer',
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
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={clsx('text-xl font-bold text-gray-800 dark:text-white', className)}>
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
    <div className={clsx('text-gray-600 dark:text-gray-300', className)}>
      {children}
    </div>
  );
}
