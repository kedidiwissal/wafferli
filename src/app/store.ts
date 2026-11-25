import { Injectable, signal, computed, effect } from '@angular/core';

export const CATS = ['Fruits & légumes', 'Produits laitiers', 'Viandes & poissons', 'Épicerie', 'Autres', 'Boulangerie', 'Boissons', 'Épices & condiments'];
export const EXP_CATS = [...CATS, 'Restaurant'];
export const COLORS = ['#80B98B', '#F4C542', '#D9622B', '#164E3B', '#9AA39C', '#b9570a', '#1d5fa8', '#8a5a7a', '#c0392b'];
export const GOAL_EMOJIS = ['🐷', '🏖️', '🛟', '🚗', '🏠', '🎓', '🎁', '✈️', '💍'];
export interface Item { id: number; name: string; cat: string; qty: number; price: number; done: boolean; unit?: string }
export interface Goal { id: number; name: string; target: number; saved: number; deadline?: string; emoji?: string; log?: { d: string; a: number }[] }
export interface Expense { id: number; label: string; cat: string; amount: number; date: string }
export interface Trip { id: number; date: string; total: number; store?: string; items: { name: string; cat: string; qty: number; price: number; unit?: string }[] }
export interface Product { name: string; cat: string; unit: string; prices: { store: string; price: number }[] }
export interface Meal { name: string; emoji: string; time: number; serves: number; veg: boolean; country: string; flag: string; tags: string[]; desc: string; steps: string; ing: { name: string; cat: string; unit: string; frac: number; label: string; price: number }[] }

// clés de stockage conservées telles quelles pour ne pas perdre les comptes et données déjà créés
const NS = () => 'soumti2.' + (localStorage.getItem('soumti2.session') ?? 'guest') + '.';
const load = <T>(k: string, d: T): T => { try { const v = localStorage.getItem(NS() + k); return v ? JSON.parse(v) : d; } catch { return d; } };

