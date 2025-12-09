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
    // LISTEN: When the challenge data updates (from database), sync the local timer
    effect(() => {
      const data = this.challengeItem();

      if (data.timeStamp) {
        // Running: Base time + Elapsed time
        const now = Date.now();
        const elapsed = Math.floor((now - data.timeStamp) / 1000);
        this.timer.seconds = data.timer + elapsed;
      } else {
        // Stopped: Just base time
        this.timer.seconds = data.timer;
      }

      // If server says running (timeStamp exists) but local is stopped -> Start
      if (data.timeStamp && !this.timer.isRunning()) {
        this.timer.ToggleTimer();
      }
      // If server says stopped (timeStamp is null) but local is running -> Stop
      else if (!data.timeStamp && this.timer.isRunning()) {
        this.timer.ToggleTimer();
      }
    });
  }

  onToggleTimer() {
    this.timer.ToggleTimer();

    //  Handle "Done" status logic
    if (this.challengeItem().status === Status.DONE) {
      this.challengesService.toggleComplete(this.challengeItem().id);
    }

    //  Prepare Update

    const updatedChallenge = { ...this.challengeItem() };

    if (this.timer.isRunning()) {
      // STARTING: Set timestamp to NOW
      updatedChallenge.timeStamp = Date.now();
    } else {
      // STOPPING: Calculate elapsed and ADD to saved timer

      const startTime = this.challengeItem().timeStamp;
      if (startTime) {
        const ms = Date.now() - startTime;
        updatedChallenge.timer += Math.floor(ms / 1000);
      }
      // Clear timestamp to indicate "Stopped"
      updatedChallenge.timeStamp = null;
    }

    const subscription = this.challengesService
      .updateGame(updatedChallenge, this.sessionId())
      .subscribe({
        next: (resData) => console.log('Saved'),
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  isTimerRunning() {
    return this.timer.isRunning() ? 'Stop' : 'Start';
  }

  onToggleComplete() {
    const updated = { ...this.challengeItem() };
    updated.status = updated.status === Status.OPEN ? Status.DONE : Status.OPEN;

    // If  mark as done, pause the timer
    if (updated.status === Status.DONE && this.timer.isRunning()) {
      this.timer.ToggleTimer(); // Stop local

      // Calculate final time
      const startTime = this.challengeItem().timeStamp;
      if (startTime) {
        updated.timer += Math.floor((Date.now() - startTime) / 1000);
      }
      updated.timeStamp = null;
    }

    this.challengesService.updateGame(updated, this.sessionId()).subscribe();
  }

  onDeleteChallenge() {
    this.challengesService.deleteGame(this.challengeItem().id, this.sessionId()).subscribe();
  }
}
