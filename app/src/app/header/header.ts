import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { Timer } from '../timer';
import { TimePipe } from '../time-pipe';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../session-select-component/sessions-service';
import { sign } from 'crypto';

@Component({
  selector: 'app-header',
  imports: [TimePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnChanges {
  private destroyRef = inject(DestroyRef);
  private httpClient = inject(HttpClient);

  public timer: Timer;
  private headerStamp = signal<number | null>(null);

  sessionsService = inject(SessionsService);
  sessionId = this.sessionsService.currentSessionId;

  constructor() {
    this.timer = new Timer();

    effect(() => {
      const subscription = this.httpClient
        .get<{ timer: number; timeStamp: number | null }>(
          'http://localhost:3000/header/' + this.sessionId()
        )
        .pipe(
          catchError((err) => {
            console.log(err);
            return throwError(
              () => new Error('Header-Timer konnte nicht geladen werden, naja schade')
            );
          })
        )
        .subscribe({
          next: (timer) => {
            // console.log('das hier sollten sekunden sein:', timer.timer);
            this.timer.seconds = timer.timer;
            this.headerStamp.set(timer.timeStamp);
          },
        });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
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

    updatedTimerData.timeStamp = this.timer.isRunning() ? Date.now() : updatedTimerData.timeStamp;

    if (!this.timer.isRunning()) {
      const ms = Date.now() - this.headerStamp()!;
      updatedTimerData.seconds = this.timer.seconds + Math.floor(ms / 1000);
    }

    const subscription = this.httpClient
      .put('http://localhost:3000/header-timer', updatedTimerData)
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Fehler beim Updaten des Header-Timers ins Backend'));
        })
      )
      .subscribe({
        next: (resData) => {
          console.log('Header-Timer Update successful', resData);
        },
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }
}
