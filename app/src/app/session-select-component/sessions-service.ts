import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

import { db } from '../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private httpClient = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private allSessions = signal<string[]>([]);
  Sessions = this.allSessions.asReadonly();
  currentSessionId = signal<string>('initial');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchSessions();
    }
  }

  fetchSessions() {
    const sessionsCollection = collection(db, 'sessions');

    // function triggers automatically whenever the database changes
    onSnapshot(
      sessionsCollection,
      (snapshot) => {
        const sessionIds = snapshot.docs.map((doc) => doc.id);
        this.allSessions.set(sessionIds);
      },
      (error) => {
        console.error('Real-time error:', error);
      }
    );
  }

  setSessionID(sessionID?: string) {
    if (this.currentSessionId() !== 'initial') {
      this.currentSessionId.set('initial');
    } else {
      this.currentSessionId.set(sessionID!);
    }
  }

  addSession(sessionId: string) {
    const body = { sessionId: sessionId };
    return this.httpClient
      .post<{ sessions: string[] }>(environment.apiUrl + '/sessions', body)
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Add Session failed'));
        })
      );
  }

  deleteSession(sessionId: string) {
    return this.httpClient
      .delete<{ sessions: string[] }>(environment.apiUrl + '/sessions/' + sessionId)
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Delete Session failed'));
        })
      );
  }
}
