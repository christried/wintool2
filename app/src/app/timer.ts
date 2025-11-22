import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Timer {
  isRunning = signal(false);
  ss = 0;
  mm = 0;
  hh = 0;
  timerInterval: any;

  ToggleTimer() {
    if (!this.isRunning()) {
      this.timerInterval = setInterval(() => {
        this.ss++;
        if (this.ss >= 60) {
          this.mm++;
          this.ss = 0;
        }
        if (this.mm >= 60) {
          this.hh++;
          this.mm = 0;
        }
      }, 1000);
    } else {
      clearInterval(this.timerInterval);
    }
    this.isRunning.set(!this.isRunning());
  }
}
