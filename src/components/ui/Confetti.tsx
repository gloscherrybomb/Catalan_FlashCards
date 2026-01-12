import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  shape: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#FF6B6B', // Primary red
  '#4ECDC4', // Secondary teal
  '#FFE66D', // Accent yellow
  '#95D5B2', // Success green
  '#F9844A', // Warning orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
];

const SHAPES = ['square', 'circle', 'triangle'] as const;

export function Confetti({
  isActive,
  duration = 3000,
  particleCount = 50,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      scale: 0.5 + Math.random() * 0.5,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));
  }, [particleCount]);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, duration, generatePieces, onComplete]);

  const renderShape = (shape: ConfettiPiece['shape'], color: string) => {
    switch (shape) {
      case 'circle':
        return (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        );
      case 'triangle':
        return (
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `10px solid ${color}`,
            }}
          />
        );
      default:
        return (
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: `${piece.y}vh`,
              rotate: piece.rotation,
              scale: piece.scale,
              opacity: 1,
            }}
            animate={{
              y: '120vh',
              rotate: piece.rotation + (Math.random() > 0.5 ? 720 : -720),
              x: `${piece.x + (Math.random() - 0.5) * 30}vw`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
          >
            {renderShape(piece.shape, piece.color)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Celebration burst effect (for achievements)
export function CelebrationBurst({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i / 12) * 360,
        color: COLORS[i % COLORS.length],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: '50%',
              y: '50%',
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `calc(50% + ${Math.cos((particle.angle * Math.PI) / 180) * 100}px)`,
              y: `calc(50% + ${Math.sin((particle.angle * Math.PI) / 180) * 100}px)`,
              scale: 1,
              opacity: 0,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Star burst for perfect answers
export function StarBurst({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1.5, opacity: [0, 1, 0] }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <span className="text-6xl">⭐</span>
    </motion.div>
  );
}
