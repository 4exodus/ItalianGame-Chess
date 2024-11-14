import React, { useState } from 'react';
import { BookOpen, ChevronRight, MapPin, Calendar, Users } from 'lucide-react';
import ChessGame from './ChessGame';
import { historicalMatches } from '../data/italianChessHistory';

export default function ChessStory() {
  const [selectedMatch, setSelectedMatch] = useState(historicalMatches[0]);
  const [currentPosition, setCurrentPosition] = useState(0);

  const nextPosition = () => {
    if (currentPosition < selectedMatch.positions.length - 1) {
      setCurrentPosition(currentPosition + 1);
    }
  };

  const previousPosition = () => {
    if (currentPosition > 0) {
      setCurrentPosition(currentPosition - 1);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <ChessGame
          initialPosition={selectedMatch.positions[currentPosition].fen}
          disabled={true}
        />

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-500 mb-4">
            Position Analysis
          </h3>
          <p className="text-gray-300">
            {selectedMatch.positions[currentPosition].description}
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={previousPosition}
              disabled={currentPosition === 0}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg
                       hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextPosition}
              disabled={currentPosition === selectedMatch.positions.length - 1}
              className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg
                       hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold">Historical Matches</h2>
          </div>

          <div className="space-y-4">
            {historicalMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => {
                  setSelectedMatch(match);
                  setCurrentPosition(0);
                }}
                className={`w-full text-left p-4 rounded-lg transition-colors
                  ${
                    match.id === selectedMatch.id
                      ? 'bg-amber-500 text-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{match.title}</h3>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{match.year}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{match.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4" />
                    <span>
                      {match.players.white} vs {match.players.black}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-500 mb-4">
            Historical Context
          </h3>
          <div className="prose prose-invert">
            <p className="text-gray-300 mb-4">
              {selectedMatch.historicalContext}
            </p>
            <p className="text-gray-300 mb-4">
              {selectedMatch.culturalSignificance}
            </p>
            <h4 className="text-amber-500 mt-4 mb-2">Players</h4>
            <p className="text-gray-300 mb-2">
              <strong className="text-amber-500">White:</strong>{' '}
              {selectedMatch.playerBackgrounds.white}
            </p>
            <p className="text-gray-300">
              <strong className="text-amber-500">Black:</strong>{' '}
              {selectedMatch.playerBackgrounds.black}
            </p>
            <h4 className="text-amber-500 mt-4 mb-2">Historical Impact</h4>
            <p className="text-gray-300">{selectedMatch.impact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
