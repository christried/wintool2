import { Component, inject, input } from '@angular/core';
import { Challenge } from '../../../models.model';
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
  }
  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }

  onToggleComplete() {
    this.challengesService.toggleComplete(this.challengeItem().id);
    this.timer.ToggleTimer();
  }
}
