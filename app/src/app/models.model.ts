export interface Challenge {
  game: string;
  goal: string;
  id: string;
  status: Status;
}

export enum Status {
  'OPEN',
  'DONE',
}
