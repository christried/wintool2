import { inject, Injectable, signal } from '@angular/core';
import { Challenge, Status } from '../models.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AllChallenges {
  private httpClient = inject(HttpClient);

  allChallenges = signal<Challenge[]>([]);

  fetchChallenges() {
    return this.httpClient
      .get<{ challenges: Challenge[] }>('http://localhost:3000/challenges')
      .pipe(
        map((resData) => resData.challenges),
        catchError((err) => {
          console.log(err);
          return throwError(
            () => new Error('Challenges konnten nicht geladen werden, naja schade')
          );
        })
      );
  }

  addGame({ game, goal }: { game: string; goal: string }) {
    const newChallenge: Challenge = {
      game: game,
      goal: goal,
      id: Math.random().toString(),
      status: Status.OPEN,
      timer: 0,
      timeStamp: null,
    };

    const prevChallenges = this.allChallenges();

    this.allChallenges.update((c) => {
      c.push(newChallenge);
      return c;
    });

    return this.httpClient.put('http://localhost:3000/add-game', { challenge: newChallenge }).pipe(
      catchError((err) => {
        this.allChallenges.set(prevChallenges);
        console.log(err);
        return throwError(
          () =>
            new Error(
              'Fehler beim adden einer neuen Challenge - kriegt man schon wieder hin irgendwie'
            )
        );
      })
    );
  }

  updateGame(newChallenge: Challenge) {
    const prevChallenges = this.allChallenges();

    return this.httpClient.put('http://localhost:3000/add-game', { challenge: newChallenge }).pipe(
      catchError((err) => {
        this.allChallenges.set(prevChallenges);
        console.log(err);
        return throwError(
          () =>
            new Error(
              'Fehler beim adden einer neuen Challenge - kriegt man schon wieder hin irgendwie'
            )
        );
      })
    );
  }

  deleteGame(challengeID: string) {
    const newChallenges = this.allChallenges().filter((c) => {
      return c.id !== challengeID;
    });

    const prevChallenges = this.allChallenges();

    this.allChallenges.set(newChallenges);

    return this.httpClient.delete('http://localhost:3000/delete-game/' + challengeID).pipe(
      catchError((err) => {
        this.allChallenges.set(prevChallenges);
        console.log(err);
        return throwError(
          () =>
            new Error(
              'Fehler beim Löschen einer neuen Challenge - kriegt man schon wieder hin irgendwie'
            )
        );
      })
    );
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
