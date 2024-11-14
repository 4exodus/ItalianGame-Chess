import React, { useCallback, useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Move, Square } from 'chess.js';

type SquareStyles = Record<string, React.CSSProperties>;
type ChessMove = Move & { promotion?: 'q' | 'r' | 'b' | 'n' };

interface ChessBoardProps {
  game: Chess;
  onMove: (move: ChessMove) => Promise<boolean>;
  disabled?: boolean;
  showHints?: boolean;
  autoQueen?: boolean;
  boardWidth?: number;
}

const DEFAULT_HIGHLIGHT_COLORS = {
  validMove: 'rgba(0, 0, 0, 0.1)',
  selected: 'rgba(255, 255, 0, 0.4)',
  invalidMove: 'rgba(255, 0, 0, 0.4)',
  lastMove: 'rgba(255, 255, 0, 0.2)',
};

export function ChessBoard({
  game,
  onMove,
  disabled = false,
  showHints = true,
  autoQueen = true,
  boardWidth = 600,
}: ChessBoardProps) {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState<SquareStyles>(
    {}
  );
  const [optionSquares, setOptionSquares] = useState<SquareStyles>({});
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null
  );

  const getMoveOptions = useCallback(
    (square: Square): SquareStyles => {
      if (!showHints) return {};

      const moves = game.moves({
        square,
        verbose: true,
      });

      return moves.reduce((acc: SquareStyles, move) => {
        acc[move.to] = {
          background: game.get(move.to)
            ? `radial-gradient(circle, ${DEFAULT_HIGHLIGHT_COLORS.validMove} 85%, transparent 85%)`
            : `radial-gradient(circle, ${DEFAULT_HIGHLIGHT_COLORS.validMove} 25%, transparent 25%)`,
          borderRadius: '50%',
        };
        return acc;
      }, {});
    },
    [game, showHints]
  );

  const onSquareRightClick = useCallback((square: Square) => {
    setRightClickedSquares((prev) => ({
      ...prev,
      [square]: {
        backgroundColor: DEFAULT_HIGHLIGHT_COLORS.selected,
      },
    }));
  }, []);

  const clearAnnotations = useCallback(() => {
    setRightClickedSquares({});
    setOptionSquares({});
  }, []);

  const onSquareClick = useCallback(
    async (square: Square) => {
      if (disabled) return;

      const piece = game.get(square);

      if (!moveFrom) {
        if (piece && piece.color === game.turn()) {
          setMoveFrom(square);
          setOptionSquares(getMoveOptions(square));
        }
        return;
      }

      try {
        const moveResult = await onMove({
          from: moveFrom,
          to: square,
          promotion: autoQueen ? 'q' : undefined,
        });

        if (moveResult) {
          setLastMove({ from: moveFrom, to: square });
          clearAnnotations();
        } else {
          setOptionSquares({
            [square]: { background: DEFAULT_HIGHLIGHT_COLORS.invalidMove },
          });
          setTimeout(() => {
            setOptionSquares(getMoveOptions(moveFrom));
          }, 300);
        }
      } catch (error) {
        console.error('Move error:', error);
      }

      setMoveFrom(null);
    },
    [
      game,
      moveFrom,
      onMove,
      disabled,
      getMoveOptions,
      clearAnnotations,
      autoQueen,
    ]
  );

  const handlePieceDrop = useCallback(
    async (
      sourceSquare: Square,
      targetSquare: Square,
      piece: string
    ): Promise<boolean> => {
      if (disabled || piece[0] !== game.turn()) return false;

      try {
        const isPawnPromotion =
          piece.toLowerCase() === 'p' &&
          (targetSquare[1] === '8' || targetSquare[1] === '1');

        const moveResult = await onMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: isPawnPromotion ? 'q' : undefined,
        });

        if (moveResult) {
          setLastMove({ from: sourceSquare, to: targetSquare });
          clearAnnotations();
        } else {
          setOptionSquares({
            [targetSquare]: {
              background: DEFAULT_HIGHLIGHT_COLORS.invalidMove,
            },
          });
          setTimeout(clearAnnotations, 300);
        }

        return moveResult;
      } catch (error) {
        console.error('Move error:', error);
        return false;
      }
    },
    [disabled, game, onMove, clearAnnotations]
  );

  const customSquareStyles = useMemo(
    () => ({
      ...optionSquares,
      ...rightClickedSquares,
      ...(lastMove && {
        [lastMove.from]: { background: DEFAULT_HIGHLIGHT_COLORS.lastMove },
        [lastMove.to]: { background: DEFAULT_HIGHLIGHT_COLORS.lastMove },
      }),
    }),
    [optionSquares, rightClickedSquares, lastMove]
  );

  // Define getPositionObject to help with position tracking
  const getPositionObject = useCallback(() => {
    const position = game.fen().split(' ')[0];
    const rows = position.split('/');
    const positionObject: Record<string, string> = {};

    let row = 8;
    for (const r of rows) {
      let col = 1;
      for (const char of r) {
        if (isNaN(parseInt(char))) {
          const square = `${String.fromCharCode(96 + col)}${row}` as Square;
          positionObject[square] = char;
          col += 1;
        } else {
          col += parseInt(char);
        }
      }
      row -= 1;
    }

    return positionObject;
  }, [game]);

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <Chessboard
        id="BasicBoard"
        position={getPositionObject()}
        onPieceDrop={handlePieceDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        boardOrientation="white"
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
        customSquareStyles={customSquareStyles}
        animationDuration={200}
        boardWidth={boardWidth}
        areArrowsAllowed={true}
        showBoardNotation={true}
      />
    </div>
  );
}
