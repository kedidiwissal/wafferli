import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store, Trip } from './store';
import { ALL_STORES } from './data';
import { Bars } from './charts';
@Component({
  selector: 'app-historique', imports: [FormsModule, RouterLink, Bars],
  template: `
  <h1>Historique des courses 🕘</h1>
  <div class="grid g4" style="margin:1rem 0"><div class="card"><span class="mute">Courses faites</span><div class="big num">{{list().length}}</div></div>
    <div class="card"><span class="mute">Total dépensé</span><div class="big num">{{s.fmt(sum())}}</div></div>
    <div class="card"><span class="mute">Moyenne par course</span><div class="big num">{{s.fmt(list().length ? sum()/list().length : 0)}}</div></div></div>
  @if (chart().length > 1) { <div class="card" style="margin-bottom:1rem"><h3>Évolution des derniers paniers</h3><app-bars [data]="chart()" /></div> }
  <div class="row" style="margin-bottom:1rem"><input type="search" placeholder="🔍 Chercher un produit dans l'historique" [ngModel]="q()" (ngModelChange)="q.set($event)" style="flex:1;min-width:12rem" aria-label="Recherche">
    <select [ngModel]="fs()" (ngModelChange)="fs.set($event)" aria-label="Enseigne"><option value="">Toutes les enseignes</option>@for (x of stores; track x.n) { <option>{{x.n}}</option> }</select>
    <input type="month" [ngModel]="fm()" (ngModelChange)="fm.set($event)" aria-label="Mois"></div>
  @if (msg()) { <p style="background:var(--soft);border-radius:14px;padding:.6rem .9rem">{{msg()}} <a routerLink="/liste">Ouvrir ma liste</a></p> }
  @for (t of list(); track t.id) {
    <article class="card" style="margin-bottom:1rem"><div class="row between"><div><b>{{t.date}}</b> @if (t.store) { <span class="pill">{{t.store}}</span> } <span class="mute">· {{t.items.length}} produits</span></div><b class="num big" style="font-size:1.5rem">{{s.fmt(t.total)}} TND</b></div>
      <div class="row" style="margin-top:.6rem"><button class="btn sm ghost" (click)="open.set(open()===t.id?null:t.id)">{{open()===t.id?'Masquer':'Détails'}}</button><button class="btn sm" (click)="reuse(t)">🔁 Refaire ces courses</button><button class="btn sm ghost" (click)="del(t.id)">Supprimer</button></div>
      @if (open()===t.id) { <table style="margin-top:.6rem"><tr><th>Produit</th><th style="text-align:right">Prix unitaire</th><th style="text-align:right">Sous-total</th></tr>@for (i of t.items; track i.name) { <tr><td>{{i.name}} ×{{i.qty}} @if (i.unit) { <span class="mute">({{i.unit}})</span> }</td><td class="num" style="text-align:right">{{s.fmt(i.price)}}</td><td class="num" style="text-align:right">{{s.fmt(i.qty*i.price)}}</td></tr> }</table> }</article>
  } @empty { <p class="mute">{{s.trips().length ? 'Aucune course ne correspond à ces filtres.' : 'Aucune course dans l’historique. Validez une liste avec « J’ai fini mes courses ».'}}</p> }`
})
export class Historique {
  s = inject(Store); stores = ALL_STORES; q = signal(''); fs = signal(''); fm = signal(''); open = signal<number | null>(null); msg = signal('');
  sum = () => this.list().reduce((t, x) => t + x.total, 0);
  list = computed(() => this.s.trips().filter(t => (!this.fs() || t.store === this.fs()) && (!this.fm() || t.date.startsWith(this.fm())) && (!this.q().trim() || t.items.some(i => i.name.toLowerCase().includes(this.q().toLowerCase().trim())))));
  chart = computed(() => [...this.list()].slice(0, 8).reverse().map(t => ({ l: t.date.slice(5), v: t.total })));
  reuse(t: Trip) { this.s.reuse(t); this.msg.set('Produits du ' + t.date + ' ajoutés à votre liste ✓'); }
  del(id: number) { if (confirm('Supprimer cette course de l\'historique ?')) this.s.trips.update(l => l.filter(t => t.id !== id)); }
}
