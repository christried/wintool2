import { Routes } from '@angular/router';
import { Challenges } from './challenges/challenges';
import { SessionSelectComponent } from './session-select-component/session-select-component';
import { Component } from '@angular/core';
import { ChallengesList } from './challenges/challenges-list/challenges-list';

export const routes: Routes = [
  {
    path: '',
    component: SessionSelectComponent,
  },
  {
    path: ':sessionId',
    component: Challenges,
  },
  {
    path: '**',
    component: SessionSelectComponent,
  },
];
