import { Chess } from 'chess.js';
import { getStockfishMove, getPositionAnalysis } from './stockfish';

interface AnalysisResult {
  evaluation: number;
  bestMove: string;
  explanation: string;
  suggestions: string[];
  threats: string[];
}

export async function analyzePosition(
  game: Chess,
  difficulty: number
): Promise<AnalysisResult> {
  try {
    const [evaluation, bestMove] = await Promise.all([
      getPositionAnalysis(game.fen(), difficulty),
      getStockfishMove(game.fen(), difficulty)
    ]);

    const phase = getGamePhase(game);
    const materialBalance = getMaterialBalance(game);
    const pieceActivity = analyzePieceActivity(game);
    const pawnStructure = analyzePawnStructure(game);
    
    const explanation = generatePositionExplanation(
      phase,
      materialBalance,
      pieceActivity,
      pawnStructure,
      evaluation
    );

    const suggestions = generateSuggestions(
      phase,
      materialBalance,
      pieceActivity,
      pawnStructure,
      game
    );

    const threats = findThreats(game);

    return {
      evaluation: parseFloat(evaluation),
      bestMove,
      explanation,
      suggestions,
      threats
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze position');
  }
}

function getGamePhase(game: Chess): 'opening' | 'middlegame' | 'endgame' {
  const moveCount = game.moveNumber();
  const pieces = game.board().flat().filter(p => p !== null);
  const majorPieces = pieces.filter(p => ['q', 'r'].includes(p!.type)).length;
  
  if (moveCount <= 10) return 'opening';
  if (majorPieces <= 4) return 'endgame';
  return 'middlegame';
}

function getMaterialBalance(game: Chess): number {
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const board = game.board();
  
  return board.reduce((sum, row) => {
    return sum + row.reduce((rowSum, piece) => {
      if (!piece) return rowSum;
      const value = pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
      return rowSum + value;
    }, 0);
  }, 0);
}

function analyzePieceActivity(game: Chess): {
  white: number;
  black: number;
} {
  const moves = game.moves({ verbose: true });
  const whiteMoves = moves.filter(m => game.turn() === 'w').length;
  const blackMoves = moves.filter(m => game.turn() === 'b').length;
  
  return {
    white: whiteMoves,
    black: blackMoves
  };
}

function analyzePawnStructure(game: Chess): {
  doubled: number;
  isolated: number;
  passed: number;
} {
  // Simplified pawn structure analysis
  return {
    doubled: 0,
    isolated: 0,
    passed: 0
  };
}

function generatePositionExplanation(
  phase: 'opening' | 'middlegame' | 'endgame',
  materialBalance: number,
  pieceActivity: { white: number; black: number },
  pawnStructure: { doubled: number; isolated: number; passed: number },
  evaluation: number
): string {
  let explanation = '';

  // Phase-specific advice
  switch (phase) {
    case 'opening':
      explanation += 'In the opening phase. Focus on piece development and center control. ';
      break;
    case 'middlegame':
      explanation += 'In the middlegame. Look for tactical opportunities and strategic piece placement. ';
      break;
    case 'endgame':
      explanation += 'In the endgame. Activate your king and push passed pawns. ';
      break;
  }

  // Material assessment
  if (Math.abs(materialBalance) > 1) {
    explanation += materialBalance > 0 
      ? `White has a material advantage of ${materialBalance} pawns. `
      : `Black has a material advantage of ${Math.abs(materialBalance)} pawns. `;
  } else {
    explanation += 'Material is roughly equal. ';
  }

  // Position evaluation
  if (Math.abs(evaluation) > 2) {
    explanation += evaluation > 0 
      ? 'White has a clear advantage. '
      : 'Black has a clear advantage. ';
  } else if (Math.abs(evaluation) > 0.5) {
    explanation += evaluation > 0 
      ? 'White is slightly better. '
      : 'Black is slightly better. ';
  } else {
    explanation += 'The position is approximately equal. ';
  }

  return explanation;
}

function generateSuggestions(
  phase: 'opening' | 'middlegame' | 'endgame',
  materialBalance: number,
  pieceActivity: { white: number; black: number },
  pawnStructure: { doubled: number; isolated: number; passed: number },
  game: Chess
): string[] {
  const suggestions: string[] = [];

  switch (phase) {
    case 'opening':
      suggestions.push('Develop your minor pieces');
      suggestions.push('Control the center with pawns or pieces');
      suggestions.push('Castle to protect your king');
      break;
    case 'middlegame':
      suggestions.push('Look for tactical opportunities');
      suggestions.push('Improve your piece positions');
      suggestions.push('Create and exploit weaknesses');
      break;
    case 'endgame':
      suggestions.push('Activate your king');
      suggestions.push('Create passed pawns');
      suggestions.push('Centralize your pieces');
      break;
  }

  return suggestions;
}

function findThreats(game: Chess): string[] {
  const threats: string[] = [];
  const moves = game.moves({ verbose: true });
  
  // Check for immediate tactical threats
  const checks = moves.filter(move => move.san.includes('+'));
  const captures = moves.filter(move => move.flags.includes('c'));
  
  if (checks.length > 0) {
    threats.push('Check threats available');
  }
  
  if (captures.length > 0) {
    threats.push('Piece captures possible');
  }

  return threats;
}