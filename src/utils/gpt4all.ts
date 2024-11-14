import { create } from 'zustand';

interface GPTState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  context: {
    previousQuestions: string[];
    gamePhase: 'opening' | 'middlegame' | 'endgame';
    playerColor: 'white' | 'black' | null;
    positionHistory: Array<{
      fen: string;
      evaluation: number;
      moveNumber: number;
    }>;
  };
  initialize: () => Promise<void>;
  generateResponse: (prompt: string, context: AnalysisContext) => Promise<string>;
  updateContext: (update: Partial<GPTState['context']>) => void;
}

interface AnalysisContext {
  fen: string;
  evaluation: number;
  moveHistory: string[];
  lastMove?: string;
  playerColor?: 'white' | 'black';
  gamePhase?: 'opening' | 'middlegame' | 'endgame';
}

// Enhanced chess knowledge base
const chessKnowledge = {
  openings: {
    patterns: [
      { name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], themes: ['Center control', 'Quick development', 'King safety'] },
      { name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], themes: ['Pin', 'Center control', 'Pawn structure'] },
      { name: 'Sicilian Defense', moves: ['e4', 'c5'], themes: ['Counter-attack', 'Imbalanced position', 'Complex play'] }
    ],
    principles: [
      { principle: 'Control the center', explanation: 'Occupy or influence the central squares (d4, d5, e4, e5) with pawns and pieces' },
      { principle: 'Develop pieces', explanation: 'Bring out your minor pieces (knights and bishops) before major pieces (queen)' },
      { principle: 'King safety', explanation: 'Castle early to protect your king and connect your rooks' },
      { principle: 'Avoid early queen moves', explanation: 'The queen can be attacked easily, losing tempo in the opening' }
    ]
  },
  middlegame: {
    themes: [
      { theme: 'Piece coordination', explanation: 'Ensure your pieces work together and support each other' },
      { theme: 'Pawn structure', explanation: 'Create and exploit pawn weaknesses, establish outposts' },
      { theme: 'King safety', explanation: 'Maintain pawn shield, watch for attacks' },
      { theme: 'Space advantage', explanation: 'Control more squares and restrict opponent\'s pieces' }
    ],
    tactics: [
      { name: 'Pin', explanation: 'A piece cannot move because it would expose a more valuable piece to capture' },
      { name: 'Fork', explanation: 'One piece attacks two or more enemy pieces simultaneously' },
      { name: 'Discovered attack', explanation: 'Moving one piece reveals an attack from another' },
      { name: 'Double attack', explanation: 'Two or more pieces attack a single enemy target' }
    ]
  },
  endgame: {
    principles: [
      { principle: 'Active king', explanation: 'The king becomes a strong piece in the endgame and should be activated' },
      { principle: 'Passed pawns', explanation: 'Create and push passed pawns towards promotion' },
      { principle: 'Centralization', explanation: 'Place pieces in central squares for maximum effectiveness' },
      { principle: 'Opposition', explanation: 'Control key squares in front of passed pawns' }
    ],
    patterns: [
      { name: 'Lucena position', explanation: 'Winning technique in rook endgames with a passed pawn' },
      { name: 'Philidor position', explanation: 'Drawing technique in rook endgames' },
      { name: 'Triangulation', explanation: 'Losing a move to force the opponent into zugzwang' }
    ]
  }
};

// Enhanced personality traits for more natural responses
const personalityTraits = {
  teaching: [
    'Looking at this position, a key concept to understand is...',
    'This is an interesting situation where we need to consider...',
    'Let me break down the important elements here...',
    'A crucial principle to apply in this position is...'
  ],
  encouragement: [
    'That\'s a great question! Let\'s analyze this position together.',
    'Excellent observation! Here\'s what we should consider...',
    'You\'re thinking along the right lines. Let\'s explore this further.',
    'Good thinking! Let me add some important considerations...'
  ],
  suggestions: [
    'In this position, you might want to consider...',
    'A strong plan here would be to...',
    'One promising idea is to...',
    'Given the pawn structure, you could try...'
  ],
  warnings: [
    'Be careful about...',
    'Watch out for...',
    'One thing to avoid here is...',
    'Make sure you don\'t overlook...'
  ]
};

