import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, Meal } from './store';
import { MEALS, COUNTRIES, TAGS } from './data';
import { Pic } from './ui';
@Component({
  selector: 'app-repas', imports: [Pic, FormsModule],
  template: `
  <h1>Que manger aujourd'hui ?</h1><p class="mute">Coût des portions utilisées, calculé au meilleur prix des 5 enseignes pour {{s.members()}} personne(s). Les repas sont classés du plus rentable au plus cher.</p>
  <div class="row" style="margin:1rem 0"><span>Je dépense au plus :</span>
    @for (m of maxes; track m) { <button class="chip" [class.on]="max()===m" (click)="max.set(m)">{{m>=99?'Peu importe':m+' TND'}}</button> }
    <button class="chip" [class.on]="veg()" (click)="veg.set(!veg())">🌱 Végétarien</button></div>
  <div class="row" style="margin-bottom:1rem"><select [ngModel]="country()" (ngModelChange)="country.set($event)" aria-label="Pays"><option value="">Tous les pays</option>@for (c of countries; track c) { <option>{{c}}</option> }</select>
    <select [ngModel]="tag()" (ngModelChange)="tag.set($event)" aria-label="Type de repas"><option value="">Tous les types</option>@for (t of tags; track t) { <option>{{t}}</option> }</select></div>
  <div class="grid g3">
    @for (m of list(); track m.name; let i = $index) {
      <article class="card"><app-pic [name]="m.name" [e]="m.emoji" /><div class="row between" style="margin-top:.6rem"><h3>{{m.name}}</h3><b class="num">{{total(m).toFixed(1)}} TND</b></div>
        <p class="mute">{{m.flag}} {{m.country}} · {{(m.cost/m.serves).toFixed(2)}} TND par personne · ⏱ {{m.time}} min</p>
        @if (i===0) { <p><span class="hl">🏆 Le plus rentable</span></p> }
        <p class="desc">{{m.desc}}</p>
        <div class="row" style="gap:.3rem;margin-bottom:.5rem">@for (t of m.tags; track t) { <span class="pill">{{t}}</span> }</div>
        @if (open()===m.name) {
          <ul class="ingr">@for (g of m.ing; track g.name) { <li><span>{{g.name}} @if (g.label) { <span class="mute">({{g.label}})</span> }</span><span class="num">{{(g.frac*g.price).toFixed(2)}}</span></li> }
            <li class="sum"><b>Total pour {{m.serves}} personnes</b><b class="num">{{m.cost.toFixed(2)}}</b></li></ul>
          <p class="rec">{{m.steps}}</p> }
        <div class="row"><button class="btn sm ghost" (click)="open.set(open()===m.name?'':m.name)">{{open()===m.name?'Masquer':'Recette'}}</button>
          <button class="btn sm" (click)="add(m)">{{done()===m.name?'Ajouté ✓':'+ Mettre dans ma liste'}}</button></div></article>
    } @empty { <p class="mute">Aucun repas à ce prix. Essayez une autre option.</p> }
  </div>
  <h2 style="margin:2.2rem 0 .6rem">Mon menu de la semaine</h2>
  <div class="week">@for (d of days; track d) { <label class="card day"><b>{{d}}</b>
    @if (byName(s.mealPlan()[d]); as m) { <span class="mute">{{m.emoji}} {{total(m).toFixed(2)}} TND</span> }
    <select [ngModel]="s.mealPlan()[d] ?? ''" (ngModelChange)="setDay(d, $event)"><option value="">—</option>@for (m of all; track m.name) { <option>{{m.name}}</option> }</select></label> }</div>
  <div class="row" style="margin-top:1rem"><span>Coût du menu : <b class="num">{{weekCost().toFixed(2)}} TND</b> · {{weekCount()}} repas</span>
    @if (weekCount() > 0 && s.budget() > 0 && weekCost() > s.remaining()) { <span class="pill warn">Dépasse le reste du budget</span> }
    <button class="btn sm sun" (click)="auto()">✨ Remplir avec les plus rentables</button><button class="btn sm" [disabled]="weekCount()===0" (click)="addWeek()">Ajouter les ingrédients à ma liste</button><button class="btn sm ghost" (click)="s.mealPlan.set({})">Vider</button></div>
  @if (added()) { <p style="background:var(--soft);border-radius:14px;padding:.6rem .9rem">Ingrédients ajoutés à votre liste de courses ✓</p> }`,
  styles: `.week{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.7rem}.day{display:grid;gap:.4rem;padding:.8rem}.day select{width:100%}.rec{background:var(--soft);border-radius:12px;padding:.7rem .9rem}.desc{margin:.3rem 0 .6rem}
  .ingr{list-style:none;margin:0 0 .6rem;padding:0} .ingr li{display:flex;justify-content:space-between;gap:.5rem;padding:.2rem 0;border-bottom:1px dashed var(--line)} .ingr .sum{border-bottom:0}`
})
export class Repas {
  s = inject(Store); maxes = [5, 8, 10, 99]; max = signal(99); veg = signal(false); country = signal(''); tag = signal(''); open = signal(''); done = signal('');
  countries = COUNTRIES; tags = TAGS;
  // coût d'un repas pour le foyer (le coût de base est celui de ses portions)
  total = (m: { cost: number; serves: number }) => m.cost / m.serves * this.s.members();
  list = computed(() => MEALS.filter(m => this.total(m) <= this.max() && (!this.veg() || m.veg) && (!this.country() || m.country === this.country()) && (!this.tag() || m.tags.includes(this.tag()))).sort((a, b) => a.cost / a.serves - b.cost / b.serves));
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']; all = MEALS; added = signal(false);
  byName = (n?: string) => MEALS.find(m => m.name === n);
  planned = () => this.days.map(d => this.byName(this.s.mealPlan()[d])).filter((m): m is typeof MEALS[number] => !!m);
  weekCost = computed(() => this.planned().reduce((t, m) => t + this.total(m), 0)); weekCount = computed(() => this.planned().length);
  setDay(d: string, v: string) { this.s.mealPlan.update(p => ({ ...p, [d]: v })); }
  auto() { const best = [...MEALS].sort((a, b) => a.cost / a.serves - b.cost / b.serves); this.s.mealPlan.set(Object.fromEntries(this.days.map((d, i) => [d, best[i % best.length].name]))); }
  addWeek() { this.planned().forEach(m => this.s.addMeal(m)); this.added.set(true); setTimeout(() => this.added.set(false), 2500); }
  add(m: Meal) { this.s.addMeal(m); this.done.set(m.name); setTimeout(() => this.done.set(''), 1800); }
}
