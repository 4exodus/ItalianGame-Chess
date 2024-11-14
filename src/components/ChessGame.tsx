import React, { useCallback, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Move, Square } from 'chess.js';
import { useChessContext } from '../context/ChessContext';

interface ChessBoardProps {
  initialPosition?: string;
  disabled?: boolean;
  onMove?: (move: Move) => Promise<boolean>;
  orientation?: 'w' | 'b';
}

export default function ChessGame({
  initialPosition,
  disabled = false,
  onMove,
  orientation = 'w',
}: ChessBoardProps) {
  const { game } = useChessContext();
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [arrows, setArrows] = useState<[Square, Square][]>([]);
  const [optionSquares, setOptionSquares] = useState<any>({});

  // Reset squares when game changes
  useEffect(() => {
    setOptionSquares({});
    setMoveFrom(null);
    setArrows([]);
  }, [game]);

  const isValidMove = useCallback(
    (from: Square, to: Square): boolean => {
      try {
        // Check if the piece belongs to the current player
        const piece = game.get(from);
        if (
          !piece ||
          piece.color !== game.turn() ||
          piece.color !== orientation[0]
        ) {
          return false;
        }

        // Get all legal moves for the piece
        const moves = game.moves({
          square: from,
          verbose: true,
        });

        // Check if the move is in the list of legal moves
        return moves.some((move) => move.from === from && move.to === to);
      } catch (error) {
        console.error('Error validating move:', error);
        return false;
      }
    },
    [game, orientation]
  );

  const getMoveOptions = useCallback(
    (square: Square) => {
      try {
        const moves = game.moves({
          square,
          verbose: true,
        });

        if (!moves || moves.length === 0) return {};

        const newSquares: any = {};
        moves.forEach((move) => {
          newSquares[move.to] = {
            background: game.get(move.to)
              ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            borderRadius: '50%',
          };
        });
        return newSquares;
      } catch (error) {
        console.error('Error getting move options:', error);
        return {};
      }
    },
    [game]
  );

  const onSquareRightClick = useCallback(
    (square: Square) => {
      if (!moveFrom) {
        setMoveFrom(square);
      } else {
        const existingArrowIndex = arrows.findIndex(
          ([from, to]) => from === moveFrom && to === square
        );

        setArrows((prevArrows) => {
          if (existingArrowIndex !== -1) {
            const newArrows = [...prevArrows];
            newArrows.splice(existingArrowIndex, 1);
            return newArrows;
          } else {
            return [...prevArrows, [moveFrom, square]];
          }
        });
        setMoveFrom(null);
      }
    },
    [moveFrom, arrows]
  );

  const onSquareClick = useCallback(
    async (square: Square) => {
      if (disabled) return;

      if (!moveFrom) {
        const piece = game.get(square);
        if (
          piece &&
          piece.color === game.turn() &&
          piece.color === orientation[0]
        ) {
          setMoveFrom(square);
          setOptionSquares(getMoveOptions(square));
        }
        return;
      }

      // Validate the move
      if (!isValidMove(moveFrom, square)) {
        setOptionSquares({
          [square]: {
            background: 'rgba(255, 0, 0, 0.4)',
            transition: 'background-color 0.3s ease',
          },
        });
        setTimeout(() => {
          setOptionSquares(getMoveOptions(moveFrom));
        }, 300);
        return;
      }

      try {
        const moveDetails = {
          from: moveFrom,
          to: square,
          promotion: 'q',
        };

        const success = await onMove?.(moveDetails);

        if (success) {
          setOptionSquares({});
          setArrows([]);
        } else {
          setOptionSquares({
            [square]: {
              background: 'rgba(255, 0, 0, 0.4)',
              transition: 'background-color 0.3s ease',
            },
          });
          setTimeout(() => {
            setOptionSquares(getMoveOptions(moveFrom));
          }, 300);
        }
      } catch (error) {
        console.error('Move error:', error);
        setOptionSquares({});
      }

      setMoveFrom(null);
    },
    [game, moveFrom, onMove, disabled, getMoveOptions, orientation, isValidMove]
  );

  const handlePieceDrop = useCallback(
    async (
      sourceSquare: Square,
      targetSquare: Square,
      piece: string
    ): Promise<boolean> => {
      if (disabled) return false;

      try {
        // Basic validation
        if (piece[0].toLowerCase() !== orientation) return false;

        // Validate move using chess.js
        if (!isValidMove(sourceSquare, targetSquare)) {
          setOptionSquares({
            [targetSquare]: {
              background: 'rgba(255, 0, 0, 0.4)',
              transition: 'background-color 0.3s ease',
            },
          });
          setTimeout(() => setOptionSquares({}), 300);
          return false;
        }

        // Try to make the move
        const moveResult = await onMove?.({
          from: sourceSquare,
          to: targetSquare,
          promotion:
            piece.toLowerCase() === 'p' &&
            (targetSquare[1] === '8' || targetSquare[1] === '1')
              ? 'q'
              : undefined,
        });

        if (moveResult) {
          setOptionSquares({});
          setArrows([]);
          return true;
        }

        return false;
      } catch (error) {
        console.error('Drop error:', error);
        return false;
      } finally {
        setMoveFrom(null);
        setOptionSquares({});
      }
    },
    [disabled, orientation, isValidMove, onMove]
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[600px] aspect-square">
        <Chessboard
          id="BasicBoard"
          position={game.fen()}
          onPieceDrop={handlePieceDrop}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={orientation === 'w' ? 'white' : 'black'}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#779952' }}
          customLightSquareStyle={{ backgroundColor: '#edeed1' }}
          customSquareStyles={optionSquares}
          customArrows={arrows}
          customArrowColor="rgba(255, 170, 0, 0.5)"
          showBoardNotation={true}
          animationDuration={0}
          boardWidth={600}
          areArrowsAllowed={true}
          dragSnapRadius={0}
        />
      </div>
    </div>
  );
}
