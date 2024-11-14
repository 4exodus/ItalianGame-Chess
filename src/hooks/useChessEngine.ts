import { useState, useEffect, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import { useChessContext } from '../context/ChessContext';
import {
  getStockfishMove,
  getPositionAnalysis,
  initializeStockfish,
  cleanup,
} from '../utils/stockfish';

export function useChessEngine() {
  const { game, setGame, setAnalysis } = useChessContext();
  const [difficulty, setDifficulty] = useState(2);
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [thinkingTime, setThinkingTime] = useState(3);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  useEffect(() => {
    let mounted = true;

    const initEngine = async () => {
      try {
        setError(null);
        await initializeStockfish();
        if (mounted) {
          setEngineReady(true);
        }
      } catch (error) {
        if (mounted) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('Engine initialization error:', errorMessage);
          setError(`Failed to initialize engine: ${errorMessage}`);
        }
      }
    };

    initEngine();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (
      engineReady &&
      playerColor &&
      game.turn() !== playerColor &&
      !thinking &&
      !game.isGameOver()
    ) {
      makeComputerMove();
    }
  }, [engineReady, playerColor, game]);

  const makeComputerMove = async () => {
    if (
      !engineReady ||
      thinking ||
      game.turn() === playerColor ||
      game.isGameOver()
    )
      return;

    try {
      setThinking(true);
      setError(null);

      if (game.isGameOver()) {
        setThinking(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, thinkingTime * 1000));

      const bestMove = await getStockfishMove(game.fen(), difficulty);
      if (bestMove) {
        setGame((currentGame) => {
          const newGame = new Chess(currentGame.fen());
          const moveResult = newGame.move({
            from: bestMove.slice(0, 2) as any,
            to: bestMove.slice(2, 4) as any,
            promotion: bestMove.length > 4 ? (bestMove[4] as any) : undefined,
          });

          if (moveResult) {
            setMoveHistory((prev) => [...prev, moveResult]);
            return newGame;
          }
          return currentGame;
        });

        // Update analysis after the move
        const newGameState = game;
        if (!newGameState.isGameOver()) {
          const analysis = await getPositionAnalysis(
            newGameState.fen(),
            difficulty
          );
          setAnalysis(analysis);
        } else {
          setAnalysis(getGameEndMessage(newGameState));
        }
      }
    } catch (error) {
      if (!game.isGameOver()) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Engine move error:', errorMessage);
        setError(`Engine error: ${errorMessage}`);
      }
    } finally {
      setThinking(false);
    }
  };

  const makeMove = useCallback(
    async (move: Move): Promise<boolean> => {
      if (
        !engineReady ||
        thinking ||
        !playerColor ||
        game.turn() !== playerColor
      ) {
        return false;
      }

      try {
        let moveSuccess = false;

        setGame((currentGame) => {
          const newGame = new Chess(currentGame.fen());
          const result = newGame.move(move);

          if (result) {
            moveSuccess = true;
            setMoveHistory((prev) => [...prev, result]);
          }

          return moveSuccess ? newGame : currentGame;
        });

        if (!moveSuccess) {
          setError('Invalid move attempt');
          return false;
        }

        setError(null);

        if (game.isGameOver()) {
          setAnalysis(getGameEndMessage(game));
          return true;
        }

        const analysis = await getPositionAnalysis(game.fen(), difficulty);
        setAnalysis(analysis);

        setTimeout(() => {
          makeComputerMove();
        }, 100);

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Move error:', errorMessage);
        setError(`Move error: ${errorMessage}`);
        return false;
      }
    },
    [game, difficulty, engineReady, thinking, playerColor, setGame, setAnalysis]
  );

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setMoveHistory([]);
    setAnalysis('Game started! Make your move.');
    setError(null);

    if (playerColor === 'b' && engineReady && !thinking) {
      setTimeout(() => {
        makeComputerMove();
      }, 500);
    }
  }, [setGame, setAnalysis, playerColor, engineReady, thinking]);

  return {
    game,
    difficulty,
    setDifficulty,
    thinking,
    engineReady,
    error,
    onPlayerMove: makeMove,
    resetGame,
    playerColor,
    setPlayerColor,
    thinkingTime,
    setThinkingTime,
    moveHistory,
  };
}

function getGameEndMessage(game: Chess): string {
  if (game.isCheckmate()) {
    return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
  }
  if (game.isDraw()) {
    if (game.isStalemate()) {
      return 'Draw by stalemate';
    }
    if (game.isThreefoldRepetition()) {
      return 'Draw by threefold repetition';
    }
    if (game.isInsufficientMaterial()) {
      return 'Draw by insufficient material';
    }
    return 'Draw by fifty-move rule';
  }
  return '';
}
