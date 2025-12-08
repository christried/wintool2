import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
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
export class ChallengeItem implements OnInit {
  private destroyRef = inject(DestroyRef);
  challengeItem = input.required<Challenge>();
  challengesService = inject(AllChallenges);

  public timer: Timer;
  sessionId = input.required<string>();

  constructor() {
    this.timer = new Timer();
  }

  ngOnInit(): void {
    this.timer.seconds = this.challengeItem().timer;
  }

  onToggleTimer() {
    this.timer.ToggleTimer();
    // Toggle-Complete callen, um wieder auf "To-Do" zu setzen, falls Timer gestartet wird, wenn Challenge schon auf Complete steht
    if (this.challengeItem().status === Status.DONE) {
      this.challengesService.toggleComplete(this.challengeItem().id);
    }

    // Wenn Timer gestartet wird, dann neuen Timestamp im Backend hinterlegen
    const updatedChallenge = this.challengeItem();
    updatedChallenge.timeStamp = this.timer.isRunning() ? Date.now() : updatedChallenge.timeStamp;
    // Wenn Timer pausiert wird, dann Zeit berechnen aus altem Timestamp und neuem Timestamp & Zeit im Backend hinterlegen
    if (!this.timer.isRunning()) {
      const ms = Date.now() - this.challengeItem().timeStamp!;
      updatedChallenge.timer += Math.floor(ms / 1000);
    }

    const subscription = this.challengesService
      .updateGame(updatedChallenge, this.sessionId())
      .subscribe({
        next: (resData) => {
          console.log('Adden erfolgreich, hier resData');
          console.log(resData);
        },
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
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

  onDeleteChallenge() {
    this.challengesService.deleteGame(this.challengeItem().id, this.sessionId()).subscribe({
      next: (resData) => {
        console.log('Deleten erfolgreich, hier resData');
        console.log(resData);
      },
    });
  }
}
