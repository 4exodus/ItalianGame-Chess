import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';
import { Move } from 'chess.js';
import { useGPT } from '../utils/gpt4all';
import { getPositionAnalysis } from '../utils/stockfish';

interface AnalysisChatProps {
  position: string;
  currentMove: Move | null;
  moveNumber: number;
  totalMoves: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'error' | 'analysis' | 'suggestion' | 'threat';
}

export default function AnalysisChat({ 
  position, 
  currentMove, 
  moveNumber, 
  totalMoves 
}: AnalysisChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    text: 'Welcome! I\'m your chess analysis assistant. Ask me anything about the position, moves, or strategy!',
    sender: 'ai',
    timestamp: new Date(),
    type: 'analysis'
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const gpt = useGPT();

  useEffect(() => {
    const initialize = async () => {
      try {
        await gpt.initialize();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize AI assistant';
        setError(errorMessage);
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setError(null);

    try {
      // Get Stockfish analysis
      const stockfishAnalysis = await getPositionAnalysis(position, 20);
      if (!stockfishAnalysis) {
        throw new Error('Failed to get engine analysis');
      }

      // Prepare context for GPT
      const context = {
        fen: position,
        evaluation: typeof stockfishAnalysis === 'string' 
          ? parseFloat(stockfishAnalysis) 
          : stockfishAnalysis,
        moveHistory: [],
        lastMove: currentMove?.san,
        moveNumber,
        totalMoves
      };

      // Generate GPT response
      const response = await gpt.generateResponse(inputMessage, context);

      // Add main response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      }]);

      // Add engine evaluation
      if (stockfishAnalysis) {
        setMessages(prev => [...prev, {
          id: 'engine-' + Date.now(),
          text: `Engine evaluation: ${stockfishAnalysis}`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'suggestion'
        }]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze position';
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        text: 'Sorry, I encountered an error while analyzing this position. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg border border-gray-700 h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[90%] ${
              msg.sender === 'user'
                ? 'ml-auto bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-100'
            } ${msg.type === 'error' ? 'border-2 border-red-500/50' : ''}
              ${msg.type === 'suggestion' ? 'border-2 border-amber-500/50' : ''}
              ${msg.type === 'threat' ? 'border-2 border-red-400/50' : ''}`}
          >
            <p className="whitespace-pre-wrap">{msg.text}</p>
            <span className="text-xs opacity-50 mt-1 block">
              {msg.timestamp.toLocaleTimeString()}
            </span>
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
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about the position or moves..."
            className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2
                     border border-gray-600 focus:border-amber-500
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputMessage.trim()}
            className="bg-amber-500 text-gray-900 rounded-lg px-4 py-2
                     hover:bg-amber-600 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed"
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