import { Chess, Move } from 'chess.js';
import { difficultyLevels } from '../config/difficultyLevels';

// Simple evaluation function for piece values
const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

function evaluatePosition(game: Chess): number {
  let score = 0;
  const board = game.board();

  // Material evaluation
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
        score += value;
      }
    }
  }

  // Mobility bonus
  const moves = game.moves().length;
  score += (game.turn() === 'w' ? 0.1 : -0.1) * moves;

  return score;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  difficulty: number
): number {
  if (depth === 0) return evaluatePosition(game);

  const moves = game.moves({ verbose: true });
  
  // Introduce randomness for lower difficulty levels
  if (difficulty < 4) {
    moves.sort(() => Math.random() - 0.5);
  }

  if (maximizingPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, false, difficulty);
      game.undo();
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, true, difficulty);
      game.undo();
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

export function getBestMove(game: Chess, difficulty: number): Promise<Move> {
  return new Promise((resolve) => {
    const moves = game.moves({ verbose: true });
    const level = difficultyLevels[difficulty];
    
    // For very low difficulties, make random moves occasionally
    if (level.skillLevel <= 2 && Math.random() < 0.3) {
      resolve(moves[Math.floor(Math.random() * moves.length)]);
      return;
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;

    // Randomize move order for lower difficulties to create variety
    if (level.skillLevel < 5) {
      moves.sort(() => Math.random() - 0.5);
    }

    // Analyze fewer moves for lower difficulties
    const movesToAnalyze = Math.max(3, Math.min(moves.length, level.skillLevel * 2));
    
    for (let i = 0; i < movesToAnalyze; i++) {
      const move = moves[i];
      game.move(move);
      const score = minimax(
        game,
        Math.min(level.depth, 3),
        -Infinity,
        Infinity,
        false,
        level.skillLevel
      );
      game.undo();

      // Add randomness to evaluation for lower difficulties
      const randomFactor = (8 - level.skillLevel) * (Math.random() - 0.5);
      const adjustedScore = score + randomFactor;

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestMove = move;
      }
    }

    resolve(bestMove);
  });
}

export function getPositionAnalysis(game: Chess): string {
  const score = evaluatePosition(game);
  const moveCount = game.moveNumber();
  
  let analysis = '';
  
  if (Math.abs(score) > 5) {
    analysis += score > 0 ? 'White has a significant advantage. ' : 'Black has a significant advantage. ';
  } else if (Math.abs(score) > 2) {
    analysis += score > 0 ? 'White is slightly better. ' : 'Black is slightly better. ';
  } else {
    analysis += 'The position is approximately equal. ';
  }

  if (moveCount < 10) {
    analysis += 'Still in the opening phase. Focus on development and center control.';
  } else if (moveCount < 30) {
    analysis += 'Middlegame phase. Look for tactical opportunities.';
  } else {
    analysis += 'Endgame phase. Focus on pawn structure and king activity.';
  }

  return analysis;
}