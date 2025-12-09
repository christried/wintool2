import { Component, inject, input, OnInit } from '@angular/core';
import { AllChallenges } from '../all-challenges';
import { ChallengeItem } from './challenge-item/challenge-item';

@Component({
  selector: 'app-challenges-list',
  imports: [ChallengeItem],
  templateUrl: './challenges-list.html',
  styleUrl: './challenges-list.css',
})
export class ChallengesList implements OnInit {
  challengesService = inject(AllChallenges);
  allChallenges = this.challengesService.allChallenges;
  sessionId = input.required<string>();

  ngOnInit(): void {
    // Start listening to Firestore
    this.challengesService.fetchChallenges(this.sessionId());
  }
}
