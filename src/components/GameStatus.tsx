import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Chess } from 'chess.js';

interface GameStatusProps {
  game: Chess;
  analysis: string;
  engineReady: boolean;
  error: string | null;
  thinking: boolean;
}

export function GameStatus({ game, analysis, engineReady, error, thinking }: GameStatusProps) {
  const gameStatus = game.isCheckmate()
    ? `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
    : game.isDraw()
    ? `Draw: ${
        game.isStalemate()
          ? 'Stalemate'
          : game.isThreefoldRepetition()
          ? 'Threefold Repetition'
          : game.isInsufficientMaterial()
          ? 'Insufficient Material'
          : 'Fifty Move Rule'
      }`
    : game.isCheck()
    ? `${game.turn() === 'w' ? 'White' : 'Black'} is in check!`
    : `${game.turn() === 'w' ? 'White' : 'Black'} to move`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold">Game Status</h2>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-gray-700">{gameStatus}</p>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : thinking ? (
          <p className="text-indigo-600">Thinking...</p>
        ) : (
          <p className="text-gray-600">
            {engineReady ? analysis || 'Make a move to see analysis' : 'Engine initializing...'}
          </p>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Click on a piece to see valid moves</p>
        <p>Right-click squares to draw arrows for planning</p>
      </div>
    </div>
  );
}