import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Timer {
  isRunning = signal(false);
  seconds = 0;
  timerInterval: any;

  ToggleTimer() {
    if (!this.isRunning()) {
      this.timerInterval = setInterval(() => {
        this.seconds++;
      }, 1000);
    } else {
      clearInterval(this.timerInterval);
    }
    this.isRunning.set(!this.isRunning());
  }
}
