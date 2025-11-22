import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AllChallenges } from '../all-challenges';

@Component({
  selector: 'app-new-challenge',
  imports: [FormsModule],
  templateUrl: './new-challenge.html',
  styleUrl: './new-challenge.css',
})
export class NewChallenge {
  private formElement = viewChild<ElementRef<HTMLFormElement>>('form');

  challengesService = inject(AllChallenges);

  game: string = '';
  goal: string = '';

  onAddGame() {
    this.challengesService.addGame({ game: this.game, goal: this.goal });
    this.formElement()!.nativeElement.reset();
  }
}
