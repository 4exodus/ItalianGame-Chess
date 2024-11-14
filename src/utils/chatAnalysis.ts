import { Chess } from 'chess.js';

interface ChatAnalysis {
  evaluation: string;
  suggestions: string[];
  threats: string[];
  positionalFeatures: string[];
}

// Chess knowledge base for contextual responses
const chessKnowledge = {
  openings: {
    principles: [
      'Control the center with pawns or pieces',
      'Develop your minor pieces before major pieces',
      'Castle early to protect your king',
      'Don\'t move the same piece multiple times'
    ],
    commonMistakes: [
      'Moving too many pawns',
      'Developing the queen too early',
      'Not controlling the center',
      'Neglecting development for attacks'
    ]
  },
  middlegame: {
    principles: [
      'Create and exploit weaknesses',
      'Control open files with rooks',
      'Maintain pawn structure',
      'Look for tactical opportunities'
    ],
    patterns: [
      'Doubled pawns can be weak',
      'Knights are strong on outposts',
      'Bishops need open diagonals',
      'Rooks belong on open files'
    ]
  },
  endgame: {
    principles: [
      'Activate your king',
      'Create passed pawns',
      'Centralize your pieces',
      'Cut off the enemy king'
    ],
    patterns: [
      'Connected passed pawns are strong',
      'Rooks belong behind passed pawns',
      'Opposition is key in king and pawn endings',
      'Bishops of opposite colors tend to draw'
    ]
  }
};

// Personality traits for more natural responses
const personality = {
  greetings: [
    'Let me analyze this position for you.',
    'Interesting position! Here\'s what I see.',
    'I\'ve studied this carefully. Here\'s my analysis.',
    'This is an intriguing position. Let me explain.'
  ],
  transitions: [
    'Furthermore,',
    'Additionally,',
    'Moreover,',
    'Also worth noting,'
  ],
  suggestions: [
    'You might want to consider',
    'A good plan would be to',
    'I recommend',
    'It would be strong to'
  ],
  warnings: [
    'Be careful about',
    'Watch out for',
    'Don\'t overlook',
    'Make sure to prevent'
  ]
};

export function analyzePosition(game: Chess): ChatAnalysis {
  const fen = game.fen();
  const moveCount = game.moveNumber();
  const phase = getGamePhase(game);
  const material = evaluateMaterial(game);
  const pawnStructure = analyzePawnStructure(game);
  const pieceActivity = analyzePieceActivity(game);
  
  return {
    evaluation: generateEvaluation(material, pieceActivity),
    suggestions: generateSuggestions(phase, pawnStructure, pieceActivity),
    threats: findThreats(game),
    positionalFeatures: analyzePosition(game)
  };
}

export function generateResponse(
  query: string,
  game: Chess,
  analysis: ChatAnalysis
): string {
  const greeting = personality.greetings[Math.floor(Math.random() * personality.greetings.length)];
  const phase = getGamePhase(game);
  
  let response = `${greeting}\n\n`;

  // Add phase-specific advice
  response += generatePhaseAdvice(phase);

  // Add position evaluation
  response += `\n${analysis.evaluation}`;

  // Add specific response based on query type
  if (query.toLowerCase().includes('what') && query.toLowerCase().includes('do')) {
    response += generateActionableAdvice(phase, analysis);
  } else if (query.toLowerCase().includes('why')) {
    response += generateExplanation(query, game, analysis);
  } else if (query.toLowerCase().includes('plan')) {
    response += generatePlan(phase, analysis);
  }

  // Add relevant threats or warnings
  if (analysis.threats.length > 0) {
    const warning = personality.warnings[Math.floor(Math.random() * personality.warnings.length)];
    response += `\n\n${warning} ${analysis.threats[0]}`;
  }

  return response;
}

function getGamePhase(game: Chess): 'opening' | 'middlegame' | 'endgame' {
  const moveCount = game.moveNumber();
  const pieces = game.board().flat().filter(p => p !== null);
  const majorPieces = pieces.filter(p => ['q', 'r'].includes(p!.type)).length;
  
  if (moveCount <= 10) return 'opening';
  if (majorPieces <= 4) return 'endgame';
  return 'middlegame';
}

function evaluateMaterial(game: Chess): number {
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let score = 0;
  
  game.board().forEach(row => {
    row.forEach(piece => {
      if (piece) {
        score += pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1);
      }
    });
  });
  
  return score;
}

