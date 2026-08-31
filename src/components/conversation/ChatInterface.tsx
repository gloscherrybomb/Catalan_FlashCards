import { useState, useRef, useEffect } from 'react';
import { Glyph } from '../ui/Glyph';
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
  processUserMessageAsync,
} from '../../services/conversationService';
import { logger } from '../../services/logger';

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
  const [notice, setNotice] = useState<string | null>(null);
  // Null until the first exchange tells us which tutor answered.
  const [usingLiveTutor, setUsingLiveTutor] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [context.messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    const contextAtSend = context;
    setInput('');
    setShowSuggestions(false);
    setNotice(null);

    // Echo the learner's message straight away; corrections are attached once
    // the tutor has looked at it.
    const pendingUserMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
    };
    setContext(prev => ({ ...prev, messages: [...prev.messages, pendingUserMessage] }));
    setIsTyping(true);

    try {
      const { userMsg, assistantMsg, usedLiveTutor } = await processUserMessageAsync(
        contextAtSend,
        userInput
      );
      setUsingLiveTutor(usedLiveTutor);

      // The offline path answers instantly, which reads as canned. A short
      // pause makes it feel like a reply rather than a lookup.
      if (!usedLiveTutor) {
        await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 600));
      }

      setContext(prev => ({
        ...prev,
        // Replace the echoed message with the graded one.
        messages: [
          ...prev.messages.filter(m => m.id !== pendingUserMessage.id),
          userMsg,
          assistantMsg,
        ],
      }));

      try {
        await audioService.speakCatalan(assistantMsg.content);
      } catch {
        // Audio is a nice-to-have here; a failure must not break the chat flow.
      }
    } catch (error) {
      const code = (error as { code?: string })?.code;
      setNotice(
        code === 'functions/resource-exhausted'
          ? (error as { message?: string }).message ??
            "You've reached today's practice limit."
          : 'Could not reach the tutor. Please try again.'
      );
      logger.error('Chat turn failed', 'ChatInterface', { error: String(error) });
      // Drop the un-answered message so the thread doesn't dead-end.
      setContext(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== pendingUserMessage.id),
      }));
      setInput(userInput);
    } finally {
      setIsTyping(false);
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
            aria-label="Back to scenarios"
            className="p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Glyph name={scenario.icon} size="sm" />
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
                : 'text-gray-500 dark:text-ink-light/60 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
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
              <div className="flex gap-1" role="status" aria-label="Tutor is replying">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mx-auto max-w-sm text-center px-4 py-3 rounded-xl bg-miro-yellow/15 border border-miro-yellow/40 text-sm text-miro-blue dark:text-ink-light"
          >
            {notice}
          </motion.div>
        )}

        {/* Say plainly which tutor is answering: the offline fallback cannot
            react to what was actually written, and pretending otherwise would
            make its generic replies look like the tutor ignoring the learner. */}
        {usingLiveTutor === false && (
          <p className="text-center text-xs text-miro-blue/50 dark:text-ink-light/50 px-4">
            Offline practice mode — replies are pre-written and your Catalan
            isn&rsquo;t being checked. Sign in and reconnect for live corrections.
          </p>
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
            aria-label="Send message"
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
