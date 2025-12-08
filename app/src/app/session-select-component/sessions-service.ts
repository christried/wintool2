import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // speichern aller Session-Namen als string - erstmal dummy daten
  private allSessions = signal<string[]>(['testwinnie', 'testwinnie2', 'testwinnie3']);

  Sessions = this.allSessions.asReadonly();

  // Global signal for the current session
  currentSessionId = signal<string>('initial');

  setSessionID(sessionID: string) {
    this.currentSessionId.set(sessionID);
    console.log('Session ID jetzt: ' + sessionID);
  }

  clearSessionID() {
    this.currentSessionId.set('initial');
  }
}
