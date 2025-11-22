import { Component, inject, input } from '@angular/core';
import { Challenge, Status } from '../../../models.model';
import { Timer } from '../../../timer';
import { TimePipe } from '../../../time-pipe';
import { AllChallenges } from '../../all-challenges';

@Component({
  selector: 'app-challenge-item',
  imports: [TimePipe],
  templateUrl: './challenge-item.html',
  styleUrl: './challenge-item.css',
})
export class ChallengeItem {
  challengeItem = input.required<Challenge>();

  challengesService = inject(AllChallenges);

  public timer: Timer;

  constructor() {
    this.timer = new Timer();
  }

  onToggleTimer() {
    this.timer.ToggleTimer();
    if (this.challengeItem().status === Status.DONE) {
      this.challengesService.toggleComplete(this.challengeItem().id);
    }
  }
  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }

  onToggleComplete() {
    this.challengesService.toggleComplete(this.challengeItem().id);
    if (this.timer.isRunning()) {
      this.timer.ToggleTimer();
    }
  }
}
