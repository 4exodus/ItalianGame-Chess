import { Chess } from 'chess.js';
import { difficultyLevels } from '../config/difficultyLevels';

let engine: Worker | null = null;
let isReady = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeStockfish(): Promise<void> {
  if (isReady && engine) return Promise.resolve();
  if (initializationPromise) return initializationPromise;

  initializationPromise = new Promise((resolve, reject) => {
    try {
      // Use built-in chess engine for now
      isReady = true;
      resolve();
    } catch (error) {
      cleanup();
      reject(error instanceof Error ? error : new Error('Failed to initialize engine'));
    }
  }).finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
}

export async function getStockfishMove(fen: string, level: number): Promise<string> {
  const game = new Chess(fen);
  
  // If game is over, don't calculate a move
  if (game.isGameOver()) {
    throw new Error('Cannot calculate move: Game is over');
  }
  
  const moves = game.moves({ verbose: true });
  
  if (moves.length === 0) {
    throw new Error('No valid moves available');
  }

  // Enhanced move evaluation with positional considerations
  const evaluatedMoves = moves.map(move => {
    game.move(move);
    const score = evaluatePositionEnhanced(game, level);
    game.undo();
    return { move, score };
  });

  // Add dynamic randomness based on difficulty level
  const difficulty = difficultyLevels[level];
  const randomFactor = Math.max(0, (8 - difficulty.skillLevel) * Math.random() * 0.5);
  
  evaluatedMoves.sort((a, b) => {
    const aScore = a.score + (Math.random() * randomFactor);
    const bScore = b.score + (Math.random() * randomFactor);
    return game.turn() === 'w' ? bScore - aScore : aScore - bScore;
  });

  const selectedMove = evaluatedMoves[0].move;
  return `${selectedMove.from}${selectedMove.to}${selectedMove.promotion || ''}`;
}

export async function getPositionAnalysis(fen: string, level: number): Promise<string> {
  const game = new Chess(fen);
  const score = evaluatePositionEnhanced(game, level);
  const phase = getGamePhase(game);
  
  let analysis = '';
  
  // Material advantage analysis
  if (Math.abs(score) > 5) {
    analysis += score > 0 
      ? `White has a winning advantage (+${score.toFixed(1)}). ` 
      : `Black has a winning advantage (${(-score).toFixed(1)}). `;
  } else if (Math.abs(score) > 2) {
    analysis += score > 0 
      ? `White is clearly better (+${score.toFixed(1)}). ` 
      : `Black is clearly better (${(-score).toFixed(1)}). `;
  } else if (Math.abs(score) > 0.5) {
    analysis += score > 0 
      ? `White is slightly better (+${score.toFixed(1)}). ` 
      : `Black is slightly better (${(-score).toFixed(1)}). `;
  } else {
    analysis += 'The position is approximately equal. ';
  }

  // Positional analysis
  const positionalFactors = analyzePosition(game);
  analysis += positionalFactors;

  // Phase-specific advice
  analysis += `\n${getPhaseAdvice(phase, game)}`;

  return analysis;
}

function evaluatePositionEnhanced(game: Chess, level: number): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -999 : 999;
  }
  
  if (game.isDraw()) {
    return 0;
  }

  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3.2,
    b: 3.33,
    r: 5.1,
    q: 8.8,
    k: 0
  };

  let score = 0;
  const board = game.board();
  
  // Material evaluation with position-dependent modifiers
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = pieceValues[piece.type];
        value *= getPositionModifier(piece, i, j, game);
        score += piece.color === 'w' ? value : -value;
      }
    }
  }

  // Mobility evaluation
  const mobility = evaluateMobility(game);
  score += mobility * 0.1;

  // Pawn structure evaluation
  const pawnStructure = evaluatePawnStructure(game);
  score += pawnStructure * 0.2;

  // King safety
  const kingSafety = evaluateKingSafety(game);
  score += kingSafety * 0.3;

  return score;
}

function getPositionModifier(piece: { type: string, color: string }, row: number, col: number, game: Chess): number {
  let modifier = 1;

  // Center control bonus
  if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
    modifier *= 1.1;
  }

  // Piece-specific positional bonuses
  switch (piece.type) {
    case 'p': // Pawns
      const advancementBonus = piece.color === 'w' ? (7 - row) * 0.05 : row * 0.05;
      modifier += advancementBonus;
      break;
    case 'n': // Knights
      if ((row === 3 || row === 4) && (col >= 2 && col <= 5)) {
        modifier *= 1.15; // Central knights bonus
      }
      break;
    case 'b': // Bishops
      if (hasOpenDiagonal(row, col, game)) {
        modifier *= 1.1;
      }
      break;
    case 'r': // Rooks
      if (isOnOpenFile(col, game)) {
        modifier *= 1.15;
      }
      break;
    case 'q': // Queen
      if (game.moveNumber() < 10) {
        modifier *= 0.9; // Early queen development penalty
      }
      break;
    case 'k': // King
      const phase = getGamePhase(game);
      if (phase === 'endgame') {
        modifier *= 1.2; // Active king bonus in endgame
      }
      break;
  }

  return modifier;
}

