export interface Team {
  id: string;
  name: string;
}

export interface TennisScore {
  sets: {
    homeScore: number;
    awayScore: number;
  }[];
  isCompleted: boolean;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  score: TennisScore;
  isCompleted: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  type: 'round-robin';
  status: 'pending' | 'in-progress' | 'completed';
} 