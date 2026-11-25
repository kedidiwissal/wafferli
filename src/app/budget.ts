import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, EXP_CATS } from './store';
import { Bars } from './charts';
@Component({
  selector: 'app-budget', imports: [FormsModule, Bars],
  template: `
  <h1>Budget & dépenses</h1>
  <div class="card row" style="margin:1rem 0;align-items:end">
    <label class="field">Budget de la semaine (TND)<input type="number" min="0" [ngModel]="s.budget()" (ngModelChange)="s.budget.set(+$event||0)"></label>
    <label class="field">Début de semaine<input type="date" [ngModel]="s.start()" (ngModelChange)="s.start.set($event)"></label>
    <label class="field">Personnes<input type="number" min="1" [ngModel]="s.members()" (ngModelChange)="s.members.set(+$event||1)" style="width:6rem"></label>
    <span class="mute">≈ {{s.fmt(s.budget()/s.members()/7)}} TND / personne / jour</span></div>
  <div class="grid g4"><div class="card"><span class="mute">Dépensé au total</span><div class="big num">{{s.fmt(s.spentTotal())}}</div></div>
    <div class="card"><span class="mute">Dépensé cette semaine</span><div class="big num">{{s.fmt(s.weekSpent())}}</div></div>
    <div class="card"><span class="mute">Reste (liste incluse)</span><div class="big num" [style.color]="s.remaining()<0?'#D9622B':''">{{s.fmt(s.remaining())}}</div></div>
    <div class="card"><span class="mute">Moyenne par jour (semaine)</span><div class="big num">{{s.fmt(s.weekSpent()/7)}}</div></div></div>
  <div class="card" style="margin:1rem 0"><div class="row between"><span>Dépensé : <b class="num">{{s.fmt(s.weekSpent())}}</b> TND</span><span>Reste : <b class="num">{{s.fmt(s.budget()-s.weekSpent())}}</b> TND</span></div>
    <div class="bar" [class.over]="s.budget()>0&&s.weekSpent()>s.budget()" style="margin:.5rem 0"><i [style.width.%]="s.budget()>0?Math.min(100,s.weekSpent()/s.budget()*100):0"></i></div>
    <p class="mute" style="margin:0">{{s.budget()>0?Math.round(s.weekSpent()/s.budget()*100):0}} % du budget utilisé cette semaine.</p></div>
  @for (a of s.alerts(); track a.text) { <p style="margin:.5rem 0"><span class="pill" [class.warn]="a.warn">{{a.warn?'À voir':'OK'}}</span> {{a.text}}</p> }
  <div class="grid g2" style="margin-top:1rem">
    <div class="card"><h3>Enveloppes par catégorie</h3><table><tr><th>Catégorie</th><th>Enveloppe</th><th>Dépensé (semaine)</th></tr>
      @for (c of s.spentByCat(); track c.cat) { <tr><td><span class="dot" [style.background]="c.color"></span> {{c.cat}}<div class="bar" [class.over]="c.used>c.alloc" style="margin-top:.3rem"><i [style.width.%]="c.alloc?Math.min(100,c.used/c.alloc*100):(c.used?100:0)"></i></div></td>
        <td><input type="number" min="0" [ngModel]="c.alloc" (ngModelChange)="s.setAlloc(c.cat,$event)"></td><td class="num">{{s.fmt(c.used)}}</td></tr> }
      <tr><td><b>Total</b></td><td class="num"><b>{{s.fmt(s.allocTotal())}}</b></td><td class="num"><b>{{s.fmt(s.weekSpent())}}</b></td></tr></table></div>
    <div class="card"><h3>Répartition des dépenses de la semaine</h3>
      @if (s.weekSpent() > 0) { <div class="row"><svg viewBox="0 0 42 42" width="170" role="img" aria-label="Répartition des dépenses">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e7e3d6" stroke-width="6"/>
        @for (a of arcs(); track a.cat) { <circle cx="21" cy="21" r="15.9155" fill="none" [attr.stroke]="a.color" stroke-width="6" [attr.stroke-dasharray]="a.p+' '+(100-a.p)" [attr.stroke-dashoffset]="a.off"/> }</svg>
        <div>@for (a of arcs(); track a.cat) { <div class="row" style="gap:.4rem"><span class="dot" [style.background]="a.color"></span>{{a.cat}} · {{a.p.toFixed(0)}} %</div> }</div></div> }
      @else { <p class="mute">Ajoutez une dépense pour voir la répartition.</p> }</div>
  </div>
  <div class="card" style="margin-top:1rem"><h3>Les 4 dernières semaines</h3><app-bars [data]="s.last4weeks()" /></div>
  <h2 style="margin:1.6rem 0 .6rem">Ajouter une dépense</h2>
  <form class="card row" style="align-items:end" (ngSubmit)="add()">
    <label class="field">Libellé<input name="l" [(ngModel)]="label" placeholder="ex. Marché"></label>
    <label class="field">Catégorie<select name="c" [(ngModel)]="cat">@for (x of cats; track x) { <option>{{x}}</option> }</select></label>
    <label class="field">Montant (TND)<input name="a" type="number" min="0" step="0.1" [(ngModel)]="amount" style="width:7rem"></label>
    <label class="field">Date<input name="d" type="date" [(ngModel)]="date"></label><button class="btn" type="submit">Ajouter</button></form>
  <div class="card" style="margin-top:1rem;overflow-x:auto">
    <div class="row between" style="margin-bottom:.6rem"><h3>Toutes les dépenses · {{s.fmt(filteredTotal())}} TND</h3>
      <div class="row"><select [ngModel]="fc()" (ngModelChange)="fc.set($event)" aria-label="Filtrer par catégorie"><option value="">Toutes les catégories</option>@for (x of cats; track x) { <option>{{x}}</option> }</select>
        <input type="month" [ngModel]="fm()" (ngModelChange)="fm.set($event)" aria-label="Filtrer par mois"></div></div>
    <table><tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th></th></tr>
    @for (e of filtered(); track e.id) { <tr><td>{{e.date}}</td><td>{{e.label}}</td><td>{{e.cat}}</td><td class="num">{{s.fmt(e.amount)}}</td><td><button class="btn sm ghost" (click)="s.delExpense(e.id)" [attr.aria-label]="'Supprimer '+e.label">✕</button></td></tr>
    } @empty { <tr><td colspan="5" class="mute">{{s.expenses().length ? 'Aucune dépense ne correspond à ces filtres.' : 'Aucune dépense. Ajoutez-en une ci-dessus, ou validez une liste de courses.'}}</td></tr> }</table></div>`,
  styles: `.dot{display:inline-block;width:.7rem;height:.7rem;border-radius:50%}`
})
export class Budget {
  s = inject(Store); Math = Math; cats = EXP_CATS; label = ''; cat = EXP_CATS[0]; fc = signal(''); fm = signal(''); amount: number | null = null; date = this.s.today();
  filtered = computed(() => this.s.expenses().filter(e => (!this.fc() || e.cat === this.fc()) && (!this.fm() || e.date.startsWith(this.fm()))));
  filteredTotal = computed(() => this.filtered().reduce((t, e) => t + e.amount, 0));
  arcs = computed(() => { const t = this.s.weekSpent() || 1; let acc = 0; return this.s.spentByCat().filter(c => c.used > 0).map(c => { const p = c.used / t * 100; const off = 25 - acc; acc += p; return { ...c, p, off }; }); });
  add() { if (!this.amount || this.amount <= 0) return; this.s.addExpense({ label: this.label.trim() || 'Dépense', cat: this.cat, amount: this.amount, date: this.date || this.s.today() }); this.label = ''; this.amount = null; }
}
