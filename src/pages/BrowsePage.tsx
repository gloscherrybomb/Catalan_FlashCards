import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon, Badge } from '../components/cards/CategoryIcon';
import { MnemonicEditor } from '../components/cards/MnemonicEditor';
import { getMasteryLevel } from '../services/sm2Algorithm';
import type { Flashcard } from '../types/flashcard';

export function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
  const [editingMnemonic, setEditingMnemonic] = useState<Flashcard | null>(null);

  const flashcards = useCardStore((state) => state.flashcards);
  const getProgress = useCardStore((state) => state.getProgress);
  const deleteCard = useCardStore((state) => state.deleteCard);
  const updateCardMnemonic = useCardStore((state) => state.updateCardMnemonic);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(flashcards.map(c => c.category));
    return Array.from(cats).sort();
  }, [flashcards]);

  // Filter cards
  const filteredCards = useMemo(() => {
    return flashcards.filter(card => {
      const matchesSearch =
        !searchQuery ||
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || card.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [flashcards, searchQuery, selectedCategory]);

  const handleDelete = async () => {
    if (cardToDelete) {
      await deleteCard(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'mastered': return 'bg-green-100 text-green-700';
      case 'reviewing': return 'bg-blue-100 text-blue-700';
      case 'learning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cards</h1>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="appearance-none w-full sm:w-48 px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
        <span>{filteredCards.length} cards</span>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Cards list */}
      {filteredCards.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredCards.map((card, index) => {
              const isExpanded = expandedCard === card.id;
              const engToCat = getProgress(card.id, 'english-to-catalan');
              const catToEng = getProgress(card.id, 'catalan-to-english');
              const masteryEng = getMasteryLevel(engToCat);
              const masteryCat = getMasteryLevel(catToEng);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className="overflow-hidden">
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                      className="w-full text-left flex items-center gap-4"
                    >
                      <CategoryIcon category={card.category} word={card.front} size="md" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 truncate">
                            {card.front}
                          </p>
                          {card.gender && (
                            <Badge
                              text={card.gender === 'masculine' ? 'M' : 'F'}
                              variant={card.gender}
                            />
                          )}
                        </div>
                        <p className="text-gray-500 truncate">{card.back}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${getMasteryColor(masteryEng)}`}>
                          {masteryEng}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-gray-100">
                            {card.notes && (
                              <p className="text-sm text-gray-600 mb-4 italic">
                                {card.notes}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">English → Català</p>
                                <span className={`px-2 py-0.5 rounded text-xs ${getMasteryColor(masteryEng)}`}>
                                  {masteryEng}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {engToCat.totalReviews} reviews
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Català → English</p>
                                <span className={`px-2 py-0.5 rounded text-xs ${getMasteryColor(masteryCat)}`}>
                                  {masteryCat}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {catToEng.totalReviews} reviews
                                </p>
                              </div>
                            </div>

                            {/* User mnemonic display */}
                            {card.userMnemonic && (
                              <div className="mb-4 p-3 bg-miro-yellow/10 dark:bg-miro-yellow/5 rounded-lg border border-miro-yellow/30">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-miro-yellow mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Memory Hook</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{card.userMnemonic}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between gap-2">
                              <button
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-miro-yellow hover:bg-miro-yellow/10 rounded-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMnemonic(card);
                                }}
                              >
                                <Lightbulb size={16} />
                                {card.userMnemonic ? 'Edit Mnemonic' : 'Add Mnemonic'}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => setCardToDelete(card)}
                                leftIcon={<Trash2 size={16} />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {searchQuery || selectedCategory ? 'No matching cards' : 'No cards yet'}
          </h2>
          <p className="text-gray-500">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Import some flashcards to get started'}
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        title="Delete Card?"
      >
        {cardToDelete && (
          <div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this card? This will also remove
              all learning progress.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-800">{cardToDelete.front}</p>
              <p className="text-gray-500">{cardToDelete.back}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setCardToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                fullWidth
                onClick={handleDelete}
              >
                Delete Card
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mnemonic editor modal */}
      <AnimatePresence>
        {editingMnemonic && (
          <MnemonicEditor
            catalanWord={editingMnemonic.back}
            englishWord={editingMnemonic.front}
            currentMnemonic={editingMnemonic.userMnemonic}
            onSave={(mnemonic) => updateCardMnemonic(editingMnemonic.id, mnemonic)}
            onClose={() => setEditingMnemonic(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
