import { Component } from '@angular/core';
import { Timer } from '../timer';
import { TimePipe } from '../time-pipe';

@Component({
  selector: 'app-header',
  imports: [TimePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  timer: Timer;

  constructor() {
    this.timer = new Timer();
  }

  onToggleTimer() {
    this.timer.ToggleTimer();
  }
  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }
}
