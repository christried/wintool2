import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private httpClient = inject(HttpClient);

  // speichern aller Session-Namen als string - erstmal dummy daten
  private allSessions = signal<string[]>(['testwinnie', 'testwinnie2', 'testwinnie3']);

  Sessions = this.allSessions.asReadonly();

  // Global signal for the current session
  currentSessionId = signal<string>('initial');

  setSessionID(sessionID?: string) {
    if (this.currentSessionId() !== 'initial') {
      this.currentSessionId.set('initial');
    } else {
      this.currentSessionId.set(sessionID!);
      console.log('Session ID jetzt: ' + sessionID);
    }
  }

  addSession(sessionId: string) {
    this.allSessions.update((prevSessions) => [...prevSessions, sessionId]);

    const body = { sessionId: sessionId };

    return this.httpClient.post('http://localhost:3000/sessions', body).pipe(
      catchError((err) => {
        console.log(err);
        return throwError(() => new Error('Fehler beim adden einer neuen SESSION'));
      })
    );
  }
}
