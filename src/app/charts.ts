import { Component, computed, input } from '@angular/core';
export interface Pt { l: string; v: number }
export interface Slice { l: string; v: number; c: string }
@Component({
  selector: 'app-bars',
  template: `
  @if (max() === 0) { <p class="mute">Aucune donnée à afficher pour le moment.</p> }
  @else { <div class="bars" role="img" aria-label="Diagramme en barres">
    @for (d of data(); track d.l) { <div class="col"><span class="v num">{{d.v < 10 ? d.v.toFixed(1) : d.v.toFixed(0)}}</span><div class="track"><i [style.height.%]="pct(d.v)" [class.top]="d.v === max()"></i></div><span class="l">{{d.l}}</span></div> }
  </div> }`,
  styles: `
  .bars{display:flex;gap:.5rem;align-items:flex-end;height:190px} .col{flex:1;display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:0;height:100%} .track{flex:1;width:100%;display:flex;align-items:flex-end}
  i{display:block;width:100%;background:var(--sage);border:2px solid var(--edge);border-bottom:0;border-radius:10px 10px 0 0;transition:height .5s cubic-bezier(.3,1.3,.5,1)} i.top{background:var(--sun)}
  .v{font-size:.8rem} .l{font-size:.75rem;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}`
})
export class Bars {
  data = input<Pt[]>([]);
  max = computed(() => Math.max(0, ...this.data().map(d => d.v)));
  pct = (v: number) => this.max() > 0 && v > 0 ? Math.max(4, v / this.max() * 100) : 0;
}
@Component({
  selector: 'app-donut',
  template: `
  @if (total() === 0) { <p class="mute">Aucune dépense à répartir.</p> }
  @else { <div class="row"><svg viewBox="0 0 42 42" width="170" role="img" aria-label="Répartition par catégorie">
    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e7e3d6" stroke-width="6"/>
    @for (a of arcs(); track a.l) { <circle cx="21" cy="21" r="15.9155" fill="none" [attr.stroke]="a.c" stroke-width="6" [attr.stroke-dasharray]="a.p + ' ' + (100 - a.p)" [attr.stroke-dashoffset]="a.off"/> }</svg>
    <div>@for (a of arcs(); track a.l) { <div class="row" style="gap:.4rem"><span class="dot" [style.background]="a.c"></span>{{a.l}} · {{a.p.toFixed(0)}} %</div> }</div></div> }`,
  styles: `.dot{display:inline-block;width:.7rem;height:.7rem;border-radius:50%}`
})
export class Donut {
  data = input<Slice[]>([]);
  total = computed(() => this.data().reduce((t, d) => t + d.v, 0));
  arcs = computed(() => { let acc = 0; return this.data().filter(d => d.v > 0).map(d => { const p = d.v / this.total() * 100, off = 25 - acc; acc += p; return { ...d, p, off }; }); });
}
