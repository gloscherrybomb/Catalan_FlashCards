import {
  BookOpen,
  Layers,
  Palette,
  Hand,
  MapPin,
  Heart,
  Zap,
  Star,
  Home,
  Car,
  Apple,
  Dog,
  User,
  type LucideIcon,
} from 'lucide-react';

// Category to icon mapping
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Verbs': Zap,
  'Articles': Layers,
  'Nouns': BookOpen,
  'Adjectives': Palette,
  'Possessives': Hand,
  'Locations': MapPin,
  'Conditions': Heart,
  'Vocabulary': Star,
};

// Specific word icons for common words
const WORD_ICONS: Record<string, LucideIcon> = {
  'house': Home,
  'casa': Home,
  'car': Car,
  'cotxe': Car,
  'apple': Apple,
  'poma': Apple,
  'dog': Dog,
  'gos': Dog,
  'student': User,
  'estudiant': User,
};

// Colors for different categories
const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  'Verbs': { bg: 'bg-blue-100', icon: 'text-blue-600' },
  'Articles': { bg: 'bg-purple-100', icon: 'text-purple-600' },
  'Nouns': { bg: 'bg-green-100', icon: 'text-green-600' },
  'Adjectives': { bg: 'bg-pink-100', icon: 'text-pink-600' },
  'Possessives': { bg: 'bg-orange-100', icon: 'text-orange-600' },
  'Locations': { bg: 'bg-teal-100', icon: 'text-teal-600' },
  'Conditions': { bg: 'bg-red-100', icon: 'text-red-600' },
  'Vocabulary': { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
};

interface CategoryIconProps {
  category: string;
  word?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryIcon({ category, word, size = 'md' }: CategoryIconProps) {
  // Try to find a specific word icon first
  let Icon = CATEGORY_ICONS[category] || Star;

  if (word) {
    const normalizedWord = word.toLowerCase().split(' ')[0];
    if (WORD_ICONS[normalizedWord]) {
      Icon = WORD_ICONS[normalizedWord];
    }
  }

  const colors = CATEGORY_COLORS[category] || { bg: 'bg-gray-100', icon: 'text-gray-600' };

  const sizes = {
    sm: { container: 'w-8 h-8', icon: 16 },
    md: { container: 'w-12 h-12', icon: 24 },
    lg: { container: 'w-16 h-16', icon: 32 },
  };

  const { container, icon } = sizes[size];

  return (
    <div className={`${container} ${colors.bg} rounded-xl flex items-center justify-center`}>
      <Icon size={icon} className={colors.icon} />
    </div>
  );
}

// SVG-based decorative icons for cards
export function CardDecoration({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category]?.icon.replace('text-', '') || 'gray-600';

  return (
    <svg
      className="absolute top-0 right-0 w-32 h-32 opacity-10"
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle cx="80" cy="20" r="30" fill="currentColor" className={`text-${color}`} />
      <circle cx="60" cy="40" r="20" fill="currentColor" className={`text-${color}`} />
      <circle cx="90" cy="50" r="15" fill="currentColor" className={`text-${color}`} />
    </svg>
  );
}

// Badge component for gender/category indicators
interface BadgeProps {
  text: string;
  variant?: 'masculine' | 'feminine' | 'neutral';
}

export function Badge({ text, variant = 'neutral' }: BadgeProps) {
  const variants = {
    masculine: 'bg-blue-100 text-blue-700',
    feminine: 'bg-pink-100 text-pink-700',
    neutral: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${variants[variant]}`}>
      {text}
    </span>
  );
}
