import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    trainer: 'Trainer',
    story: 'Story Mode',
    language: 'Language',
    english: 'English',
    italian: 'Italian',

    // Home
    welcome: 'Welcome to Italian Game - Chess',
    homeSubtitle: 'Master the art of chess through interactive training and historical insights',
    trainerTitle: 'Chess Trainer',
    trainerDescription: 'Practice with our advanced AI trainer, analyze your moves, and improve your game with real-time feedback and suggestions.',
    storyTitle: 'Story Mode',
    storyDescription: 'Journey through the rich history of Italian chess, learn classic openings, and master legendary games from the greatest Italian players.',

    // Trainer
    engineSettings: 'Engine Settings',
    flipBoard: 'Flip Board',
    analyzeGame: 'Analyze Game',
    newGame: 'New Game',
    difficulty: 'Difficulty',
    eloRating: 'ELO Rating',
    thinkingTime: 'Engine Thinking Time',
    seconds: 'seconds',
    engineThinking: 'Engine is thinking...',
    initializingEngine: 'Initializing chess engine...',
    gameInformation: 'Game Information',
    playingAs: 'Playing as',
    boardView: 'Board view',
    movesPlayed: 'Moves played',
    gameStatus: 'Game status',
    white: 'White',
    black: 'Black',
    inProgress: 'In progress',
    check: 'Check!',
    checkmate: 'Checkmate!',
    draw: 'Draw',
    chooseSide: 'Choose Your Side',
    playAsWhite: 'Play as White',
    playAsBlack: 'Play as Black',

    // Analysis
    gameAnalysis: 'Game Analysis',
    analysisChat: 'Analysis Chat',
    hideChat: 'Hide Chat',
    showChat: 'Show Chat',
    moveHistory: 'Move History',
    initialPosition: 'Initial Position',
    moveOf: 'Move {current} of {total}',
    hideAnalysis: 'Hide Analysis Chat',
    showAnalysis: 'Show Analysis Chat',
    close: 'Close',

    // Story Mode
    historicalMatches: 'Historical Matches',
    positionAnalysis: 'Position Analysis',
    previous: 'Previous',
    next: 'Next',
    historicalContext: 'Historical Context',
    players: 'Players',
    historicalImpact: 'Historical Impact',

    // Game Status
    whiteToMove: 'White to move',
    blackToMove: 'Black to move',
    stalemateDrawn: 'Draw by stalemate',
    repetitionDrawn: 'Draw by threefold repetition',
    insufficientDrawn: 'Draw by insufficient material',
    fiftyMoveDrawn: 'Draw by fifty-move rule',
    whiteWins: 'White wins!',
    blackWins: 'Black wins!',
  },
  it: {
    // Navigation
    trainer: 'Allenatore',
    story: 'Modalità Storia',
    language: 'Lingua',
    english: 'Inglese',
    italian: 'Italiano',

    // Home
    welcome: 'Benvenuto a Italian Game - Scacchi',
    homeSubtitle: 'Padroneggia l\'arte degli scacchi attraverso allenamento interattivo e approfondimenti storici',
    trainerTitle: 'Allenatore di Scacchi',
    trainerDescription: 'Allenati con il nostro trainer AI avanzato, analizza le tue mosse e migliora il tuo gioco con feedback e suggerimenti in tempo reale.',
    storyTitle: 'Modalità Storia',
    storyDescription: 'Viaggia attraverso la ricca storia degli scacchi italiani, impara le aperture classiche e padroneggia le partite leggendarie dei più grandi giocatori italiani.',

    // Trainer
    engineSettings: 'Impostazioni Motore',
    flipBoard: 'Ruota Scacchiera',
    analyzeGame: 'Analizza Partita',
    newGame: 'Nuova Partita',
    difficulty: 'Difficoltà',
    eloRating: 'Punteggio ELO',
    thinkingTime: 'Tempo di Riflessione',
    seconds: 'secondi',
    engineThinking: 'Il motore sta pensando...',
    initializingEngine: 'Inizializzazione motore scacchistico...',
    gameInformation: 'Informazioni Partita',
    playingAs: 'Giochi con',
    boardView: 'Vista scacchiera',
    movesPlayed: 'Mosse giocate',
    gameStatus: 'Stato partita',
    white: 'Bianco',
    black: 'Nero',
    inProgress: 'In corso',
    check: 'Scacco!',
    checkmate: 'Scacco matto!',
    draw: 'Patta',
    chooseSide: 'Scegli il Tuo Colore',
    playAsWhite: 'Gioca con il Bianco',
    playAsBlack: 'Gioca con il Nero',

    // Analysis
    gameAnalysis: 'Analisi Partita',
    analysisChat: 'Chat Analisi',
    hideChat: 'Nascondi Chat',
    showChat: 'Mostra Chat',
    moveHistory: 'Storia Mosse',
    initialPosition: 'Posizione Iniziale',
    moveOf: 'Mossa {current} di {total}',
    hideAnalysis: 'Nascondi Chat Analisi',
    showAnalysis: 'Mostra Chat Analisi',
    close: 'Chiudi',

    // Story Mode
    historicalMatches: 'Partite Storiche',
    positionAnalysis: 'Analisi Posizione',
    previous: 'Precedente',
    next: 'Successiva',
    historicalContext: 'Contesto Storico',
    players: 'Giocatori',
    historicalImpact: 'Impatto Storico',

    // Game Status
    whiteToMove: 'Muove il Bianco',
    blackToMove: 'Muove il Nero',
    stalemateDrawn: 'Patta per stallo',
    repetitionDrawn: 'Patta per tripla ripetizione',
    insufficientDrawn: 'Patta per materiale insufficiente',
    fiftyMoveDrawn: 'Patta per regola delle cinquanta mosse',
    whiteWins: 'Il Bianco vince!',
    blackWins: 'Il Nero vince!',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations['en']] || key;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}