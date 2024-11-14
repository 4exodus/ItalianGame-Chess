import React from 'react';
import { Brain } from 'lucide-react';
import { difficultyLevels } from '../config/difficultyLevels';

interface EngineControlsProps {
  difficulty: number;
  setDifficulty: (level: number) => void;
  onNewGame: () => void;
  engineReady: boolean;
}

export function EngineControls({
  difficulty,
  setDifficulty,
  onNewGame,
  engineReady,
}: EngineControlsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold">Engine Settings</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level: {difficultyLevels[difficulty]?.name}
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={!engineReady}
          />
          <div className="text-sm text-gray-600 mt-2">
            <p>ELO Rating: {difficultyLevels[difficulty]?.elo}</p>
            <p>{difficultyLevels[difficulty]?.description}</p>
          </div>
        </div>

        <button
          onClick={onNewGame}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md 
                   hover:bg-indigo-700 transition-colors
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!engineReady}
        >
          New Game
        </button>
      </div>
    </div>
  );
}