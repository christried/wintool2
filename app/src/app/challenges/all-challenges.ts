import { Injectable, signal } from '@angular/core';
import { Challenge, Status } from '../models.model';

@Injectable({
  providedIn: 'root',
})
export class AllChallenges {
  allChallenges = signal<Challenge[]>([]);

  addGame({ game, goal }: { game: string; goal: string }) {
    const newChallenge: Challenge = {
      game: game,
      goal: goal,
      id: Math.random().toString(),
      status: Status.OPEN,
    };

    this.allChallenges.update((c) => {
      c.push(newChallenge);
      return c;
    });
    console.log(this.allChallenges());
  }

  deleteGame(challengeID: string) {
    const newChallenges = this.allChallenges().filter((c) => {
      return c.id !== challengeID;
    });

    this.allChallenges.set(newChallenges);
  }

  toggleComplete(challengeID: string) {
    const newChallenges = this.allChallenges().map((c) => {
      if (c.id === challengeID) {
        const newStatus = c.status === Status.OPEN ? Status.DONE : Status.OPEN;
        c.status = newStatus;
      }
      return c;
    });

    this.allChallenges.set(newChallenges);
  }

  isChallengeComplete(challengeID: string): boolean {
    const found = this.allChallenges().find((c) => c.id === challengeID);
    return found?.status === Status.DONE ? true : false;
  }
}
