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
  PLATFORM_ID, // Added
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Added
import { Timer } from '../timer';
import { TimePipe } from '../time-pipe';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { RouterLink } from '@angular/router';
import { SessionsService } from '../session-select-component/sessions-service';
import { environment } from '../../environments/environment.development'; // Import Environment

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
  private platformId = inject(PLATFORM_ID); // Inject Platform ID

  public timer: Timer;
  private headerStamp = signal<number | null>(null);

  sessionsService = inject(SessionsService);
  sessionId = this.sessionsService.currentSessionId;

  constructor() {
    this.timer = new Timer();

    effect(() => {
      // CRITICAL FIX: Only run this in the browser
      if (isPlatformBrowser(this.platformId)) {
        const subscription = this.httpClient
          .get<{ timer: number; timeStamp: number | null }>(
            environment.apiUrl + '/header/' + this.sessionId() // Use environment URL
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
              this.timer.seconds = timer.timer;
              this.headerStamp.set(timer.timeStamp);
            },
          });

        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
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

    updatedTimerData.timeStamp = this.timer.isRunning() ? Date.now() : updatedTimerData.timeStamp;

    if (!this.timer.isRunning()) {
      const ms = Date.now() - this.headerStamp()!;
      updatedTimerData.seconds = this.timer.seconds + Math.floor(ms / 1000);
    }

    // Use environment URL
    const subscription = this.httpClient
      .put(environment.apiUrl + '/header-timer', updatedTimerData)
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

  onClickBack() {
    this.sessionsService.setSessionID();
  }
}
