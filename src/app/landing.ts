import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { plan, minPrice, STORES } from './data';
@Component({
  selector: 'app-landing', imports: [RouterLink],
  template: `
  <section class="hero">
    <div>
      <h1>Votre ticket de caisse, avant la caisse.</h1>
      <p class="lead">Wafferli calcule ce que vos courses vont coûter, dans quelle enseigne elles coûtent le moins, et ce qu'il vous restera à la fin de la semaine.</p>
      <div class="row"><a class="btn sun" [routerLink]="cta">Commencer ma semaine</a><a class="btn ghost" routerLink="/prix">Comparer les prix</a></div>
    </div>
    <div class="receipt" aria-label="Exemple de panier">
      <div class="l"><b>PANIER D'EXEMPLE</b></div><div class="mute">Le même panier, trois enseignes</div><hr>
      @for (i of basket; track i.name) { <div class="l"><span>{{i.name}} ×{{i.qty}}</span><span>{{(i.qty*i.price).toFixed(2)}}</span></div> }
      <hr>
      @for (p of pl.per; track p.store) { <div class="l"><span class="shop" [style.background]="p.color">{{p.store}}</span><b [class.hl]="p.store===pl.best.store">{{p.total.toFixed(2)}} TND</b></div> }
      <hr><div class="l"><b>Chaque produit au meilleur prix</b><b class="hl">{{pl.mix.toFixed(2)}} TND</b></div>
      <div class="mute" style="margin-top:.4rem">Économie : {{pl.saving.toFixed(2)}} TND sur ce panier</div>
    </div>
  </section>
  <section class="why"><h2>Pourquoi Wafferli ?</h2>
    <p>En Tunisie, les prix alimentaires ont progressé de 7,1 % en un an (juin 2026, selon l'INS). Quand chaque dinar compte, la bonne question n'est plus « combien coûte ce produit ? » mais « combien coûtera mon panier, et où ? ».</p>
    <p>Wafferli répond avant que vous partiez : un budget, une liste, un plan d'achat entre {{names}}.</p></section>
  <section class="steps">
    <article class="card"><b class="n">1</b><h3>Fixez votre budget</h3><p class="mute">Le montant de la semaine, à zéro au départ. Le cercle se vide à mesure que votre liste se remplit.</p></article>
    <article class="card"><b class="n">2</b><h3>Touchez vos produits</h3><p class="mute">Un geste par produit. Le total et le reste se mettent à jour tout seuls.</p></article>
    <article class="card"><b class="n">3</b><h3>Suivez le plan malin</h3><p class="mute">Wafferli vous dit quoi acheter où, et combien vous économisez en répartissant.</p></article>
  </section>
  <section class="end"><h2>Prêt à faire votre premier ticket ?</h2><a class="btn sun" [routerLink]="cta">C'est parti</a></section>`,
  styles: `
  .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:3rem;align-items:center;padding:2rem 0 3rem} h1{color:var(--head);margin-bottom:1.2rem}
  .lead{font-size:1.2rem;max-width:34rem;margin:0 0 1.8rem}
  .why{background:var(--forest);color:#fff;border-radius:28px;padding:2.5rem;margin-bottom:2rem} .why p{max-width:42rem;color:#d7eadc;font-size:1.1rem} .why h2{margin-bottom:1rem}
  .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-bottom:3rem} .n{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;background:var(--sun);color:#252B27;border:2px solid var(--forest);margin-bottom:.6rem;font-size:1.2rem}
  .end{text-align:center;display:grid;gap:1rem;justify-items:center}
  @media(max-width:800px){.hero{grid-template-columns:1fr}}`
})
export class Landing {
  cta = inject(Auth).email() ? '/dashboard' : '/register';
  names = STORES.map(s => s.n).join(', ');
  basket = [['Lait', 2], ['Œufs', 1], ['Riz', 1], ['Poulet', 1], ['Tomates', 1], ['Huile d\'olive', 1]].map(([n, q]) => ({ name: n as string, qty: q as number, price: minPrice(n as string) }));
  pl = plan(this.basket);
}
