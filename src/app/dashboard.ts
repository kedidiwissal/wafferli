import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from './store';
import { Auth } from './auth';
import { plan, ALL_STORES, MEALS } from './data';
import { Bars, Donut } from './charts';
@Component({
  selector: 'app-dashboard', imports: [RouterLink, Bars, Donut],
  template: `
  <h1>Bonjour {{a.user()?.name}} 👋</h1><p class="mute">Voici où en est votre semaine.</p>
  <section class="top">
    <div><div class="grid g4" style="grid-template-columns:repeat(2,1fr)">
      <a class="card st" routerLink="/budget"><span class="mute">Budget</span><div class="big num">{{s.fmt(s.budget())}}</div>TND</a>
      <a class="card st" routerLink="/budget"><span class="mute">Dépensé cette semaine</span><div class="big num">{{s.fmt(s.weekSpent())}}</div>TND</a>
      <a class="card st" routerLink="/liste"><span class="mute">Liste prévue</span><div class="big num">{{s.fmt(s.planned())}}</div>TND</a>
      <div class="card st" [style.background]="s.remaining()<0?'var(--softbad)':'var(--soft)'"><span class="mute">Reste</span><div class="big num">{{s.fmt(s.remaining())}}</div>TND</div></div>
      <p class="msg" [class.bad]="s.alerts()[0].warn">{{s.alerts()[0].text}} @if (s.budget()===0) { <a routerLink="/budget">Fixer mon budget</a> }</p></div>
    <svg viewBox="0 0 42 42" class="ring" role="img" [attr.aria-label]="s.pct()+' % du budget engagé'">
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e7e3d6" stroke-width="5"/>
      <circle cx="21" cy="21" r="15.9155" fill="none" [attr.stroke]="s.remaining()<0||s.pct()>=90?'#D9622B':s.pct()>=70?'#F4C542':'#80B98B'" stroke-width="5" stroke-linecap="round" [attr.stroke-dasharray]="Math.min(100,s.pct())+' '+(100-Math.min(100,s.pct()))" transform="rotate(-90 21 21)"/>
      <text x="21" y="21" text-anchor="middle" font-size="7" font-weight="800" fill="currentColor">{{s.pct()}}%</text><text x="21" y="26" text-anchor="middle" font-size="2.6" fill="#6B736D">du budget engagé</text></svg>
  </section>
  @if (s.items().length && pl().saving > 0.05) { <div class="card" style="margin-bottom:1rem">💡 En répartissant votre liste entre <b>{{pl().groups.length}} enseignes</b>, vous gagnez <span class="hl">{{pl().saving.toFixed(2)}} TND</span> par rapport à tout acheter chez {{pl().best.store}}. <a routerLink="/liste">Voir le plan</a></div> }
  <div class="grid g4">
    <a class="card go" routerLink="/liste"><b>🧺</b>Ma liste</a><a class="card go" routerLink="/prix"><b>⚖️</b>Prix</a><a class="card go" routerLink="/repas"><b>🍲</b>Repas</a><a class="card go" routerLink="/budget"><b>💰</b>Dépenses</a></div>
  <div class="grid g2" style="margin-top:1.4rem">
    <div class="card"><h3>Dépenses des 7 derniers jours</h3><app-bars [data]="s.last7()" /></div>
    <div class="card"><h3>Où part l'argent cette semaine ?</h3><app-donut [data]="s.weekByCat()" /></div></div>
  <div class="grid g2" style="margin-top:1.4rem">
    <div class="card"><div class="row between"><h3>Idées de repas économiques 🍲</h3><a routerLink="/repas">Planifier</a></div>
      @for (m of cheap; track m.name) { <div class="row between" style="padding:.4rem 0;border-bottom:1px dashed var(--line)"><span>{{m.emoji}} <b>{{m.name}}</b> <span class="mute">{{m.flag}} {{m.country}} · {{m.time}} min</span></span><span class="pill">{{(m.cost/m.serves).toFixed(2)}} TND / pers.</span></div> }</div>
    <div class="card"><div class="row between"><h3>Dernières dépenses 💸</h3><a routerLink="/budget">Tout voir</a></div>
      @for (e of s.expenses().slice(0,5); track e.id) { <div class="row between" style="padding:.4rem 0;border-bottom:1px dashed var(--line)"><span><b>{{e.label}}</b> <span class="mute">{{e.date}} · {{e.cat}}</span></span><b class="num">{{s.fmt(e.amount)}} TND</b></div> } @empty { <p class="mute">Aucune dépense enregistrée.</p> }</div></div>
  <div class="grid g2" style="margin-top:1.4rem">
    <div class="card"><div class="row between"><h3>Mes objectifs 🐷</h3><a routerLink="/epargne">Tout voir</a></div>
      @for (g of s.goals().slice(0,3); track g.id) { <p style="margin:.8rem 0 .2rem"><b>{{g.emoji ?? '🐷'}} {{g.name}}</b> <span class="mute num">{{g.saved}} / {{g.target}} TND</span></p><div class="bar"><i [style.width.%]="Math.min(100,g.saved/g.target*100)"></i></div> } @empty { <p class="mute">Aucun objectif pour l'instant.</p> }</div>
    <div class="card"><div class="row between"><h3>Dernières courses 🕘</h3><a routerLink="/historique">Tout voir</a></div>
      @for (t of s.trips().slice(0,3); track t.id) { <div class="row between" style="padding:.4rem 0;border-bottom:1px dashed var(--line)"><span>{{t.date}} · {{t.items.length}} produits</span><b class="num">{{s.fmt(t.total)}} TND</b></div> } @empty { <p class="mute">Aucune course validée pour l'instant.</p> }</div>
  </div>`,
  styles: `
  .top{display:grid;grid-template-columns:1fr 240px;gap:1.5rem;align-items:center;padding:1rem 0 1.5rem} .ring{width:100%} .st{text-decoration:none;color:inherit}
  .msg{background:var(--soft);border-radius:14px;padding:.6rem .9rem;display:inline-block;font-weight:500} .msg.bad{background:var(--softbad)}
  .go{text-decoration:none;display:grid;gap:.3rem;font:800 1.3rem 'Bricolage Grotesque';color:inherit;transition:transform .15s} .go b{font-size:2.6rem} .go:hover{transform:translate(-2px,-2px)}
  @media(max-width:700px){.top{grid-template-columns:1fr}.ring{max-width:220px;margin:auto}}`
})
export class Dashboard { s = inject(Store); a = inject(Auth); Math = Math; pl = computed(() => plan(this.s.items(), ALL_STORES));
  cheap = [...MEALS].sort((a, b) => a.cost / a.serves - b.cost / b.serves).slice(0, 3); }
