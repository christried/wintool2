import { Component, input } from '@angular/core';
import { NewChallenge } from './new-challenge/new-challenge';
import { ChallengesList } from './challenges-list/challenges-list';

@Component({
  selector: 'app-challenges',
  imports: [NewChallenge, ChallengesList],
  templateUrl: './challenges.html',
  styleUrl: './challenges.css',
})
export class Challenges {
  sessionId = input.required<string>();
}
