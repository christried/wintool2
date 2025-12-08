import { Component, DestroyRef, inject, input, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AllChallenges } from '../all-challenges';

@Component({
  selector: 'app-new-challenge',
  imports: [FormsModule],
  templateUrl: './new-challenge.html',
  styleUrl: './new-challenge.css',
})
export class NewChallenge {
  private destroyRef = inject(DestroyRef);
  challengesService = inject(AllChallenges);

  sessionId = input.required<string>();

  game: string = '';
  goal: string = '';

  onAddGame(formData: NgForm) {
    // console.log(formData);
    formData.form.markAllAsTouched();

    if (formData.form.invalid) {
      return;
    }

    const subscription = this.challengesService
      .addGame({ game: this.game, goal: this.goal }, this.sessionId())
      .subscribe({
        next: (resData) => {
          console.log('Adden erfolgreich, hier resData');
          console.log(resData);
        },
      });

    formData.form.reset();

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
