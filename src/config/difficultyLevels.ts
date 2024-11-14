export interface DifficultyLevel {
  name: string;
  elo: number;
  depth: number;
  skillLevel: number;
  description: string;
}

export const difficultyLevels: Record<number, DifficultyLevel> = {
  1: {
    name: "Complete Beginner",
    elo: 500,
    depth: 2,
    skillLevel: 0,
    description: "Makes many mistakes"
  },
  2: {
    name: "Casual Player",
    elo: 800,
    depth: 3,
    skillLevel: 3,
    description: "Basic moves"
  },
  3: {
    name: "Regular Player",
    elo: 1200,
    depth: 5,
    skillLevel: 6,
    description: "Understands basics"
  },
  4: {
    name: "Club Player",
    elo: 1500,
    depth: 8,
    skillLevel: 10,
    description: "Solid amateur"
  },
  5: {
    name: "Strong Club Player",
    elo: 1800,
    depth: 12,
    skillLevel: 14,
    description: "Advanced amateur"
  },
  6: {
    name: "Expert",
    elo: 2000,
    depth: 15,
    skillLevel: 16,
    description: "Tournament level"
  },
  7: {
    name: "Master",
    elo: 2200,
    depth: 18,
    skillLevel: 18,
    description: "Professional strength"
  },
  8: {
    name: "Grandmaster",
    elo: 2500,
    depth: 20,
    skillLevel: 20,
    description: "Elite level"
  }
};