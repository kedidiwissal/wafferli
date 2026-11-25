import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, CATS } from './store';
import { PRODUCTS, ALL_STORES, plan } from './data';
import { Pic, EMOJI, bump, qtyOf } from './ui';
@Component({
  selector: 'app-courses', imports: [FormsModule, Pic],
  template: `
  <h1>Mes courses</h1><p class="mute">👆 Touchez un produit pour l'ajouter. Touchez encore pour en ajouter un autre.</p>
  <div class="sum card"><span>Total <b class="num">{{s.fmt(s.planned())}}</b> TND</span><span [style.color]="s.remaining()<0?'#D9622B':'#164E3B'">Reste <b class="num">{{s.fmt(s.remaining())}}</b> TND</span></div>
  @if (s.budget() > 0 && s.remaining() < 0) { <p class="err">Cette liste dépasse de {{s.fmt(-s.remaining())}} TND ce qu'il vous reste cette semaine.</p> }
  @if (msg()) { <p style="background:var(--soft);border-radius:14px;padding:.6rem .9rem">{{msg()}}</p> }
  <input type="search" class="search" placeholder="🔍 Chercher un produit : lait, riz, tomates…" [ngModel]="q()" (ngModelChange)="q.set($event)" aria-label="Rechercher un produit">
  <div class="row" style="margin:1rem 0"><button class="chip" [class.on]="f()===''" (click)="f.set('')">Tout</button>@for (c of shownCats; track c) { <button class="chip" [class.on]="f()===c" (click)="f.set(c)">{{c}}</button> }</div>
  <div class="tiles">
    @for (p of list(); track p.name) {
      <button class="tile" (click)="tap(p, 1)"><app-pic [name]="p.name" [e]="emoji(p.name)" />
        @if (qty(p.name) > 0) { <span class="badge">{{qty(p.name)}}</span> }
        <b>{{p.name}}</b><span class="mute">dès {{min(p).toFixed(2)}} TND · {{p.unit}}</span></button>
    } @empty { <p class="mute">Aucun produit trouvé. Essayez un autre mot, ou ajoutez-le à la main plus bas.</p> }
  </div>
  <h2 style="margin:2rem 0 .8rem">Ma liste</h2>
  <div class="card">
    @if (s.items().length) {
      <div class="row" style="margin-bottom:.6rem"><input type="search" placeholder="🔍 Chercher dans ma liste…" [ngModel]="lq()" (ngModelChange)="lq.set($event)" style="flex:1" aria-label="Rechercher dans ma liste">
        <select [ngModel]="lc()" (ngModelChange)="lc.set($event)" aria-label="Filtrer par catégorie"><option value="">Toutes les catégories</option>@for (c of cats; track c) { <option>{{c}}</option> }</select></div> }
    @for (i of shown(); track i.id) {
      <div class="line"><input type="checkbox" [checked]="i.done" (change)="s.patch(i.id,{done:!i.done})" [attr.aria-label]="'Acheté : '+i.name">
        <span style="flex:1"><span [class.done]="i.done">{{emoji(i.name)}} {{i.name}}</span> @if (i.unit) { <span class="mute">({{i.unit}})</span> } <span class="pill">{{i.cat}}</span></span>
        <button class="btn sm ghost" (click)="tap(i, -1)" aria-label="Moins">−</button><b class="num">{{i.qty}}</b><button class="btn sm ghost" (click)="tap(i, 1)" aria-label="Plus">+</button>
        <input type="number" min="0" step="0.05" style="width:5rem" [ngModel]="i.price" (ngModelChange)="s.patch(i.id,{price:+$event||0})" [attr.aria-label]="'Prix unitaire : '+i.name">
        <span class="num" style="width:4.5rem;text-align:right">{{s.fmt(i.qty*i.price)}}</span></div>
    } @empty { <p class="mute">{{s.items().length ? 'Aucun produit ne correspond à votre recherche.' : 'Votre liste est vide. Touchez un produit ci-dessus pour commencer.'}}</p> }
    @if (s.items().length) {
      <p class="mute" style="margin:.8rem 0 0">Cochés : <b class="num">{{s.fmt(checked())}}</b> TND · Total : <b class="num">{{s.fmt(s.planned())}}</b> TND</p>
      <div class="row" style="margin-top:.6rem"><select [ngModel]="store()" (ngModelChange)="store.set($event)" aria-label="Enseigne">@for (x of stores; track x.n) { <option>{{x.n}}</option> }</select>
        <button class="btn sun" type="button" (click)="finish()">✅ J'ai fini mes courses</button><button class="btn ghost" type="button" (click)="clear()">Vider</button></div>
      <p class="mute">Cochez ce que vous avez acheté : seuls ces produits comptent en dépense.</p> }
    <form class="row" style="margin-top:1rem" (ngSubmit)="addOther()"><input name="n" [(ngModel)]="n" placeholder="Autre produit…" style="flex:1;min-width:9rem">
      <select name="c" [(ngModel)]="c" aria-label="Catégorie">@for (x of cats; track x) { <option>{{x}}</option> }</select>
      <input name="qy" type="number" min="0.1" step="0.1" [(ngModel)]="qy" placeholder="Qté" style="width:4.5rem" aria-label="Quantité"><input name="un" [(ngModel)]="un" placeholder="Unité" style="width:5.5rem" aria-label="Unité">
      <input name="p" type="number" step="0.1" [(ngModel)]="p" placeholder="Prix" style="width:5.5rem"><button class="btn sm">Ajouter</button></form>
  </div>
  @if (s.items().length) {
  <div class="card" style="margin-top:1.2rem"><h3>💡 Plan malin</h3>
    @if (pl().saving > 0.05) { <p>Tout acheter chez <b>{{pl().best.store}}</b> : <b class="num">{{pl().best.total.toFixed(2)}} TND</b>. En répartissant vos achats : <b class="num">{{pl().mix.toFixed(2)}} TND</b>, soit <span class="hl">{{pl().saving.toFixed(2)}} TND d'économie</span>.</p> }
    @else { <p>Tout acheter chez <b>{{pl().best.store}}</b> est déjà le plus rentable : <b class="num">{{pl().best.total.toFixed(2)}} TND</b>.</p> }
    @for (g of pl().groups; track g.store) { <div class="grp"><span class="shop" [style.background]="g.color">{{g.store}}</span><b class="num">{{g.total.toFixed(2)}} TND</b><span class="mute">{{g.lines.join(', ')}}</span></div> }
  </div> }`,
  styles: `
  .sum{display:flex;justify-content:space-between;font-size:1.2rem;position:sticky;top:.5rem;z-index:5}
  .search{width:100%;font-size:1.05rem;padding:.8rem 1.2rem;border-radius:999px;border:2px solid var(--forest);margin-top:.6rem}
  .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.9rem}
  .tile{position:relative;text-align:left;border:2px solid var(--edge);border-radius:20px;background:var(--card);padding:.6rem;cursor:pointer;display:grid;gap:.2rem;font:inherit;transition:transform .12s} .tile:active{transform:scale(.95)} .tile:hover{background:var(--hover)}
  .badge{position:absolute;top:.2rem;right:.2rem;background:var(--sun);color:#252B27;border:2px solid var(--forest);border-radius:99px;min-width:2rem;height:2rem;display:grid;place-items:center;font-weight:800}
  .line{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;padding:.5rem 0;border-bottom:1px dashed var(--line)} .done{text-decoration:line-through;color:var(--mute)}`
})
export class Courses {
  s = inject(Store); cats = CATS; stores = ALL_STORES; shownCats = CATS.filter(c => PRODUCTS.some(p => p.cat === c));
  f = signal(''); q = signal(''); lq = signal(''); lc = signal(''); store = signal(ALL_STORES[0].n);
  n = ''; c = CATS[4]; qy: number | null = 1; un = 'pièce'; p: number | null = null;
  msg = signal('');
  finish() { this.s.finishShopping(this.store()); this.msg.set('Courses enregistrées dans l\'historique et dans vos dépenses ✓'); }
  clear() { if (confirm('Vider toute la liste de courses ?')) this.s.clearList(); }
  pl = computed(() => plan(this.s.items(), ALL_STORES));
  checked = computed(() => this.s.spent());
  list = computed(() => PRODUCTS.filter(x => (!this.f() || x.cat === this.f()) && x.name.toLowerCase().includes(this.q().toLowerCase().trim())));
  shown = computed(() => this.s.items().filter(i => (!this.lc() || i.cat === this.lc()) && i.name.toLowerCase().includes(this.lq().toLowerCase().trim())));
  emoji = (n: string) => EMOJI[n] ?? '🛒'; qty = (n: string) => qtyOf(this.s, n);
  min = (p: { prices: { price: number }[] }) => Math.min(...p.prices.map(x => x.price));
  tap(p: any, d: number) { bump(this.s, p.name, p.cat, p.prices ? this.min(p) : p.price, d, p.unit); }
  addOther() { if (!this.n.trim() || !this.qy || this.qy <= 0) return; this.s.bumpItem(this.n.trim(), this.c, this.p || 0, this.qy, this.un.trim() || 'pièce'); this.n = ''; this.p = null; this.qy = 1; this.un = 'pièce'; this.c = CATS[4]; }
}