@Injectable({ providedIn: 'root' })
export class Store {
  budget = signal<number>(load('budget', 0));
  start = signal<string>(load('start', new Date().toISOString().slice(0, 10)));
  members = signal<number>(load('members', 4));
  alloc = signal<Record<string, number>>(load('alloc', {}));
  items = signal<Item[]>(load('items', []));
  goals = signal<Goal[]>(load('goals', []));
  expenses = signal<Expense[]>(load('expenses', []));
  trips = signal<Trip[]>(load('trips', []));
  mealPlan = signal<Record<string, string>>(load('mealPlan', {}));
  theme = signal<'light' | 'dark'>(load('theme', 'light'));
  spentTotal = computed(() => this.expenses().reduce((t, e) => t + e.amount, 0));
  weekExpenses = computed(() => this.expenses().filter(e => e.date >= this.start()));
  weekSpent = computed(() => this.weekExpenses().reduce((t, e) => t + e.amount, 0));
  weekByCat = computed(() => EXP_CATS.map((c, i) => ({ l: c, c: COLORS[i], v: this.weekExpenses().filter(e => e.cat === c).reduce((t, e) => t + e.amount, 0) })).filter(x => x.v > 0));
  private sumBetween = (a: string, b: string) => this.expenses().filter(e => e.date >= a && e.date <= b).reduce((t, e) => t + e.amount, 0);
  private ago = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  last7 = computed(() => { const J = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']; return [6, 5, 4, 3, 2, 1, 0].map(n => { const d = this.ago(n); return { l: J[new Date(d + 'T12:00:00').getDay()], v: this.sumBetween(d, d) }; }); });
  last4weeks = computed(() => [3, 2, 1, 0].map(w => ({ l: w === 0 ? 'Cette sem.' : `Il y a ${w} sem.`, v: this.sumBetween(this.ago(w * 7 + 6), this.ago(w * 7)) })));
  spentByCat = computed(() => EXP_CATS.map((c, i) => ({ cat: c, color: COLORS[i], alloc: this.alloc()[c] ?? 0, used: this.weekExpenses().filter(e => e.cat === c).reduce((t, e) => t + e.amount, 0) })));
  history = [{ l: 'S-3', v: 132 }, { l: 'S-2', v: 158 }, { l: 'S-1', v: 121 }];

  planned = computed(() => this.items().reduce((s, i) => s + i.qty * i.price, 0));
  spent = computed(() => this.items().filter(i => i.done).reduce((s, i) => s + i.qty * i.price, 0));
  remaining = computed(() => this.budget() - this.planned() - this.weekSpent());
  pct = computed(() => this.budget() > 0 ? Math.round((this.planned() + this.weekSpent()) / this.budget() * 100) : 0);
  byCat = computed(() => CATS.map((c, i) => ({ cat: c, color: COLORS[i], alloc: this.alloc()[c] ?? 0, used: this.items().filter(x => x.cat === c).reduce((s, x) => s + x.qty * x.price, 0) })));
  allocTotal = computed(() => EXP_CATS.reduce((s, c) => s + (this.alloc()[c] ?? 0), 0));
  alerts = computed(() => {
    const a: { warn: boolean; text: string }[] = [];
    if (this.budget() === 0) a.push({ warn: false, text: 'Commencez par fixer votre budget de la semaine.' });
    else if (this.remaining() < 0) a.push({ warn: true, text: `Budget dépassé de ${this.fmt(-this.remaining())} TND.` });
    else if (this.pct() >= 80) a.push({ warn: true, text: `Vous avez prévu ${this.pct()} % de votre budget.` });
    else a.push({ warn: false, text: `Il vous reste ${this.fmt(this.remaining())} TND à planifier.` });
    this.byCat().filter(c => c.used > c.alloc).forEach(c => a.push({ warn: true, text: `Enveloppe « ${c.cat} » dépassée de ${this.fmt(c.used - c.alloc)} TND.` }));
    if (this.allocTotal() !== this.budget()) a.push({ warn: true, text: `Les enveloppes totalisent ${this.fmt(this.allocTotal())} TND pour un budget de ${this.fmt(this.budget())} TND.` });
    return a;
  });

  constructor() {
    // la semaine avance toute seule : le début de semaine saute de 7 jours en 7 jours (le jour choisi est conservé)
    const t = Date.now(); let d = new Date(this.start() + 'T12:00:00');
    if (!isNaN(d.getTime())) { while (d.getTime() + 7 * 864e5 <= t) d = new Date(d.getTime() + 7 * 864e5); this.start.set(d.toISOString().slice(0, 10)); }
    effect(() => { document.documentElement.dataset['theme'] = this.theme(); });
    effect(() => {
      const d = { budget: this.budget(), start: this.start(), members: this.members(), alloc: this.alloc(), items: this.items(), goals: this.goals(), expenses: this.expenses(), trips: this.trips(), mealPlan: this.mealPlan(), theme: this.theme() };
      for (const [k, v] of Object.entries(d)) { try { localStorage.setItem(NS() + k, JSON.stringify(v)); } catch { } }
    });
  }
  today = () => new Date().toISOString().slice(0, 10);
  addExpense(e: Omit<Expense, 'id'>) { this.expenses.update(l => [{ ...e, id: Date.now() + Math.random() }, ...l]); }
  delExpense(id: number) { this.expenses.update(l => l.filter(e => e.id !== id)); }
  finishShopping(store = '') {
    const it = this.items(); if (!it.length) return;
    const bought = it.some(i => i.done) ? it.filter(i => i.done) : it, date = this.today(), by: Record<string, number> = {};
    bought.forEach(i => by[i.cat] = (by[i.cat] ?? 0) + i.qty * i.price);
    Object.entries(by).forEach(([cat, a]) => this.addExpense({ label: store ? 'Courses – ' + store : 'Courses', cat, amount: Math.round(a * 100) / 100, date }));
    this.trips.update(t => [{ id: Date.now(), date, store: store || undefined, total: Math.round(bought.reduce((x, i) => x + i.qty * i.price, 0) * 100) / 100, items: bought.map(i => ({ name: i.name, cat: i.cat, qty: i.qty, price: i.price, unit: i.unit })) }, ...t]);
    this.items.set(it.some(i => i.done) ? it.filter(i => !i.done) : []);
  }
  reuse(t: Trip) { t.items.forEach(g => this.bumpItem(g.name, g.cat, g.price, g.qty, g.unit)); }
  clearList() { this.items.set([]); }
  fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
  add(i: Omit<Item, 'id' | 'done'>) { this.items.update(l => [...l, { ...i, id: Date.now() + Math.random(), done: false }]); }
  patch(id: number, p: Partial<Item>) { this.items.update(l => l.map(i => i.id === id ? { ...i, ...p } : i)); }
  remove(id: number) { this.items.update(l => l.filter(i => i.id !== id)); }
  // quantités ajustées au nombre de personnes du foyer, arrondies à l'unité d'achat
  addMeal(m: Meal, n = this.members()) { m.ing.forEach(g => this.bumpItem(g.name, g.cat, g.price, Math.max(1, Math.ceil(g.frac * n / m.serves)), g.unit)); }
  bumpItem(name: string, cat: string, price: number, q: number, unit?: string) { const ex = this.items().find(i => i.name === name); ex ? this.patch(ex.id, { qty: ex.qty + q }) : this.add({ name, cat, qty: q, price, unit }); }
  setAlloc(c: string, v: number) { this.alloc.update(a => ({ ...a, [c]: Math.max(0, +v || 0) })); }
  reset() { const ns = NS(); Object.keys(localStorage).filter(k => k.startsWith(ns)).forEach(k => localStorage.removeItem(k)); location.reload(); }
}
