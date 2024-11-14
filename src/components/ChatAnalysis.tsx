import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, RotateCcw, Brain } from 'lucide-react';
import { useChessContext } from '../context/ChessContext';
import { analyzePosition } from '../utils/analysisEngine';
import { useGPT } from '../utils/gpt4all';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'error' | 'analysis' | 'suggestion' | 'threat';
}

export default function ChatAnalysis() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { game } = useChessContext();
  const gpt = useGPT();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initGPT = async () => {
      try {
        await gpt.initialize();
        setMessages([{
          id: 'welcome',
          text: 'Welcome! I\'m your chess analysis assistant. Ask me anything about your position, moves, or strategy!',
          sender: 'ai',
          timestamp: new Date(),
          type: 'analysis'
        }]);
      } catch (error) {
        setError('Failed to initialize chess assistant');
        console.error('GPT initialization error:', error);
      }
    };

    initGPT();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsProcessing(true);
    setError(null);

    try {
      // Get current position analysis
      const analysis = await analyzePosition(game, 5);

      // Generate GPT response
      const gptResponse = await gpt.generateResponse(
        `Chess Position Analysis:
         - Current Position (FEN): ${game.fen()}
         - Material Balance: ${analysis.evaluation}
         - Best Move: ${analysis.bestMove}
         
         User Question: ${message}
         
         Please provide a helpful response considering the current position.`
      );

      // Add main response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: gptResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      }]);

      if (analysis.suggestions?.length > 0) {
        setMessages(prev => [...prev, {
          id: 'suggestions-' + Date.now(),
          text: 'Key suggestions:\n' + analysis.suggestions.join('\n'),
          sender: 'ai',
          timestamp: new Date(),
          type: 'suggestion'
        }]);
      }

      if (analysis.threats?.length > 0) {
        setMessages(prev => [...prev, {
          id: 'threats-' + Date.now(),
          text: 'Potential threats:\n' + analysis.threats.join('\n'),
          sender: 'ai',
          timestamp: new Date(),
          type: 'threat'
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        text: `Error: ${errorMessage}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      }]);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      text: 'Chat cleared. How can I help you with your chess game?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'analysis'
    }]);
    setError(null);
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-amber-500">Chess Assistant</h2>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group p-3 rounded-xl max-w-[80%] transition-all duration-300
              ${msg.sender === 'user'
                ? 'ml-auto bg-amber-500 text-gray-900'
                : 'bg-gray-700/90 text-gray-100'} 
              ${msg.type === 'error' ? 'border-2 border-red-500/50 bg-red-500/20' : ''} 
              ${msg.type === 'suggestion' ? 'border-2 border-amber-500/50' : ''}
              ${msg.type === 'threat' ? 'border-2 border-red-400/50' : ''}`}
          >
            <div className="flex flex-col gap-1">
              <p className={`whitespace-pre-wrap ${msg.type === 'error' ? 'text-red-400' : ''}`}>
                {msg.text}
              </p>
              <span className="text-xs opacity-50">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-amber-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing position...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your position or moves..."
            className="flex-1 bg-gray-700/90 text-gray-100 rounded-lg px-4 py-2 
                     border border-gray-600 focus:border-amber-500
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            type="submit"
            disabled={isProcessing || !message.trim()}
            className="bg-amber-500 text-gray-900 rounded-lg px-4 py-2 
                     hover:bg-amber-600 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-medium shadow-lg hover:shadow-amber-500/25"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}