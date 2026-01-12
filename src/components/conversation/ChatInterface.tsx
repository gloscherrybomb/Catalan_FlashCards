import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ChevronLeft,
  Lightbulb,
  Eye,
  EyeOff,
  Keyboard,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { audioService } from '../../services/audioService';
import {
  type ConversationScenario,
  type ConversationContext,
  startConversation,
  processUserMessage,
} from '../../services/conversationService';

interface ChatInterfaceProps {
  scenario: ConversationScenario;
  onBack: () => void;
  onComplete: (messageCount: number) => void;
}

export function ChatInterface({ scenario, onBack, onComplete }: ChatInterfaceProps) {
  const [context, setContext] = useState<ConversationContext>(() => startConversation(scenario.id));
  const [input, setInput] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [context.messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    setShowSuggestions(false);

    // Process the message
    const { userMsg, assistantMsg } = processUserMessage(context, userInput);

    // Add user message immediately
    setContext(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    // Simulate typing delay
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);

    // Add assistant response
    setContext(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMsg],
    }));

    // Play audio for response
    try {
      await audioService.speakCatalan(assistantMsg.content);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleEndConversation = () => {
    const userMessageCount = context.messages.filter(m => m.role === 'user').length;
    onComplete(userMessageCount);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{scenario.icon}</span>
              <h2 className="font-bold text-gray-800 dark:text-white">
                {scenario.titleCatalan}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {scenario.title} • {scenario.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`p-2 rounded-lg transition-colors ${
              showTranslations
                ? 'bg-miro-blue text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={showTranslations ? 'Hide translations' : 'Show translations'}
          >
            {showTranslations ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Key vocabulary banner */}
      <div className="px-4 py-2 bg-miro-yellow/10 dark:bg-miro-yellow/5 border-b border-miro-yellow/20">
        <div className="flex items-center gap-2 text-xs">
          <Lightbulb className="w-4 h-4 text-miro-yellow" />
          <span className="text-gray-600 dark:text-gray-400">Key phrases:</span>
          <div className="flex flex-wrap gap-1">
            {scenario.keyVocabulary.slice(0, 4).map((vocab, i) => (
              <span
                key={i}
                className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-miro-blue dark:text-miro-yellow font-medium"
                title={vocab.english}
              >
                {vocab.catalan}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        <AnimatePresence>
          {context.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showTranslation={showTranslations}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && context.messages.length === 1 && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested responses:</p>
          <div className="flex flex-wrap gap-2">
            {scenario.suggestedResponses.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escriu en català..."
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-miro-blue dark:focus:border-miro-yellow focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400"
            />
            <Keyboard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-600" />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-xl transition-all ${
              input.trim()
                ? 'bg-miro-blue hover:bg-miro-blue/90 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* End conversation button */}
        {context.messages.length > 3 && (
          <div className="mt-3 text-center">
            <button
              onClick={handleEndConversation}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-miro-blue dark:hover:text-miro-yellow transition-colors"
            >
              End conversation & see summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
