import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
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
  private destroyRef = inject(DestroyRef);

  challengesService = inject(AllChallenges);

  game: string = '';
  goal: string = '';

  onAddGame() {
    const subscription = this.challengesService
      .addGame({ game: this.game, goal: this.goal })
      .subscribe({
        next: (resData) => {
          console.log('Adden erfolgreich, hier resData');
          console.log(resData);
        },
      });
    this.formElement()!.nativeElement.reset();

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
