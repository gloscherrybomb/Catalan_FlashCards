import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'ghost' | 'outline' | 'playful';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-miro-yellow focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-miro-red text-white hover:bg-red-600 shadow-playful-sm hover:shadow-playful dark:shadow-miro-blue/50',
    secondary: 'bg-miro-green text-white hover:bg-emerald-600 shadow-playful-sm hover:shadow-playful dark:shadow-miro-blue/50',
    accent: 'bg-miro-yellow text-miro-blue hover:bg-yellow-400 shadow-playful-sm hover:shadow-playful',
    success: 'bg-miro-green text-white hover:bg-emerald-600 shadow-playful-sm hover:shadow-playful',
    warning: 'bg-miro-orange text-white hover:bg-orange-600 shadow-playful-sm hover:shadow-playful',
    ghost: 'bg-transparent text-miro-blue dark:text-ink-light hover:bg-miro-yellow/20 focus-visible:ring-miro-blue',
    outline: 'bg-transparent border-3 border-miro-blue dark:border-ink-light text-miro-blue dark:text-ink-light hover:bg-miro-blue hover:text-white dark:hover:bg-ink-light dark:hover:text-miro-black',
    playful: 'bg-white dark:bg-gray-800 text-miro-blue dark:text-ink-light border-3 border-miro-blue dark:border-ink-light shadow-playful hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(29,53,87,0.9)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2',
    xl: 'px-9 py-4 text-xl gap-3',
  };

  const hoverAnimation = variant === 'playful'
    ? {}
    : { scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 };

  const tapAnimation = variant === 'playful'
    ? { x: 2, y: 2 }
    : { scale: disabled ? 1 : 0.98 };

  return (
    <motion.button
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-3 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
