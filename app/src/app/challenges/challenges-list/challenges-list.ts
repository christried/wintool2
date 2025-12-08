import { Component, DestroyRef, inject, input, OnInit, PLATFORM_ID } from '@angular/core'; // 1. Add PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // 2. Add isPlatformBrowser
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
  private platformId = inject(PLATFORM_ID); // 3. Inject Platform ID

  challengesService = inject(AllChallenges);
  allChallenges = this.challengesService.allChallenges;

  sessionId = input.required<string>();

  ngOnInit(): void {
    // 4. CRITICAL: Wrap this fetch in the browser check
    if (isPlatformBrowser(this.platformId)) {
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
}
