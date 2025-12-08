import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private httpClient = inject(HttpClient);

  // Initialize with empty array
  private allSessions = signal<string[]>([]);

  // Public read-only signal for the component
  Sessions = this.allSessions.asReadonly();

  currentSessionId = signal<string>('initial');

  constructor() {
    this.fetchSessions();
  }

  fetchSessions() {
    this.httpClient
      .get<{ sessions: string[] }>('http://localhost:3000/sessions')
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Sessions load failed'));
        })
      )
      .subscribe({
        next: (resData) => this.allSessions.set(resData.sessions),
      });
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
      .post<{ sessions: string[] }>('http://localhost:3000/sessions', body)
      .pipe(
        tap((resData) => this.allSessions.set(resData.sessions)),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Add Session failed'));
        })
      );
  }

  deleteSession(sessionId: string) {
    return this.httpClient
      .delete<{ sessions: string[] }>('http://localhost:3000/sessions/' + sessionId)
      .pipe(
        tap((resData) => this.allSessions.set(resData.sessions)),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Delete Session failed'));
        })
      );
  }
}
