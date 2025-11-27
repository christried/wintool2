export interface Challenge {
  game: string;
  goal: string;
  id: string;
  status: Status;
  timer: number | null;
}

export enum Status {
  'OPEN',
  'DONE',
}
