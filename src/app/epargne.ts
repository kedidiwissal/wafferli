import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, Goal, GOAL_EMOJIS } from './store';
@Component({
  selector: 'app-epargne', imports: [FormsModule],
  template: `
  <h1>Objectifs d'épargne 🐷</h1>
  <div class="grid g4" style="margin:1rem 0"><div class="card"><span class="mute">Épargné au total</span><div class="big num">{{total()}} TND</div></div><div class="card"><span class="mute">Objectifs</span><div class="big num">{{s.goals().length}}</div></div></div>
  <form class="card row" style="align-items:end;margin-bottom:1rem" (ngSubmit)="add()">
    <label class="field">Icône<select name="e" [(ngModel)]="ge">@for (e of emojis; track e) { <option [value]="e">{{e}}</option> }</select></label>
    <label class="field">Objectif<input name="n" [(ngModel)]="gn" placeholder="ex. Nouveau réfrigérateur"></label>
    <label class="field">Montant cible (TND)<input name="t" type="number" min="1" [(ngModel)]="gt" style="width:8rem"></label>
    <label class="field">Date limite (facultatif)<input name="d" type="date" [(ngModel)]="gd"></label><button class="btn" type="submit">Créer l'objectif</button></form>
  <div class="grid g3">@for (g of s.goals(); track g.id) {
    <article class="card"><div class="row between"><h3>{{g.emoji ?? '🐷'}} {{g.name}}</h3><button class="btn sm ghost" (click)="del(g.id)" [attr.aria-label]="'Supprimer '+g.name">✕</button></div>
      <div class="big num">{{g.saved}} / {{g.target}} TND</div><div class="bar"><i [style.width.%]="Math.min(100,g.saved/g.target*100)"></i></div>
      <p class="mute">{{(g.saved/g.target*100).toFixed(0)}} % atteint · reste {{Math.max(0,g.target-g.saved)}} TND</p>
      @if (g.saved >= g.target) { <p><span class="hl">🎉 Objectif atteint !</span></p> }
      @else if (g.deadline) { <p>Pour y arriver d'ici le {{g.deadline}} : <b class="num">{{perWeek(g).toFixed(2)}} TND / semaine</b> <span class="mute">({{perMonth(g).toFixed(2)}} TND / mois · {{weeksLeft(g)}} sem. restantes)</span></p> }
      <div class="row"><input type="number" min="1" #amt placeholder="Montant" style="width:6rem" (keydown.enter)="give(g,+amt.value);amt.value=''"><button class="btn sm sun" (click)="give(g,+amt.value);amt.value=''">Verser</button><button class="btn sm ghost" (click)="give(g,-(+amt.value));amt.value=''">Retirer</button></div>
      @for (l of (g.log ?? []).slice(0,3); track $index) { <div class="mute row between"><span>{{l.d}}</span><span class="num">{{l.a>0?'+':''}}{{l.a}} TND</span></div> }</article>
  } @empty { <p class="mute">Aucun objectif. Créez le premier ci-dessus.</p> }</div>`
})
export class Epargne {
  s = inject(Store); Math = Math; emojis = GOAL_EMOJIS; ge = GOAL_EMOJIS[0]; gn = ''; gt: number | null = null; gd = '';
  total = () => this.s.goals().reduce((t, g) => t + g.saved, 0);
  weeksLeft = (g: Goal) => Math.max(1, Math.ceil((new Date(g.deadline!).getTime() - Date.now()) / 6.048e8));
  perWeek = (g: Goal) => Math.max(0, g.target - g.saved) / this.weeksLeft(g);
  perMonth = (g: Goal) => Math.max(0, g.target - g.saved) / Math.max(1, Math.ceil((new Date(g.deadline!).getTime() - Date.now()) / 2.63e9));
  add() { if (!this.gn.trim() || !this.gt) return; this.s.goals.update(l => [...l, { id: Date.now(), name: this.gn.trim(), emoji: this.ge, target: this.gt!, saved: 0, deadline: this.gd || undefined, log: [] }]); this.gn = ''; this.gt = null; this.gd = ''; this.ge = GOAL_EMOJIS[0]; }
  give(g: Goal, v: number) { if (v && v !== 0) this.s.goals.update(l => l.map(x => x.id === g.id ? { ...x, saved: Math.max(0, x.saved + v), log: [{ d: this.s.today(), a: v }, ...(x.log ?? [])] } : x)); }
  del(id: number) { if (confirm('Supprimer cet objectif ?')) this.s.goals.update(l => l.filter(x => x.id !== id)); }
}