function determineGamePhase(
  moveCount: number,
  fen: string,
  evaluation: number
): 'opening' | 'middlegame' | 'endgame' {
  // Count major pieces
  const majorPieces = (fen.match(/[QRBN]/g) || []).length;
  const pawns = (fen.match(/[P]/gi) || []).length;

  if (moveCount <= 10 && majorPieces >= 8) return 'opening';
  if (majorPieces <= 4 || pawns <= 8) return 'endgame';
  return 'middlegame';
}

function analyzePawnStructure(fen: string): {
  weaknesses: string[];
  strengths: string[];
} {
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  
  // Count doubled pawns
  const ranks = fen.split('/');
  const files = new Array(8).fill(0);
  
  ranks.forEach(rank => {
    let fileIndex = 0;
    for (let i = 0; i < rank.length; i++) {
      const char = rank[i];
      if (char === 'P' || char === 'p') {
        files[fileIndex]++;
      }
      if (isNaN(parseInt(char))) {
        fileIndex++;
      } else {
        fileIndex += parseInt(char);
      }
    }
  });

  // Analyze pawn structure
  files.forEach((count, index) => {
    if (count > 1) {
      weaknesses.push(`doubled pawns on file ${String.fromCharCode(97 + index)}`);
    }
    if (count === 0 && (index > 0 && files[index - 1] > 0) && (index < 7 && files[index + 1] > 0)) {
      weaknesses.push(`isolated pawns near file ${String.fromCharCode(97 + index)}`);
    }
    if (count === 1 && (index === 0 || files[index - 1] === 0) && (index === 7 || files[index + 1] === 0)) {
      strengths.push(`passed pawn potential on file ${String.fromCharCode(97 + index)}`);
    }
  });

  return { weaknesses, strengths };
}

function generateContextualResponse(
  query: string,
  context: AnalysisContext,
  previousQuestions: string[]
): string {
  // Add personality to the response
  const intro = personalityTraits.encouragement[
    Math.floor(Math.random() * personalityTraits.encouragement.length)
  ];

  // Analyze the position
  const phase = determineGamePhase(context.moveHistory.length, context.fen, context.evaluation);
  const pawnStructure = analyzePawnStructure(context.fen);
  
  // Build the response
  let response = `${intro}\n\n`;

  // Add phase-specific advice
  const phaseAdvice = generatePhaseAdvice(phase, context);
  response += phaseAdvice;

  // Add evaluation context with more detail
  if (Math.abs(context.evaluation) > 3) {
    response += `\nThe position is clearly ${context.evaluation > 0 ? 'better for White' : 'better for Black'} (${Math.abs(context.evaluation).toFixed(1)}). `;
    response += generateAdvantageExplanation(context.evaluation, phase);
  } else if (Math.abs(context.evaluation) > 1) {
    response += `\nWhite has ${context.evaluation > 0 ? 'an advantage' : 'a disadvantage'} of ${Math.abs(context.evaluation).toFixed(1)}. `;
  } else {
    response += '\nThe position is roughly equal. ';
  }

  // Add specific response based on query type
  if (query.toLowerCase().includes('what') && query.toLowerCase().includes('do')) {
    response += generateActionableAdvice(context, phase);
  } else if (query.toLowerCase().includes('why')) {
    response += generateExplanation(query, context, phase);
  } else if (query.toLowerCase().includes('plan')) {
    response += generateStrategicPlan(context, phase, pawnStructure);
  }

  // Add relevant warnings if necessary
  if (Math.abs(context.evaluation) > 2 && context.evaluation < 0) {
    response += `\n\n${personalityTraits.warnings[0]} Your position requires careful defense. `;
  }

  return response;
}

function generatePhaseAdvice(phase: 'opening' | 'middlegame' | 'endgame', context: AnalysisContext): string {
  switch (phase) {
    case 'opening':
      const principle = chessKnowledge.openings.principles[
        Math.floor(Math.random() * chessKnowledge.openings.principles.length)
      ];
      return `${principle.principle}: ${principle.explanation}. `;
      
    case 'middlegame':
      const theme = chessKnowledge.middlegame.themes[
        Math.floor(Math.random() * chessKnowledge.middlegame.themes.length)
      ];
      return `${theme.theme}: ${theme.explanation}. `;
      
    case 'endgame':
      const endgamePrinciple = chessKnowledge.endgame.principles[
        Math.floor(Math.random() * chessKnowledge.endgame.principles.length)
      ];
      return `${endgamePrinciple.principle}: ${endgamePrinciple.explanation}. `;
  }
}

