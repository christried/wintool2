import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { AllChallenges } from '../all-challenges';
import { ChallengeItem } from './challenge-item/challenge-item';

@Component({
  selector: 'app-challenges-list',
  imports: [ChallengeItem],
  templateUrl: './challenges-list.html',
  styleUrl: './challenges-list.css',
})
export class ChallengesList implements OnInit {
  private destroyRef = inject(DestroyRef);

  challengesService = inject(AllChallenges);
  allChallenges = this.challengesService.allChallenges;

  sessionId = input.required<string>();

  ngOnInit(): void {
    console.log(this.sessionId());
    const subscription = this.challengesService.fetchChallenges(this.sessionId()).subscribe({
      next: (challenges) => {
        this.allChallenges.set(challenges);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
