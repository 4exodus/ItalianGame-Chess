import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Chess } from 'chess.js';

interface ChessContextType {
  game: Chess;
  setGame: (game: Chess | ((prev: Chess) => Chess)) => void;
  resetGame: () => void;
  analysis: string;
  setAnalysis: (analysis: string) => void;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export function ChessProvider({ children }: { children: React.ReactNode }) {
  const [game, setGameState] = useState(() => new Chess());
  const [analysis, setAnalysis] = useState('');

  const setGame = useCallback(
    (newGameOrFn: Chess | ((prev: Chess) => Chess)) => {
      setGameState((prev) => {
        if (typeof newGameOrFn === 'function') {
          return newGameOrFn(prev);
        }
        return newGameOrFn;
      });
    },
    []
  );

  const resetGame = useCallback(() => {
    setGameState(new Chess());
    setAnalysis('');
  }, []);

  return (
    <ChessContext.Provider
      value={{
        game,
        setGame,
        resetGame,
        analysis,
        setAnalysis,
      }}
    >
      {children}
    </ChessContext.Provider>
  );
}

export function useChessContext() {
  const context = useContext(ChessContext);
  if (context === undefined) {
    throw new Error('useChessContext must be used within a ChessProvider');
  }
  return context;
}
