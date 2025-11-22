export interface Challenge {
  game: string;
  goal: string;
  id: string;
  status: 'OPEN' | 'DONE';
}
