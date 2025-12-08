import { Component, inject } from '@angular/core';
import { SessionsService } from './sessions-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-session-select-component',
  imports: [RouterLink],
  templateUrl: './session-select-component.html',
  styleUrl: './session-select-component.css',
})
export class SessionSelectComponent {
  sessionsService = inject(SessionsService);

  sessions = this.sessionsService.Sessions();

  OnAddSession() {}

  OnSelectSession(sessionId: string) {
    this.sessionsService.setSessionID(sessionId);
  }
}
