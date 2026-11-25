import { Component, computed, input } from '@angular/core';
import { Store } from './store';
export const slug = (s: string) => s.toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const EMOJI: Record<string, string> = { 'Lait': '🥛', 'Riz': '🍚', 'Œufs': '🥚', 'Tomates': '🍅', 'Pommes de terre': '🥔', 'Poulet': '🍗', 'Pâtes': '🍝', "Huile d'olive": '🫒', 'Thon en conserve': '🐟', 'Semoule': '🌾', 'Pois chiches': '🫘', 'Pain': '🥖', 'Carottes': '🥕', 'Courgettes': '🥒', 'Poivrons': '🫑', 'Harissa': '🌶️', 'Yaourt nature': '🥣', 'Fromage râpé': '🧀', 'Oignons': '🧅', 'Citrons': '🍋', 'Persil': '🌿', "Viande d'agneau": '🥩', 'Merguez': '🌭', 'Couscous moyen': '🌾', 'Lentilles': '🫘', 'Concentré de tomates': '🥫', 'Sucre': '🍬', 'Dattes Deglet Nour': '🌴', 'Feuilles de brick': '🥟', 'Café moulu': '☕', 'Thé vert': '🍵', 'Eau minérale': '💧', 'Cumin moulu': '🌿' };
export const qtyOf = (s: Store, n: string) => s.items().find(i => i.name === n)?.qty ?? 0;
export function bump(s: Store, name: string, cat: string, price: number, d: number, unit?: string) {
  const ex = s.items().find(i => i.name === name);
  if (!ex) { if (d > 0) s.add({ name, cat, qty: 1, price, unit }); return; }
  const q = ex.qty + d; q <= 0 ? s.remove(ex.id) : s.patch(ex.id, { qty: q });
}
@Component({
  selector: 'app-pic', template: `<div class="pic"><span>{{e()}}</span><img [src]="src()" alt="" (error)="hide($event)"></div>`,
  styles: `.pic{position:relative;aspect-ratio:4/3;background:linear-gradient(135deg,var(--soft),#fdf0c2);display:grid;place-items:center;font-size:3rem;overflow:hidden;border-radius:14px}img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}`
})
export class Pic {
  name = input.required<string>(); e = input('🛒');
  src = computed(() => 'images/' + slug(this.name()) + '.jpg');
  hide(ev: Event) { (ev.target as HTMLElement).style.display = 'none'; }
}
