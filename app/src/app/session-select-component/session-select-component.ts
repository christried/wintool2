import { Component, inject, signal } from '@angular/core';
import { SessionsService } from './sessions-service';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-session-select-component',
  imports: [RouterLink, FormsModule],
  templateUrl: './session-select-component.html',
  styleUrl: './session-select-component.css',
})
export class SessionSelectComponent {
  sessionsService = inject(SessionsService);
  enteredSessionName = signal('');

  onAddSession() {
    if (!this.enteredSessionName().trim()) return;

    this.sessionsService.addSession(this.enteredSessionName()).subscribe({
      next: () => this.enteredSessionName.set(''),
    });
  }

  onDeleteSession(event: Event, sessionId: string) {
    // Stop the click from triggering the router link
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Really delete session "' + sessionId + '"?')) {
      this.sessionsService.deleteSession(sessionId).subscribe();
    }
  }
}
