import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Timer } from '../timer';
import { TimePipe } from '../time-pipe';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [TimePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private destroyRef = inject(DestroyRef);
  private httpClient = inject(HttpClient);

  public timer: Timer;
  private headerStamp = signal<number | null>(null);

  constructor() {
    this.timer = new Timer();
  }

  ngOnInit(): void {
    const subscription = this.httpClient
      .get<{ timer: number; timeStamp: number | null }>('http://localhost:3000/header')
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
  }

  onToggleTimer() {
    this.timer.ToggleTimer();

    this.headerStamp.set(Date.now());

    const updatedTimerData = { seconds: this.timer.seconds, timeStamp: this.headerStamp() };
    // Wenn Timer gestartet wird, dann neuen Timestamp im Backend hinterlegen
    updatedTimerData.timeStamp = this.timer.isRunning() ? Date.now() : updatedTimerData.timeStamp;
    // Wenn Timer pausiert wird, dann Zeit berechnen aus altem Timestamp und neuem Timestamp & Zeit im Backend hinterlegen
    if (!this.timer.isRunning()) {
      const ms = Date.now() - this.headerStamp()!;
      updatedTimerData.seconds = this.timer.seconds + Math.floor(ms / 1000);
    }

    const subscription = this.httpClient
      .put('http://localhost:3000/header-timer', updatedTimerData)
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(
            () =>
              new Error(
                'Fehler beim Updaten des Header-Timers ins Backend - bald ist es geschafft glaub ich'
              )
          );
        })
      )
      .subscribe({
        next: (resData) => {
          console.log('Header-Timer Update ins Backend erfolgreich, hier resData');
          console.log(resData);
        },
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }
}
