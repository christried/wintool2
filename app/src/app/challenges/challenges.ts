import { Component, input, inject, OnInit } from '@angular/core';
import { NewChallenge } from './new-challenge/new-challenge';
import { ChallengesList } from './challenges-list/challenges-list';
import { SessionsService } from '../session-select-component/sessions-service';

@Component({
  selector: 'app-challenges',
  imports: [NewChallenge, ChallengesList],
  templateUrl: './challenges.html',
  styleUrl: './challenges.css',
})
export class Challenges implements OnInit {
  sessionsService = inject(SessionsService);

  sessionId = input.required<string>();

  ngOnInit() {
    this.sessionsService.currentSessionId.set(this.sessionId());
  }
}
