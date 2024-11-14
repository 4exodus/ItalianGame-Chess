import React from 'react';
import { RotateCcw, ChevronLeft, Robot, Brain } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onUndoMove: () => void;
  onBotMove: () => void;
  difficulty: number;
  setDifficulty: (level: number) => void;
}

export function GameControls({
  onReset,
  onUndoMove,
  onBotMove,
  difficulty,
  setDifficulty,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
        >
          <RotateCcw size={18} />
          Reset
        </button>
        <button
          onClick={onUndoMove}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          <ChevronLeft size={18} />
          Undo
        </button>
        <button
          onClick={onBotMove}
          className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          <Robot size={18} />
          Bot Move
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Difficulty:</label>
        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm font-medium text-gray-700">{difficulty}</span>
      </div>
    </div>
  );
}