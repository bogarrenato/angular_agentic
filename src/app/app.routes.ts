import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/agents/agents.page').then(m => m.AgentsPage)
  }
];
