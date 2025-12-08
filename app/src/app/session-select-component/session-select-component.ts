import { Component, inject, signal, viewChild } from '@angular/core';
import { SessionsService } from './sessions-service';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { sign } from 'crypto';

@Component({
  selector: 'app-session-select-component',
  imports: [RouterLink, FormsModule],
  templateUrl: './session-select-component.html',
  styleUrl: './session-select-component.css',
})
export class SessionSelectComponent {
  sessionsService = inject(SessionsService);
  sessions = this.sessionsService.Sessions();
  newSession = signal<string>('');

  onAddSession(formData: NgForm) {
    this.sessionsService.addSession(this.newSession()).subscribe({
      next: (resData) => {
        console.log('resData für das adden der neuen Session:');
        console.log(resData);
      },
    });
    this.sessionsService.fetchSessions();
    formData.form.reset();
  }

  onSelectSession(sessionId: string) {
    this.sessionsService.setSessionID(sessionId);
  }
}
