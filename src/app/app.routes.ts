import { Routes } from '@angular/router';
import { Landing } from './landing';
import { AuthPage, authGuard } from './auth';
const g = [authGuard];
export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: AuthPage, title: 'Connexion · Wafferli' },
  { path: 'register', component: AuthPage, title: 'Inscription · Wafferli' },
  { path: 'dashboard', loadComponent: () => import('./dashboard').then(m => m.Dashboard), canActivate: g, title: 'Dashboard · Wafferli' },
  { path: 'liste', loadComponent: () => import('./courses').then(m => m.Courses), canActivate: g, title: 'Liste de courses · Wafferli' },
  { path: 'prix', loadComponent: () => import('./prix').then(m => m.Prix), canActivate: g, title: 'Prix · Wafferli' },
  { path: 'repas', loadComponent: () => import('./repas').then(m => m.Repas), canActivate: g, title: 'Repas · Wafferli' },
  { path: 'budget', loadComponent: () => import('./budget').then(m => m.Budget), canActivate: g, title: 'Budget · Wafferli' },
  { path: 'epargne', loadComponent: () => import('./epargne').then(m => m.Epargne), canActivate: g, title: 'Épargne · Wafferli' },
  { path: 'historique', loadComponent: () => import('./historique').then(m => m.Historique), canActivate: g, title: 'Historique · Wafferli' },
  { path: 'profil', loadComponent: () => import('./profil').then(m => m.Profil), canActivate: g, title: 'Profil · Wafferli' },
  { path: '**', redirectTo: '' },
];
