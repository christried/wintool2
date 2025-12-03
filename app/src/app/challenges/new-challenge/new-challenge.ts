import { Component, DestroyRef, inject, viewChild } from '@angular/core';
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

  game: string = '';
  goal: string = '';

  onAddGame(formData: NgForm) {
    // console.log(formData);

    formData.form.controls['game'].markAsTouched();
    formData.form.controls['goal'].markAsTouched();

    if (formData.form.invalid) {
      return;
    }

    const subscription = this.challengesService
      .addGame({ game: this.game, goal: this.goal })
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
