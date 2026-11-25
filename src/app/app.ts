import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from './auth';
import { Store } from './store';
@Component({
  selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <header class="row between"><a class="logo" routerLink="/">wafferli<i></i></a>
    @if (!a.email()) { <div class="row"><a class="btn sm ghost" routerLink="/login">Se connecter</a><a class="btn sm" routerLink="/register">Créer un compte</a></div> }</header>
  <main><router-outlet /></main>
  @if (a.email()) { <nav>@for (l of links; track l.to) { <a [routerLink]="l.to" routerLinkActive="on"><b>{{l.e}}</b>{{l.t}}</a> }</nav> }`,
  styles: `
  header{padding:1rem 1.5rem} .logo{font:800 2rem 'Bricolage Grotesque';text-decoration:none;color:var(--head);letter-spacing:-.04em} .logo i{display:inline-block;width:.55rem;height:.55rem;background:var(--sun);color:#252B27;border-radius:50%;margin-left:3px}
  main{max-width:1000px;margin:0 auto;padding:0 1.2rem 7rem}
  nav{position:fixed;left:50%;transform:translateX(-50%);bottom:1rem;display:flex;gap:.2rem;background:var(--forest);padding:.4rem;border-radius:999px;box-shadow:0 10px 25px -8px #0006;z-index:9;max-width:96vw;overflow-x:auto}
  nav a{text-decoration:none;color:#d7eadc;padding:.4rem .8rem;border-radius:999px;display:grid;justify-items:center;font-size:.72rem;font-weight:700;white-space:nowrap} nav a b{font-size:1.3rem;line-height:1.2}
  nav a.on{background:var(--sun);color:#252B27;color:#252B27}`
})
export class App {
  a = inject(Auth); store = inject(Store);
  links = [{ to: '/dashboard', e: '🏠', t: 'Dashboard' }, { to: '/liste', e: '🧺', t: 'Liste' }, { to: '/prix', e: '⚖️', t: 'Prix' }, { to: '/repas', e: '🍲', t: 'Repas' }, { to: '/budget', e: '💰', t: 'Budget' }, { to: '/epargne', e: '🐷', t: 'Épargne' }, { to: '/historique', e: '🕘', t: 'Historique' }, { to: '/profil', e: '👤', t: 'Profil' }];
}
