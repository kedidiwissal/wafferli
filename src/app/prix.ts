import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, CATS } from './store';
import { PRODUCTS, ALL_STORES } from './data';
import { Pic, EMOJI, bump } from './ui';
import { Bars } from './charts';
@Component({
  selector: 'app-prix', imports: [FormsModule, Pic, Bars],
  template: `
  <h1>Où acheter moins cher ?</h1><p class="mute">Prix indicatifs en TND, comparés entre 5 enseignes (repères de marchés tunisiens 2026, estimations par enseigne) : à vérifier en rayon.</p>
  <div class="card" style="margin:1rem 0"><h3>⚖️ Votre liste dans chaque enseigne</h3>
    @if (tot().cheap && tot().dear) {
      <p>C'est chez <b>{{tot().cheap!.store}}</b> que votre liste coûte le moins (<b class="num">{{tot().cheap!.total.toFixed(2)}} TND</b>), soit <span class="hl">{{(tot().dear!.total - tot().cheap!.total).toFixed(2)}} TND</span> de moins que chez {{tot().dear!.store}}. @if (unmatched() > 0) { <span class="mute">({{unmatched()}} produit(s) hors catalogue non comptés.)</span> }</p>
      <app-bars [data]="chart()" />
    } @else { <p class="mute">Ajoutez des produits à votre liste pour voir son total dans chaque enseigne.</p> }
  </div>
  <input type="search" class="search" placeholder="🔍 Chercher : lait, riz, tomates…" [ngModel]="q()" (ngModelChange)="q.set($event)" aria-label="Recherche">
  <div class="row" style="margin:1rem 0"><button class="chip" [class.on]="c()===''" (click)="c.set('')">Tout</button>@for (x of cats; track x) { <button class="chip" [class.on]="c()===x" (click)="c.set(x)">{{x}}</button> }
    <select [ngModel]="sort()" (ngModelChange)="sort.set($event)" aria-label="Trier par"><option value="name">Trier : nom</option><option value="cheapest">Trier : moins cher d'abord</option><option value="savings">Trier : plus grosse économie</option></select>
    <button class="chip" [class.on]="view()==='cartes'" (click)="view.set('cartes')">Cartes</button><button class="chip" [class.on]="view()==='tableau'" (click)="view.set('tableau')">Tableau</button></div>
  @if (added()) { <p style="background:var(--soft);border-radius:14px;padding:.6rem .9rem">{{added()}}</p> }
  @if (view()==='tableau') {
    <div class="card" style="overflow-x:auto"><table><tr><th>Produit</th>@for (x of stores; track x.n) { <th style="text-align:right">{{x.n}}</th> }<th style="text-align:right">Économie</th><th></th></tr>
      @for (p of list(); track p.name) { <tr><td>{{emoji(p.name)}} <b>{{p.name}}</b> <span class="mute">{{p.unit}}</span></td>
        @for (x of p.prices; track x.store) { <td style="text-align:right"><span class="cell num" [class.best]="x.price===p.min" [class.worst]="x.price===p.max && p.max!==p.min">{{x.price.toFixed(2)}}</span></td> }
        <td style="text-align:right"><span class="pill">{{(p.max-p.min).toFixed(2)}}</span></td><td><button class="btn sm" (click)="add(p)">+ Liste</button></td></tr>
      } @empty { <tr><td [attr.colspan]="stores.length+3" class="mute">Aucun produit trouvé.</td></tr> }</table>
      <p class="mute">Prix le plus bas en jaune, le plus élevé en orange (TND). « + Liste » ajoute le produit au meilleur prix.</p></div>
  } @else {
  <div class="grid g3">
    @for (p of list(); track p.name) {
      <article class="card"><app-pic [name]="p.name" [e]="emoji(p.name)" /><h3 style="margin:.6rem 0 .4rem">{{p.name}} <span class="mute">{{p.unit}}</span></h3>
        @for (x of p.prices; track x.store) { <div class="row between" [class.best]="x.price===p.min" [class.worst]="x.price===p.max && p.max!==p.min"><span>{{x.store}} @if (x.price===p.min) { 🏆 }</span><b class="num">{{x.price.toFixed(2)}} TND</b></div> }
        <p class="save">Vous économisez jusqu'à <b>{{(p.max-p.min).toFixed(2)}} TND</b></p>
        <button class="btn sm" (click)="add(p)">+ Ajouter à ma liste</button></article>
    } @empty { <p class="mute">Aucun produit trouvé. Essayez un autre mot.</p> }
  </div> }`,
  styles: `.search{width:100%;font-size:1.1rem;padding:.9rem 1.2rem;border-radius:999px;border:2px solid var(--forest)} .row{padding:.3rem .5rem;border-radius:10px} .cell{display:inline-block;padding:.1rem .5rem;border-radius:8px} .best{background:var(--sun);color:#252B27;font-weight:700} .worst{background:var(--softbad)} .save{background:var(--soft);border-radius:12px;padding:.4rem .7rem}`
})
export class Prix {
  s = inject(Store); q = signal(''); c = signal(''); sort = signal<'name' | 'cheapest' | 'savings'>('name'); view = signal<'cartes' | 'tableau'>('cartes'); stores = ALL_STORES; added = signal('');
  cats = CATS.filter(x => PRODUCTS.some(p => p.cat === x)); emoji = (n: string) => EMOJI[n] ?? '🛒';
  list = computed(() => {
    const r = PRODUCTS.filter(p => (!this.c() || p.cat === this.c()) && p.name.toLowerCase().includes(this.q().toLowerCase().trim())).map(p => { const v = p.prices.map(x => x.price); return { ...p, min: Math.min(...v), max: Math.max(...v) }; });
    const k = this.sort(); return k === 'cheapest' ? r.sort((a, b) => a.min - b.min) : k === 'savings' ? r.sort((a, b) => (b.max - b.min) - (a.max - a.min)) : r.sort((a, b) => a.name.localeCompare(b.name));
  });
  matched = computed(() => this.s.items().filter(i => PRODUCTS.some(p => p.name === i.name)));
  unmatched = computed(() => this.s.items().length - this.matched().length);
  totals = computed(() => ALL_STORES.map(st => ({ store: st.n, total: this.matched().reduce((t, i) => t + i.qty * PRODUCTS.find(p => p.name === i.name)!.prices.find(x => x.store === st.n)!.price, 0) })));
  tot = computed(() => { const t = this.totals().filter(x => x.total > 0); return { cheap: t.length ? t.reduce((a, b) => a.total <= b.total ? a : b) : null, dear: t.length ? t.reduce((a, b) => a.total >= b.total ? a : b) : null }; });
  chart = computed(() => this.totals().map(t => ({ l: t.store, v: t.total })));
  add(p: { name: string; cat: string; unit: string; min: number }) { bump(this.s, p.name, p.cat, p.min, 1, p.unit); this.added.set(`${p.name} ajouté à votre liste au meilleur prix (${p.min.toFixed(2)} TND).`); }
}
