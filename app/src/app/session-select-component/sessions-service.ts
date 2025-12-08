import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core'; // Added PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Added isPlatformBrowser
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development'; // Import Environment

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private httpClient = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Inject Platform ID

  // Initialize with empty array
  private allSessions = signal<string[]>([]);

  // Public read-only signal for the component
  Sessions = this.allSessions.asReadonly();

  currentSessionId = signal<string>('initial');

  constructor() {
    // CRITICAL FIX: Only fetch if we are in the browser!
    // This prevents the "ECONNREFUSED" error during the build.
    if (isPlatformBrowser(this.platformId)) {
      this.fetchSessions();
    }
  }

  fetchSessions() {
    // Use environment.apiUrl instead of localhost
    this.httpClient
      .get<{ sessions: string[] }>(environment.apiUrl + '/sessions')
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
    // Use environment.apiUrl
    return this.httpClient
      .post<{ sessions: string[] }>(environment.apiUrl + '/sessions', body)
      .pipe(
        tap((resData) => this.allSessions.set(resData.sessions)),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Add Session failed'));
        })
      );
  }

  deleteSession(sessionId: string) {
    // Use environment.apiUrl
    return this.httpClient
      .delete<{ sessions: string[] }>(environment.apiUrl + '/sessions/' + sessionId)
      .pipe(
        tap((resData) => this.allSessions.set(resData.sessions)),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Delete Session failed'));
        })
      );
  }
}
