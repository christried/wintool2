import { Component, inject } from '@angular/core';
import { Timer } from '../timer';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  timer: Timer;

  constructor() {
    this.timer = new Timer();
  }

  onToggleTimer() {
    this.timer.onToggleTimer();
  }
  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }
}
