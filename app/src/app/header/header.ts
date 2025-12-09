import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Timer } from '../timer';
import { TimePipe } from '../time-pipe';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { RouterLink } from '@angular/router';
import { SessionsService } from '../session-select-component/sessions-service';
import { environment } from '../../environments/environment.development';

import { db } from '../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-header',
  imports: [TimePipe, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Header implements OnInit, OnChanges {
  private destroyRef = inject(DestroyRef);
  private httpClient = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public timer: Timer;
  private headerStamp = signal<number | null>(null);

  sessionsService = inject(SessionsService);
  sessionId = this.sessionsService.currentSessionId;

  constructor() {
    this.timer = new Timer();

    effect(() => {
      const currentId = this.sessionId();

      if (isPlatformBrowser(this.platformId) && currentId && currentId !== 'initial') {
        const sessionDocRef = doc(db, 'sessions', currentId);

        const unsubscribe = onSnapshot(sessionDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const serverTimer = data['headerTimer'] || { timer: 0, timeStamp: null };

            //  Calculate the correct time
            if (serverTimer.timeStamp) {
              // Timer is running: Add the elapsed time to the base seconds
              const now = Date.now();
              const elapsedSeconds = Math.floor((now - serverTimer.timeStamp) / 1000);
              this.timer.seconds = serverTimer.timer + elapsedSeconds;
            } else {
              // Timer is stopped: Just use the stored value
              this.timer.seconds = serverTimer.timer;
            }

            this.headerStamp.set(serverTimer.timeStamp);

            if (serverTimer.timeStamp && !this.timer.isRunning()) {
              this.timer.ToggleTimer();
            } else if (!serverTimer.timeStamp && this.timer.isRunning()) {
              this.timer.ToggleTimer();
            }
          }
        });

        this.destroyRef.onDestroy(() => {
          unsubscribe();
        });
      }
    });
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}

  onToggleTimer() {
    this.timer.ToggleTimer();
    this.headerStamp.set(Date.now());

    const updatedTimerData = {
      seconds: this.timer.seconds,
      timeStamp: this.headerStamp(),
      sessionId: this.sessionId(),
    };

    updatedTimerData.timeStamp = this.timer.isRunning() ? Date.now() : null; // Send null if stopped

    if (!this.timer.isRunning()) {
      const ms = Date.now() - this.headerStamp()!;
      updatedTimerData.seconds = this.timer.seconds + Math.floor(ms / 1000);
    }

    this.httpClient
      .put(environment.apiUrl + '/header-timer', updatedTimerData)
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Fehler beim Updaten'));
        })
      )
      .subscribe({
        next: (resData) => console.log('Timer synced'),
      });
  }

  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }

  onClickBack() {
    this.sessionsService.setSessionID();
  }
}