function analyzePawnStructure(game: Chess): string[] {
  const features = [];
  const board = game.board();
  
  // Analyze pawn structure
  for (let file = 0; file < 8; file++) {
    let pawnsInFile = 0;
    for (let rank = 0; rank < 8; rank++) {
      const piece = board[rank][file];
      if (piece && piece.type === 'p') {
        pawnsInFile++;
      }
    }
    if (pawnsInFile > 1) {
      features.push(`doubled pawns on file ${String.fromCharCode(97 + file)}`);
    }
  }
  
  return features;
}

function analyzePieceActivity(game: Chess): string[] {
  const features = [];
  const moves = game.moves({ verbose: true });
  
  if (moves.length > 20) {
    features.push('high piece mobility');
  } else if (moves.length < 10) {
    features.push('restricted piece mobility');
  }
  
  return features;
}

function findThreats(game: Chess): string[] {
  const threats = [];
  const moves = game.moves({ verbose: true });
  
  // Check for immediate tactical threats
  const captures = moves.filter(move => move.flags.includes('c'));
  const checks = moves.filter(move => move.flags.includes('c'));
  
  if (captures.length > 0) {
    threats.push('immediate captures available');
  }
  if (checks.length > 0) {
    threats.push('check opportunities');
  }
  
  return threats;
}

function generatePhaseAdvice(phase: 'opening' | 'middlegame' | 'endgame'): string {
  const principles = chessKnowledge[phase].principles;
  return principles[Math.floor(Math.random() * principles.length)];
}

function generateActionableAdvice(phase: 'opening' | 'middlegame' | 'endgame', analysis: ChatAnalysis): string {
  const suggestion = personality.suggestions[Math.floor(Math.random() * personality.suggestions.length)];
  
  let advice = `\n\n${suggestion} `;
  switch (phase) {
    case 'opening':
      advice += 'focus on piece development and center control.';
      break;
    case 'middlegame':
      advice += 'look for tactical opportunities and improve piece positions.';
      break;
    case 'endgame':
      advice += 'activate your king and create passed pawns.';
      break;
  }
  
  return advice;
}

function generateExplanation(query: string, game: Chess, analysis: ChatAnalysis): string {
  const transition = personality.transitions[Math.floor(Math.random() * personality.transitions.length)];
  
  let explanation = `\n\n${transition} `;
  if (analysis.positionalFeatures.length > 0) {
    explanation += analysis.positionalFeatures[0];
  } else {
    explanation += 'the position requires careful play.';
  }
  
  return explanation;
}

function generatePlan(phase: 'opening' | 'middlegame' | 'endgame', analysis: ChatAnalysis): string {
  const suggestion = personality.suggestions[Math.floor(Math.random() * personality.suggestions.length)];
  
  let plan = `\n\n${suggestion} `;
  const patterns = chessKnowledge[phase].patterns;
  plan += patterns[Math.floor(Math.random() * patterns.length)];
  
  return plan;
}

function generateEvaluation(material: number, pieceActivity: string[]): string {
  let evaluation = '';
  
  if (Math.abs(material) > 3) {
    evaluation = material > 0 
      ? 'White has a significant material advantage'
      : 'Black has a significant material advantage';
  } else if (Math.abs(material) > 1) {
    evaluation = material > 0
      ? 'White has a slight material advantage'
      : 'Black has a slight material advantage';
  } else {
    evaluation = 'The position is roughly equal in material';
  }
  
  if (pieceActivity.includes('high piece mobility')) {
    evaluation += ' with active pieces';
  } else if (pieceActivity.includes('restricted piece mobility')) {
    evaluation += ' but piece mobility is restricted';
  }
  
  return evaluation;
}

function analyzePosition(game: Chess): string[] {
  const features = [];
  const board = game.board();
  
  // Center control
  const centerSquares = ['d4', 'd5', 'e4', 'e5'];
  let whiteCenterControl = 0;
  let blackCenterControl = 0;
  
  centerSquares.forEach(square => {
    const piece = game.get(square);
    if (piece) {
      if (piece.color === 'w') whiteCenterControl++;
      else blackCenterControl++;
    }
  });
  
  if (whiteCenterControl > blackCenterControl) {
    features.push('White controls more central squares');
  } else if (blackCenterControl > whiteCenterControl) {
    features.push('Black controls more central squares');
  }
  
  return features;
}