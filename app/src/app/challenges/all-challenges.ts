import { inject, Injectable, input, signal } from '@angular/core';
import { Challenge, Status } from '../models.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development'; // 1. Import Environment

@Injectable({
  providedIn: 'root',
})
export class AllChallenges {
  private httpClient = inject(HttpClient);

  allChallenges = signal<Challenge[]>([]);

  fetchChallenges(sessionId: string) {
    // 2. Use environment.apiUrl
    return this.httpClient
      .get<{ challenges: Challenge[] }>(environment.apiUrl + '/challenges/' + sessionId)
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

  addGame({ game, goal }: { game: string; goal: string }, sessionId: string) {
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

    // 3. Use environment.apiUrl
    return this.httpClient
      .put(environment.apiUrl + '/add-game', { challenge: newChallenge, sessionId: sessionId })
      .pipe(
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

  updateGame(newChallenge: Challenge, sessionId: string) {
    const prevChallenges = this.allChallenges();

    // 4. Use environment.apiUrl
    return this.httpClient
      .put(environment.apiUrl + '/add-game', { challenge: newChallenge, sessionId: sessionId })
      .pipe(
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

  deleteGame(challengeID: string, sessionId: string) {
    const newChallenges = this.allChallenges().filter((c) => {
      return c.id !== challengeID;
    });

    const prevChallenges = this.allChallenges();

    this.allChallenges.set(newChallenges);

    // 5. Use environment.apiUrl
    return this.httpClient
      .delete(environment.apiUrl + '/delete-game/' + sessionId + '/' + challengeID)
      .pipe(
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