function evaluateMobility(game: Chess): number {
  return game.moves().length * (game.turn() === 'w' ? 1 : -1);
}

function evaluatePawnStructure(game: Chess): number {
  let score = 0;
  const board = game.board();

  // Check for doubled pawns
  for (let col = 0; col < 8; col++) {
    let whitePawns = 0;
    let blackPawns = 0;
    for (let row = 0; row < 8; row++) {
      const piece = board[row][col];
      if (piece && piece.type === 'p') {
        if (piece.color === 'w') whitePawns++;
        else blackPawns++;
      }
    }
    score -= (whitePawns > 1 ? 0.2 : 0) - (blackPawns > 1 ? 0.2 : 0);
  }

  // Check for isolated pawns
  for (let col = 0; col < 8; col++) {
    const hasAdjacentPawns = (col > 0 && hasPawnInFile(col - 1, game)) || 
                            (col < 7 && hasPawnInFile(col + 1, game));
    if (!hasAdjacentPawns && hasPawnInFile(col, game)) {
      score -= 0.3;
    }
  }

  return score;
}

function evaluateKingSafety(game: Chess): number {
  let score = 0;
  const board = game.board();

  // Find kings
  const kings = {
    w: { row: -1, col: -1 },
    b: { row: -1, col: -1 }
  };

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'k') {
        kings[piece.color] = { row, col };
      }
    }
  }

  // Evaluate pawn shield
  for (const color of ['w', 'b'] as const) {
    const king = kings[color];
    const direction = color === 'w' ? -1 : 1;
    let pawnShield = 0;

    // Check pawns in front of king
    for (let col = Math.max(0, king.col - 1); col <= Math.min(7, king.col + 1); col++) {
      const row = king.row + direction;
      if (row >= 0 && row < 8) {
        const piece = board[row][col];
        if (piece && piece.type === 'p' && piece.color === color) {
          pawnShield++;
        }
      }
    }

    score += (color === 'w' ? 1 : -1) * pawnShield * 0.2;
  }

  return score;
}

function getGamePhase(game: Chess): 'opening' | 'middlegame' | 'endgame' {
  const moveCount = game.moveNumber();
  const pieces = game.board().flat().filter(p => p !== null);
  const majorPieces = pieces.filter(p => ['q', 'r'].includes(p!.type)).length;
  
  if (moveCount <= 10) return 'opening';
  if (majorPieces <= 4) return 'endgame';
  return 'middlegame';
}

function hasOpenDiagonal(row: number, col: number, game: Chess): boolean {
  // Simplified check for open diagonals
  return true;
}

function isOnOpenFile(col: number, game: Chess): boolean {
  const board = game.board();
  let pawnsInFile = 0;
  
  for (let row = 0; row < 8; row++) {
    const piece = board[row][col];
    if (piece && piece.type === 'p') {
      pawnsInFile++;
    }
  }
  
  return pawnsInFile === 0;
}

function hasPawnInFile(col: number, game: Chess): boolean {
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    const piece = board[row][col];
    if (piece && piece.type === 'p') {
      return true;
    }
  }
  return false;
}

function analyzePosition(game: Chess): string {
  const phase = getGamePhase(game);
  let analysis = '';

  // Analyze pawn structure
  const pawnStructureScore = evaluatePawnStructure(game);
  if (Math.abs(pawnStructureScore) > 0.5) {
    analysis += pawnStructureScore > 0 
      ? 'White has a better pawn structure. '
      : 'Black has a better pawn structure. ';
  }

  // Analyze piece activity
  const mobility = evaluateMobility(game);
  if (Math.abs(mobility) > 5) {
    analysis += mobility > 0
      ? 'White has more active pieces. '
      : 'Black has more active pieces. ';
  }

  // King safety analysis
  const kingSafety = evaluateKingSafety(game);
  if (Math.abs(kingSafety) > 0.5) {
    analysis += kingSafety > 0
      ? 'White\'s king is better protected. '
      : 'Black\'s king is better protected. ';
  }

  return analysis;
}

function getPhaseAdvice(phase: 'opening' | 'middlegame' | 'endgame', game: Chess): string {
  switch (phase) {
    case 'opening':
      return 'Focus on piece development and center control.';
    case 'middlegame':
      return 'Look for tactical opportunities and strategic piece placement.';
    case 'endgame':
      return 'Activate your king and push passed pawns.';
    default:
      return '';
  }
}

export function cleanup(): void {
  if (engine) {
    try {
      engine = null;
      isReady = false;
      initializationPromise = null;
    } catch (error) {
      console.error('Engine cleanup error:', error);
    }
  }
}