function generateAdvantageExplanation(evaluation: number, phase: 'opening' | 'middlegame' | 'endgame'): string {
  const side = evaluation > 0 ? 'White' : 'Black';
  switch (phase) {
    case 'opening':
      return `${side} has better piece development and control of key squares.`;
    case 'middlegame':
      return `${side} has superior piece coordination and attacking chances.`;
    case 'endgame':
      return `${side} has a decisive material or positional advantage.`;
    default:
      return '';
  }
}

function generateActionableAdvice(
  context: AnalysisContext,
  phase: 'opening' | 'middlegame' | 'endgame'
): string {
  const suggestion = personalityTraits.suggestions[
    Math.floor(Math.random() * personalityTraits.suggestions.length)
  ];

  switch (phase) {
    case 'opening':
      return `\n${suggestion} focus on completing your development and securing king safety.`;
    case 'middlegame':
      return `\n${suggestion} look for tactical opportunities while improving your piece positions.`;
    case 'endgame':
      return `\n${suggestion} activate your king and create passed pawns.`;
  }
}

function generateExplanation(
  query: string,
  context: AnalysisContext,
  phase: 'opening' | 'middlegame' | 'endgame'
): string {
  const teaching = personalityTraits.teaching[
    Math.floor(Math.random() * personalityTraits.teaching.length)
  ];

  // Add phase-specific explanations
  switch (phase) {
    case 'opening':
      return `\n${teaching} In the opening, every move should contribute to development and center control.`;
    case 'middlegame':
      return `\n${teaching} The middlegame is about coordinating your pieces and creating attacking chances.`;
    case 'endgame':
      return `\n${teaching} In the endgame, king activity and pawn advancement are crucial.`;
  }
}

function generateStrategicPlan(
  context: AnalysisContext,
  phase: 'opening' | 'middlegame' | 'endgame',
  pawnStructure: { weaknesses: string[], strengths: string[] }
): string {
  const suggestion = personalityTraits.suggestions[
    Math.floor(Math.random() * personalityTraits.suggestions.length)
  ];

  let plan = `\n${suggestion} `;
  
  // Add phase-specific plans
  switch (phase) {
    case 'opening':
      plan += 'Complete your development by castling and connecting your rooks. ';
      break;
    case 'middlegame':
      if (pawnStructure.weaknesses.length > 0) {
        plan += `Target the opponent's weaknesses: ${pawnStructure.weaknesses[0]}. `;
      }
      if (pawnStructure.strengths.length > 0) {
        plan += `Utilize your strengths: ${pawnStructure.strengths[0]}. `;
      }
      break;
    case 'endgame':
      plan += 'Centralize your king and create passed pawns. ';
      break;
  }

  return plan;
}

export const useGPT = create<GPTState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  error: null,
  context: {
    previousQuestions: [],
    gamePhase: 'opening',
    playerColor: null,
    positionHistory: []
  },

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        isInitialized: true,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize AI';
      set({ 
        error: errorMessage,
        isLoading: false,
        isInitialized: false
      });
      throw error;
    }
  },

  generateResponse: async (prompt: string, context: AnalysisContext) => {
    try {
      set({ isLoading: true, error: null });
      
      const state = get();
      const response = generateContextualResponse(
        prompt,
        context,
        state.context.previousQuestions
      );

      // Update context with the new question and position
      set(state => ({
        context: {
          ...state.context,
          previousQuestions: [...state.context.previousQuestions, prompt],
          positionHistory: [
            ...state.context.positionHistory,
            {
              fen: context.fen,
              evaluation: context.evaluation,
              moveNumber: context.moveHistory.length
            }
          ]
        }
      }));

      set({ isLoading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  updateContext: (update) => {
    set(state => ({
      context: {
        ...state.context,
        ...update
      }
    }));
  }
}));