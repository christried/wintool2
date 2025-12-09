import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { Challenge, Status } from '../models.model';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

import { db } from '../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AllChallenges {
  private httpClient = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  allChallenges = signal<Challenge[]>([]);

  fetchChallenges(sessionId: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const sessionRef = doc(db, 'sessions', sessionId);

    // Listen to the session document
    onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update the signal automatically when data changes
        this.allChallenges.set(data['challenges'] || []);
      }
    });
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

    // Optimistic Update (shows immediately before server responds)
    this.allChallenges.update((c) => [...c, newChallenge]);

    return this.httpClient
      .put(environment.apiUrl + '/add-game', { challenge: newChallenge, sessionId: sessionId })
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Add failed'));
        })
      );
  }

  updateGame(newChallenge: Challenge, sessionId: string) {
    // Optimistic Update
    this.allChallenges.update((list) =>
      list.map((c) => (c.id === newChallenge.id ? newChallenge : c))
    );

    return this.httpClient
      .put(environment.apiUrl + '/add-game', { challenge: newChallenge, sessionId: sessionId })
      .pipe(catchError((err) => throwError(() => new Error('Update failed'))));
  }

  deleteGame(challengeID: string, sessionId: string) {
    this.allChallenges.update((list) => list.filter((c) => c.id !== challengeID));

    return this.httpClient
      .delete(environment.apiUrl + '/delete-game/' + sessionId + '/' + challengeID)
      .pipe(catchError((err) => throwError(() => new Error('Delete failed'))));
  }

  toggleComplete(challengeID: string) {
    const list = this.allChallenges();
    const item = list.find((c) => c.id === challengeID);
    if (item) {
      // just clone it to trigger change detection if needed,
      // but actual saving happens in the component calling updateGame usually
      // For now, let's just update the local state logic
      const updatedItem = {
        ...item,
        status: item.status === Status.OPEN ? Status.DONE : Status.OPEN,
      };
      this.updateGame(updatedItem, 'temp-id-handled-by-component'); // Warning: logic split here, see step 3
    }
  }

  isChallengeComplete(challengeID: string): boolean {
    const found = this.allChallenges().find((c) => c.id === challengeID);
    return found?.status === Status.DONE ? true : false;
  }
}
