import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Challenges } from './challenges/challenges';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Challenges],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('app');
}
