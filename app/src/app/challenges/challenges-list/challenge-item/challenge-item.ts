import { Component, DestroyRef, inject, input, OnInit, effect } from '@angular/core';
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
  private destroyRef = inject(DestroyRef);

  challengeItem = input.required<Challenge>();
  challengesService = inject(AllChallenges);
  sessionId = input.required<string>();

  public timer: Timer = new Timer();

  constructor() {
    effect(() => {
      const data = this.challengeItem();

      if (data.timeStamp) {
        const now = Date.now();
        const elapsed = Math.floor((now - data.timeStamp) / 1000);
        this.timer.seconds = data.timer + elapsed;
      } else {
        this.timer.seconds = data.timer;
      }

      // Sync running state
      if (data.timeStamp && !this.timer.isRunning()) {
        this.timer.ToggleTimer();
      } else if (!data.timeStamp && this.timer.isRunning()) {
        this.timer.ToggleTimer();
      }
    });
  }

  onToggleTimer() {
    // Toggle the local visual timer immediately
    this.timer.ToggleTimer();

    //  Prepare the ONE object we will save to the database

    const updatedChallenge = { ...this.challengeItem() };

    //Handle "Uncomplete" when starting
    if (this.timer.isRunning()) {
      if (updatedChallenge.status === Status.DONE) {
        updatedChallenge.status = Status.OPEN;
      }

      // Set the start timestamp
      updatedChallenge.timeStamp = Date.now();
    } else {
      // Calculate elapsed time from the LAST saved timestamp
      const startTime = this.challengeItem().timeStamp;
      if (startTime) {
        const ms = Date.now() - startTime;
        updatedChallenge.timer += Math.floor(ms / 1000);
      }
      // Clear timestamp to indicate "Paused"
      updatedChallenge.timeStamp = null;
    }

    // send the single, combined update to the backend
    const subscription = this.challengesService
      .updateGame(updatedChallenge, this.sessionId())
      .subscribe({
        next: (resData) => console.log('Timer & Status saved successfully'),
        error: (err) => console.error('Save failed', err),
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }

  onToggleComplete() {
    const updated = { ...this.challengeItem() };
    updated.status = updated.status === Status.OPEN ? Status.DONE : Status.OPEN;

    if (updated.status === Status.DONE && this.timer.isRunning()) {
      this.timer.ToggleTimer(); // Stop local visual

      // Calculate final time to save
      const startTime = this.challengeItem().timeStamp;
      if (startTime) {
        updated.timer += Math.floor((Date.now() - startTime) / 1000);
      }
      updated.timeStamp = null;
    }

    // Save changes to backend
    this.challengesService.updateGame(updated, this.sessionId()).subscribe();
  }

  onDeleteChallenge() {
    this.challengesService.deleteGame(this.challengeItem().id, this.sessionId()).subscribe();
  }
}
