import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs'; // Added tap

@Injectable({
  providedIn: 'root',
})
export class SessionsService implements OnInit {
  private httpClient = inject(HttpClient);
  private allSessions = signal<string[]>([]);
  Sessions = this.allSessions.asReadonly();

  currentSessionId = signal<string>('initial');

  ngOnInit(): void {
    this.fetchSessions();
  }

  fetchSessions() {
    this.httpClient
      .get<{ sessions: string[] }>('http://localhost:3000/sessions')
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Sessions konnten nicht geladen werden'));
        })
      )
      .subscribe({
        next: (resData) => {
          this.allSessions.set(resData.sessions);
        },
      });
  }

  setSessionID(sessionID?: string) {
    if (this.currentSessionId() !== 'initial') {
      this.currentSessionId.set('initial');
    } else {
      this.currentSessionId.set(sessionID!);
      console.log('Session ID jetzt: ' + sessionID);
    }
  }

  addSession(sessionId: string) {
    const body = { sessionId: sessionId };

    return this.httpClient
      .post<{ sessions: string[] }>('http://localhost:3000/sessions', body)
      .pipe(
        // 3. Use 'tap' to update the list immediately with the response from the server
        tap((resData) => {
          this.allSessions.set(resData.sessions);
        }),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Fehler beim adden einer neuen SESSION'));
        })
      );
  }
}
