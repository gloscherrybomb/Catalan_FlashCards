import {
  Activity, Award, Ban, Baby, Beaker, Bird, Book, BookOpen, Brain, Briefcase,
  Building2, Bus, Calendar, Camera, Car, Carrot, Castle, Cat, CheckCircle2, Church,
  Clapperboard, Clock, Compass, Construction, CornerDownLeft, Coffee, Crown, Croissant,
  Diamond, Dog, Drama, Droplet, Dumbbell, Egg, Euro, FileText, Flag, Flame, Flower2,
  Footprints, Frown, Gem, Globe, GraduationCap, Handshake, Hash, Heart, HelpCircle,
  Home, Hospital, Hotel, Info, Key, Keyboard, Landmark, Laptop, Laugh, Layers, Leaf,
  Library, Lightbulb, Link, Luggage, Mailbox, Map, Megaphone, Meh, MessageCircle,
  Mic, Microscope, Moon, Mountain, Newspaper, Palette, PartyPopper, Pencil, PersonStanding,
  Pill, Puzzle, Radio, RefreshCw, Rocket, Ruler, Salad, Scale, Search, Shapes, Shirt,
  ShoppingCart, SkipBack, SkipForward, Smartphone, Smile, Snowflake, Soup, Sparkles,
  Speech, Sprout, Star, Stethoscope, Sun, Sunrise, Swords, Target, ThumbsUp, Ticket,
  TrainFront, Trees, TrendingUp, Trophy, Type, Umbrella, User, Users, Utensils, Volume2,
  RotateCcw, TrendingDown, Check,
  Wallet, Wand2, Waves, Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * The app's icon vocabulary.
 *
 * Everything used to be an emoji in a string field - 530 of them across 41
 * files. Emoji are drawn by the operating system, so the same card looked
 * different on a Mac, a Pixel and a Windows laptop; they ignore the Miró
 * palette entirely; they sat oddly beside the lucide icons already used in the
 * navigation; and a screen reader announces them literally, so a unit tile read
 * out as "briefcase" before its own title.
 *
 * Data now stores a semantic name - `icon: 'work'` - and this resolves it. The
 * indirection is the point: the name says what the thing IS, so the drawing can
 * change without touching thirty data files, and an unknown name degrades to a
 * neutral dot rather than a missing-glyph box.
 */
const GLYPHS = {
  // Course units
  work: Briefcase, health: Stethoscope, home: Home, clothes: Shirt, study: GraduationCap,
  sport: Activity, character: Smile, cooking: Soup, nature: Leaf, technology: Laptop,
  money: Euro, travel: Luggage, city: Building2, relationships: Heart, measure: Ruler,
  media: Newspaper, world: Globe, society: Landmark, history: Castle, arts: Palette,
  science: Microscope, economy: TrendingUp, problems: Puzzle, attitudes: Brain,
  connectors: Link, idioms: MessageCircle, map: Map, memories: Camera, language: Type,
  plans: Sparkles,

  // Grammar and lessons
  grammar: BookOpen, vocabulary: Library, exercise: Pencil, rule: Scale, verb: Zap,
  pronoun: Users, preposition: Link, article: Layers, adjective: Palette,
  tense: Clock, imperative: Megaphone, subjunctive: Moon, passive: RefreshCw,
  reported: Speech, adverb: Footprints, comparison: Scale, question: HelpCircle,
  negation: Ban, numbers: Hash, shape: Shapes,

  // Places and things
  cafe: Coffee, church: Church, mountain: Mountain, beach: Umbrella, hospital: Hospital,
  bank: Landmark, hotel: Hotel, market: ShoppingCart, museum: Landmark,
  neighbourhood: Home, construction: Construction, post: Mailbox, restaurant: Utensils,
  bread: Croissant, vegetable: Carrot, salad: Salad, sunrise: Sunrise, sea: Waves,
  weather: Sun, snow: Snowflake, water: Droplet, tree: Trees, plant: Sprout,
  flower: Flower2, animal: Bird, dog: Dog, cat: Cat, egg: Egg, dragon: Swords,

  // Transport
  metro: TrainFront, bus: Bus, taxi: Car, rocket: Rocket, walk: PersonStanding,

  // People and social
  person: User, people: Users, family: Baby, greeting: Handshake, conversation: Speech,
  speaking: Mic, listening: Volume2, teacher: GraduationCap, podcast: Radio,

  // Progress and reward
  streak: Flame, trophy: Trophy, star: Star, crown: Crown, gem: Gem, medal: Award,
  target: Target, perfect: Star, celebrate: PartyPopper, applause: ThumbsUp,
  strength: Dumbbell, sparkle: Wand2, idea: Lightbulb, calendar: Calendar,
  check: CheckCircle2, flag: Flag, compass: Compass, wallet: Wallet, ticket: Ticket,
  key: Key, gift: Gem, shop: ShoppingCart,

  // Reading and media
  book: Book, read: BookOpen, story: FileText, film: Clapperboard, theatre: Drama,
  photo: Camera, phone: Smartphone, keyboard: Keyboard, search: Search,
  medicine: Pill, gym: Dumbbell, science_lab: Beaker, diamond: Diamond, info: Info,

  // Self-rating after a card. Distinct shapes rather than four similar faces,
  // which were hard to tell apart at 24px.
  again: RotateCcw, hard: TrendingDown, good: Check, easy: Zap,

  // Reactions
  happy: Laugh, neutral: Meh, confused: Frown, thinking: Brain, tap: Target,
  next: SkipForward, previous: SkipBack, undo: CornerDownLeft,
} satisfies Record<string, LucideIcon>;

export type GlyphName = keyof typeof GLYPHS;

/** Miró palette tiles. Each pairs a tinted ground with a legible foreground. */
const TONES = {
  red: 'bg-miro-red/10 text-miro-red dark:bg-miro-red/20',
  yellow: 'bg-miro-yellow/15 text-miro-orange dark:bg-miro-yellow/20 dark:text-miro-yellow',
  blue: 'bg-miro-blue/10 text-miro-blue dark:bg-ink-light/10 dark:text-ink-light',
  green: 'bg-miro-green/10 text-miro-green dark:bg-miro-green/20',
  orange: 'bg-miro-orange/10 text-miro-orange dark:bg-miro-orange/20',
  neutral: 'bg-miro-blue/5 text-miro-blue/70 dark:bg-ink-light/5 dark:text-ink-light/70',
} as const;

export type GlyphTone = keyof typeof TONES;

const SIZES = {
  sm: { box: 'w-8 h-8 rounded-lg', px: 16 },
  md: { box: 'w-11 h-11 rounded-xl', px: 22 },
  lg: { box: 'w-14 h-14 rounded-2xl', px: 28 },
  xl: { box: 'w-16 h-16 rounded-2xl', px: 32 },
} as const;

/** Deterministic tone from the name, so a unit keeps its colour between renders. */
const TONE_CYCLE: GlyphTone[] = ['red', 'yellow', 'green', 'blue', 'orange'];
export function toneFor(name: string): GlyphTone {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TONE_CYCLE[hash % TONE_CYCLE.length];
}

export function isGlyphName(name: string): name is GlyphName {
  return name in GLYPHS;
}

interface GlyphProps {
  name: string;
  size?: keyof typeof SIZES;
  /** Omit for a bare icon; pass a tone (or 'auto') to draw it on a tile. */
  tone?: GlyphTone | 'auto';
  /** Describe the icon only when it is the sole carrier of meaning. */
  label?: string;
  className?: string;
}

export function Glyph({ name, size = 'md', tone, label, className = '' }: GlyphProps) {
  // An unrecognised name draws a neutral dot rather than breaking the layout.
  const Icon = isGlyphName(name) ? GLYPHS[name] : Info;
  const { box, px } = SIZES[size];

  const icon = (
    <Icon
      size={px}
      strokeWidth={2}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={tone ? '' : className}
    />
  );

  if (!tone) return icon;

  const resolved = tone === 'auto' ? toneFor(name) : tone;
  return (
    <span className={`${box} ${TONES[resolved]} flex items-center justify-center flex-shrink-0 ${className}`}>
      {icon}
    </span>
  );
}
