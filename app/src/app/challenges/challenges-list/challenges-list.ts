import { Component, inject } from '@angular/core';
import { AllChallenges } from '../all-challenges';
import { ChallengeItem } from './challenge-item/challenge-item';

@Component({
  selector: 'app-challenges-list',
  imports: [ChallengeItem],
  templateUrl: './challenges-list.html',
  styleUrl: './challenges-list.css',
})
export class ChallengesList {
  challengesService = inject(AllChallenges);

  allChallenges = this.challengesService.allChallenges;
}
