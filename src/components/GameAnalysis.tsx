import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Brain, RotateCw, MessageCircle, X } from 'lucide-react';
import { Chess, Move } from 'chess.js';
import ChessGame from './ChessGame';
import AnalysisChat from './AnalysisChat';
import { useLanguage } from '../context/LanguageContext';

interface GameAnalysisProps {
  moves: Move[];
  onClose: () => void;
}

export default function GameAnalysis({ moves, onClose }: GameAnalysisProps) {
  const { t } = useLanguage();
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [gamePosition, setGamePosition] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'w' | 'b'>('w');
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [validatedMoves, setValidatedMoves] = useState<Move[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const processAndValidateMoves = () => {
      try {
        const game = new Chess();
        const validMoves: Move[] = [];
        const history: string[] = [];

        for (const move of moves) {
          try {
            let result;
            if (move.from && move.to) {
              result = game.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion
              });
            } else if (move.san) {
              result = game.move(move.san);
            }

            if (result) {
              validMoves.push(result);
              const moveNumber = Math.floor((validMoves.length - 1) / 2) + 1;
              const isWhiteMove = validMoves.length % 2 !== 0;
              const moveText = isWhiteMove 
                ? `${moveNumber}. ${result.san}`
                : result.san;
              history.push(moveText);
            }
          } catch (moveError) {
            console.warn('Move application failed:', moveError);
          }
        }

        setValidatedMoves(validMoves);
        setMoveHistory(history);
        setError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process moves';
        console.error('Move processing error:', message);
        setError(message);
        setValidatedMoves([]);
        setMoveHistory([]);
      }
    };

    processAndValidateMoves();
  }, [moves]);

  useEffect(() => {
    const updatePosition = () => {
      try {
        const game = new Chess();
        
        if (currentMoveIndex >= 0) {
          for (let i = 0; i <= currentMoveIndex; i++) {
            const move = validatedMoves[i];
            if (!move) continue;

            try {
              const result = game.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion
              });

              if (!result) {
                game.move(move.san);
              }
            } catch (moveError) {
              console.error(`Error applying move at index ${i}:`, move, moveError);
              throw new Error(`Invalid move sequence at move ${i + 1}`);
            }
          }
        }

        setGamePosition(game);
        setError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to replay moves';
        console.error('Position update error:', message);
        setError(message);
      }
    };

    updatePosition();
  }, [currentMoveIndex, validatedMoves]);

  const handlePrevMove = () => {
    if (currentMoveIndex > -1) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < validatedMoves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const handleFlipBoard = () => {
    setBoardOrientation(prev => prev === 'w' ? 'b' : 'w');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300
          ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      <div className={`relative bg-gray-800 rounded-xl w-full max-w-[95vw] h-[90vh] flex flex-col
        overflow-hidden border border-gray-700 transition-all duration-300
        ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-amber-500">{t('gameAnalysis')}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {!isMobile && (
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300
                         rounded-lg hover:bg-gray-600 transition-all duration-300 hover-lift"
              >
                <MessageCircle className="w-5 h-5" />
                {showChat ? t('hideChat') : t('showChat')}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-amber-500 transition-colors
                       rounded-lg hover:bg-gray-700"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <div className={`h-full grid gap-4 p-4
            ${isMobile ? 'grid-cols-1' : showChat ? 'lg:grid-cols-[1.5fr_1fr_1fr]' : 'lg:grid-cols-[2fr_1fr]'}`}>
            
            {/* Chess Board Section */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
                <button
                  onClick={handlePrevMove}
                  disabled={currentMoveIndex === -1}
                  className="p-2 text-gray-400 hover:text-amber-500 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-600"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-amber-500 font-medium">
                  {currentMoveIndex === -1 
                    ? t('initialPosition')
                    : t('moveOf', { current: currentMoveIndex + 1, total: validatedMoves.length })}
                </span>
                <button
                  onClick={handleNextMove}
                  disabled={currentMoveIndex === validatedMoves.length - 1}
                  className="p-2 text-gray-400 hover:text-amber-500 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-600"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              <div className="flex-1 min-h-0 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleFlipBoard}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-gray-200 
                             rounded-lg hover:bg-gray-500 transition-all duration-300 hover-lift"
                  >
                    <RotateCw className="w-4 h-4" />
                    {t('flipBoard')}
                  </button>
                </div>
                <div className="aspect-square max-h-full">
                  <ChessGame
                    initialPosition={gamePosition.fen()}
                    disabled={true}
                    orientation={boardOrientation}
                  />
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 
                          overflow-y-auto max-h-full">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">{t('moveHistory')}</h3>
              <div className="space-y-1">
                {moveHistory.map((moveText, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMoveIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300
                      ${index === currentMoveIndex
                        ? 'bg-amber-500 text-gray-900'
                        : 'hover:bg-gray-600 text-gray-300'}`}
                  >
                    {moveText}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Chat */}
            {!isMobile && showChat && (
              <div className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden">
                <AnalysisChat
                  position={gamePosition.fen()}
                  currentMove={currentMoveIndex >= 0 ? validatedMoves[currentMoveIndex] : null}
                  moveNumber={currentMoveIndex + 1}
                  totalMoves={validatedMoves.length}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Toggle */}
        {isMobile && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 
                       transition-all duration-300 hover-lift"
            >
              <MessageCircle className="w-5 h-5" />
              {showChat ? t('hideAnalysis') : t('showAnalysis')}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Chat Panel */}
      {isMobile && showChat && (
        <div className={`fixed inset-0 bg-gray-900/95 z-[60] transition-transform duration-300
          ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-amber-500">{t('analysisChat')}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 text-gray-400 hover:text-amber-500 transition-colors
                         rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AnalysisChat
                position={gamePosition.fen()}
                currentMove={currentMoveIndex >= 0 ? validatedMoves[currentMoveIndex] : null}
                moveNumber={currentMoveIndex + 1}
                totalMoves={validatedMoves.length}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}