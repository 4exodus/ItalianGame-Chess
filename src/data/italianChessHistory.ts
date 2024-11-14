export interface HistoricalMatch {
  id: number;
  title: string;
  year: string;
  location: string;
  venue: string;
  players: {
    white: string;
    black: string;
  };
  historicalContext: string;
  culturalSignificance: string;
  playerBackgrounds: {
    white: string;
    black: string;
  };
  matchDescription: string;
  keyMoves: Array<{
    move: string;
    annotation: string;
  }>;
  startingPosition: string;
  positions: Array<{
    fen: string;
    description: string;
  }>;
  impact: string;
  imageUrl: string;
}

export const historicalMatches: HistoricalMatch[] = [
  {
    id: 1,
    title: "The Immortal Draw - Venice 1872",
    year: "1872",
    location: "Venice, Italy",
    venue: "Caffè Florian, St. Mark's Square",
    players: {
      white: "Ignazio Calvi",
      black: "Giuseppe Viani"
    },
    historicalContext: "During the height of Venice's chess renaissance, when the city's cafes were intellectual hubs",
    culturalSignificance: "Played in Venice's oldest café, established in 1720, demonstrating the deep connection between Italian coffee culture and chess",
    playerBackgrounds: {
      white: "Calvi was a prominent Venetian chess master and theorist who contributed significantly to opening theory",
      black: "Viani was a rising star in the Italian chess scene, known for his aggressive playing style"
    },
    matchDescription: "A remarkable game that showcased the Italian School's emphasis on rapid development and piece activity",
    keyMoves: [
      {
        move: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
        annotation: "The Italian Game opening, setting the stage for a classical battle"
      },
      {
        move: "3...Bc5 4. c3",
        annotation: "The Giuoco Piano (Quiet Game), a favorite among Italian masters"
      }
    ],
    startingPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    positions: [
      {
        fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        description: "The classic Italian Game position, with both sides developing naturally"
      }
    ],
    impact: "This game popularized the Italian style of play throughout Europe and influenced opening theory for decades",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80"
  },
  {
    id: 2,
    title: "The Florence Masterpiece - 1890",
    year: "1890",
    location: "Florence, Italy",
    venue: "Palazzo Vecchio",
    players: {
      white: "Stefano Rosselli del Turco",
      black: "Luigi Centurini"
    },
    historicalContext: "During Italy's post-unification period, when Florence was establishing itself as a chess center",
    culturalSignificance: "Played in the historic Palazzo Vecchio, symbolizing the fusion of Renaissance art and chess",
    playerBackgrounds: {
      white: "Rosselli was a Florentine nobleman and chess patron who promoted the game throughout Tuscany",
      black: "Centurini was known for his innovative approach to the Italian Game variations"
    },
    matchDescription: "A brilliant display of attacking chess in the Italian style, featuring multiple sacrifices",
    keyMoves: [
      {
        move: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3",
        annotation: "The Giuoco Pianissimo, showing the evolution of Italian chess theory"
      }
    ],
    startingPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    positions: [
      {
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4",
        description: "The Giuoco Pianissimo position, characterized by slow, strategic play"
      }
    ],
    impact: "This game demonstrated the effectiveness of positional play in Italian chess, influencing modern theory",
    imageUrl: "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80"
  }
];