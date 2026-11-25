import { CATS, Product, Meal } from './store';
// Les 3 premières enseignes sont celles de l'écran d'accueil (ticket de caisse) : leur ordre et leurs prix ne bougent pas.
export const ALL_STORES = [{ n: 'Carrefour', c: '#1d5fa8' }, { n: 'MG', c: '#c0392b' }, { n: 'Monoprix', c: '#b9570a' }, { n: 'Aziza', c: '#6a4c93' }, { n: 'Marché central', c: '#8a6b57' }];
export const STORES = ALL_STORES.slice(0, 3);
// ordre des prix : Carrefour, MG, Monoprix, Aziza, Marché central
const P = (name: string, cat: string, unit: string, v: number[]): Product => ({ name, cat, unit, prices: ALL_STORES.map((s, i) => ({ store: s.n, price: v[i] })) });
// Prix indicatifs en TND : repères de marchés tunisiens 2026 + estimations par enseigne. À vérifier en rayon.
export const PRODUCTS: Product[] = [
  P('Lait', CATS[1], '1 L', [1.48, 1.5, 1.55, 1.5, 1.55]), P('Œufs', CATS[1], 'x6', [3.6, 3.9, 4.1, 3.8, 3.6]), P('Yaourt nature', CATS[1], 'pot', [0.7, 0.65, 0.75, 0.7, 0.7]), P('Fromage râpé', CATS[1], 'sachet 200 g', [4.5, 4.2, 4.8, 4.4, 4.6]),
  P('Tomates', CATS[0], '1 kg', [3.5, 3.3, 3.9, 3.7, 2.7]), P('Pommes de terre', CATS[0], '1 kg', [2.4, 2.5, 2.8, 2.5, 2.0]), P('Carottes', CATS[0], '1 kg', [2.0, 2.2, 1.9, 2.1, 1.5]), P('Courgettes', CATS[0], '1 kg', [3.0, 2.8, 3.3, 3.05, 2.35]), P('Poivrons', CATS[0], '1 kg', [3.2, 3.4, 2.9, 3.15, 2.5]),
  P('Oignons', CATS[0], '1 kg', [1.6, 1.5, 1.8, 1.6, 1.2]), P('Citrons', CATS[0], '1 kg', [2.9, 2.8, 3.1, 3.0, 2.4]), P('Persil', CATS[0], 'botte', [0.5, 0.5, 0.6, 0.5, 0.4]),
  P('Poulet', CATS[2], '1 kg', [9.2, 8.8, 9.9, 9.15, 8.6]), P('Viande d\'agneau', CATS[2], '1 kg', [36, 35, 38, 36.5, 33]), P('Merguez', CATS[2], 'paquet 500 g', [11, 10.5, 11.5, 10.8, 10]), P('Thon en conserve', CATS[2], '160 g', [4.4, 4.2, 4.0, 4.1, 4.3]),
  P('Riz', CATS[3], '1 kg', [3.6, 3.4, 3.9, 3.5, 3.3]), P('Pâtes', CATS[3], '500 g', [0.9, 0.95, 1.05, 0.95, 0.9]), P('Semoule', CATS[3], '1 kg', [1.0, 1.0, 1.2, 1.05, 0.95]), P('Couscous moyen', CATS[3], '1 kg', [2.4, 2.2, 2.5, 2.3, 2.1]),
  P('Pois chiches', CATS[3], '1 kg', [5.5, 5.2, 5.4, 5.25, 4.85]), P('Lentilles', CATS[3], '1 kg', [4.0, 3.8, 4.2, 3.9, 3.6]), P('Huile d\'olive', CATS[3], '1 L', [21, 22, 19.5, 20.55, 18.5]), P('Concentré de tomates', CATS[3], 'boîte 400 g', [2.2, 2.0, 2.4, 2.1, 1.9]),
  P('Sucre', CATS[3], '1 kg', [1.35, 1.3, 1.4, 1.35, 1.3]), P('Dattes Deglet Nour', CATS[3], '1 kg', [11, 10.5, 12, 11.5, 9]), P('Feuilles de brick', CATS[3], 'x10', [4.0, 3.8, 4.2, 3.9, 4.1]),
  P('Pain', CATS[5], 'baguette', [0.25, 0.2, 0.3, 0.2, 0.2]),
  P('Café moulu', CATS[6], 'paquet 250 g', [5.5, 5.2, 5.8, 5.4, 5.0]), P('Thé vert', CATS[6], 'boîte 250 g', [4.5, 4.3, 4.8, 4.4, 4.0]), P('Eau minérale', CATS[6], '1,5 L', [0.75, 0.7, 0.8, 0.75, 0.8]),
  P('Harissa', CATS[7], 'tube', [2.2, 2.4, 2.0, 2.15, 1.75]), P('Cumin moulu', CATS[7], 'sachet 100 g', [2.0, 1.8, 2.2, 2.0, 1.6]),
];
const prod = (n: string) => PRODUCTS.find(x => x.name === n)!;
// meilleur prix parmi les 5 enseignes (catalogue, listes, repas)
export const best = (n: string) => Math.min(...(prod(n)?.prices.map(x => x.price) ?? [0]));
// meilleur prix parmi les 3 enseignes du ticket d'accueil
export const minPrice = (n: string) => Math.min(...(prod(n)?.prices.filter(x => STORES.some(s => s.n === x.store)).map(x => x.price) ?? [0]));
export type MealX = Meal & { cost: number };
export const COUNTRIES = ['Tunisie', 'Italie', 'Liban', 'Inde', 'France', 'Maroc', 'Chine'];
export const TAGS = ['Économique', 'Végétarien', 'Rapide', 'Festif', 'Familial', 'Léger', 'Traditionnel'];
// ing = [produit, fraction de l'unité utilisée, quantité affichée] ; le coût est celui des portions réellement utilisées (au meilleur prix)
const M = (name: string, emoji: string, time: number, serves: number, country: string, flag: string, tags: string[], desc: string, steps: string, ing: [string, number, string?][]): MealX => ({
  name, emoji, time, serves, veg: tags.includes('Végétarien'), country, flag, tags, desc, steps,
  cost: ing.reduce((t, [n, f]) => t + f * best(n), 0),
  ing: ing.map(([n, f, l]) => ({ name: n, cat: prod(n).cat, unit: prod(n).unit, frac: f, label: l ?? '', price: best(n) })),
});
export const MEALS: MealX[] = [
  M('Ojja', '🍳', 25, 4, 'Tunisie', '🇹🇳', ['Économique', 'Végétarien', 'Rapide'], 'Sauce tomate-poivron pimentée à la harissa, œufs pochés dedans.', 'Faire revenir tomates et poivrons à l\'huile avec la harissa, laisser réduire, puis casser les œufs dans la sauce et couvrir 5 min.', [['Œufs', 1], ['Tomates', .5], ['Poivrons', .3], ['Harissa', .2]]),
  M('Lablabi', '🥣', 30, 4, 'Tunisie', '🇹🇳', ['Économique', 'Végétarien', 'Traditionnel'], 'Soupe de pois chiches sur pain rassis, relevée au cumin et à l\'huile d\'olive.', 'Cuire les pois chiches, servir sur du pain rassis avec cumin, ail, huile d\'olive et un œuf.', [['Pois chiches', .3], ['Pain', 3], ['Œufs', .5], ['Huile d\'olive', .03]]),
  M('Couscous aux légumes', '🥘', 60, 5, 'Tunisie', '🇹🇳', ['Végétarien', 'Traditionnel', 'Familial'], 'Semoule vapeur et légumes mijotés dans un bouillon épicé.', 'Cuire les légumes dans un bouillon épicé, rouler la semoule à la vapeur et servir ensemble.', [['Semoule', .5], ['Carottes', .4], ['Courgettes', .4], ['Pois chiches', .2], ['Tomates', .3]]),
  M('Pâtes au thon', '🍝', 25, 4, 'Italie', '🇮🇹', ['Économique', 'Rapide'], 'Pâtes dans une sauce tomate piquante au thon, prêtes en 25 minutes.', 'Cuire les pâtes, préparer une sauce tomate piquante au thon et mélanger.', [['Pâtes', 1], ['Tomates', .4], ['Thon en conserve', 1]]),
  M('Riz au poulet', '🍗', 45, 4, 'Tunisie', '🇹🇳', ['Familial'], 'Poulet doré et riz cuits ensemble dans le bouillon.', 'Dorer le poulet, ajouter le riz et le bouillon, cuire à couvert jusqu\'à absorption.', [['Poulet', .8], ['Riz', .4], ['Pommes de terre', .5]]),
  M('Salade méchouia', '🥗', 35, 3, 'Tunisie', '🇹🇳', ['Léger', 'Traditionnel'], 'Poivrons et tomates grillés, écrasés à l\'huile et servis avec du thon.', 'Griller poivrons et tomates, les écraser avec ail, huile et citron, servir avec du thon et du pain.', [['Poivrons', .5], ['Tomates', .4], ['Thon en conserve', 1], ['Pain', 2]]),
  M('Couscous à l\'agneau', '🍲', 90, 4, 'Tunisie', '🇹🇳', ['Festif', 'Traditionnel'], 'Le plat du vendredi : semoule vapeur, agneau tendre et légumes mijotés à la harissa.', 'Dorer l\'agneau avec la harissa, ajouter légumes et pois chiches, couvrir d\'eau et mijoter 1 h. Cuire la semoule à la vapeur et servir avec la sauce.', [['Couscous moyen', .5, '0,5 kg'], ['Viande d\'agneau', .6, '0,6 kg'], ['Pois chiches', .2, '0,2 kg'], ['Carottes', .5, '0,5 kg'], ['Courgettes', .5, '0,5 kg'], ['Harissa', .5, '½ tube']]),
  M('Chakchouka', '🍳', 30, 4, 'Tunisie', '🇹🇳', ['Économique', 'Végétarien', 'Rapide'], 'Tomates, poivrons et oignons pimentés, œufs pochés directement dans la poêle.', 'Faire revenir oignons et poivrons, ajouter tomates et harissa, laisser réduire 15 min, puis pocher les œufs dans la sauce.', [['Tomates', 1, '1 kg'], ['Poivrons', .5, '0,5 kg'], ['Oignons', .3, '0,3 kg'], ['Œufs', .67, '4 œufs'], ['Harissa', .25, '¼ tube']]),
  M('Ojja merguez', '🌭', 30, 4, 'Tunisie', '🇹🇳', ['Rapide'], 'Sauce tomate piquante, merguez grillées et œufs : le plat de rue qui réchauffe.', 'Griller les merguez, préparer une sauce tomate piquante aux poivrons et à la harissa, ajouter les merguez coupées puis casser les œufs et couvrir 5 min.', [['Merguez', 1, '1 paquet'], ['Tomates', .8, '0,8 kg'], ['Œufs', .67, '4 œufs'], ['Harissa', .5, '½ tube'], ['Poivrons', .3, '0,3 kg']]),
  M('Brik à l\'œuf et au thon', '🥟', 30, 4, 'Tunisie', '🇹🇳', ['Festif', 'Rapide'], 'La star des tables de ramadan : feuille croustillante, thon, persil et œuf coulant.', 'Mélanger thon, persil et un filet de citron, déposer sur une feuille avec un œuf cru, plier et frire 1 à 2 min par face.', [['Feuilles de brick', .4, '4 feuilles'], ['Œufs', .67, '4 œufs'], ['Thon en conserve', 1, '1 boîte'], ['Persil', 1, '1 botte'], ['Citrons', .1, '0,1 kg'], ['Huile d\'olive', .1, '0,1 L']]),
  M('Kafteji', '🥘', 35, 4, 'Tunisie', '🇹🇳', ['Économique', 'Végétarien'], 'Légumes frits hachés grossièrement avec des œufs, relevés à la harissa.', 'Frire pommes de terre, courgettes et poivrons, les hacher grossièrement, mélanger avec les œufs brouillés et la harissa.', [['Pommes de terre', .5, '0,5 kg'], ['Courgettes', .5, '0,5 kg'], ['Poivrons', .3, '0,3 kg'], ['Œufs', .33, '2 œufs'], ['Huile d\'olive', .1, '0,1 L']]),
  M('Spaghetti sauce tomate', '🍝', 25, 4, 'Italie', '🇮🇹', ['Économique', 'Rapide', 'Végétarien'], 'Sauce tomate mijotée à l\'oignon et à l\'huile d\'olive, le dîner des jours pressés.', 'Faire revenir l\'oignon, ajouter tomates et concentré, mijoter 15 min. Cuire les pâtes et les mélanger à la sauce avec un filet d\'huile d\'olive.', [['Pâtes', 2, '2 paquets'], ['Concentré de tomates', 1, '1 boîte'], ['Tomates', .5, '0,5 kg'], ['Oignons', .2, '0,2 kg'], ['Huile d\'olive', .05, '0,05 L']]),
  M('Mujaddara', '🍚', 45, 4, 'Liban', '🇱🇧', ['Économique', 'Végétarien'], 'Lentilles, riz et oignons dorés : simple, rassasiant et très économique.', 'Cuire lentilles et riz ensemble, dorer longuement les oignons dans l\'huile et les déposer par-dessus.', [['Lentilles', .3, '0,3 kg'], ['Riz', .3, '0,3 kg'], ['Oignons', .5, '0,5 kg'], ['Huile d\'olive', .05, '0,05 L']]),
  M('Curry de pois chiches', '🍛', 40, 4, 'Inde', '🇮🇳', ['Économique', 'Végétarien'], 'Pois chiches mijotés dans une sauce tomate épicée, servis avec du riz et du yaourt.', 'Faire revenir l\'oignon, ajouter tomates, pois chiches et épices, mijoter 20 min. Servir avec le riz et le yaourt.', [['Pois chiches', .4, '0,4 kg'], ['Tomates', .5, '0,5 kg'], ['Oignons', .3, '0,3 kg'], ['Yaourt nature', 2, '2 pots'], ['Riz', .4, '0,4 kg']]),
  M('Poulet rôti aux pommes de terre', '🍗', 75, 4, 'France', '🇫🇷', ['Familial'], 'Poulet doré au citron, pommes de terre fondantes : le dimanche à la française.', 'Frotter le poulet d\'huile et de citron, l\'entourer de pommes de terre et d\'oignons, enfourner 1 h à 200 °C.', [['Poulet', 1, '1 kg'], ['Pommes de terre', 1, '1 kg'], ['Citrons', .2, '0,2 kg'], ['Oignons', .3, '0,3 kg'], ['Huile d\'olive', .05, '0,05 L']]),
  M('Tajine de poulet au citron', '🥘', 80, 4, 'Maroc', '🇲🇦', ['Familial', 'Festif'], 'Poulet confit lentement avec oignons, citron et pommes de terre dans le tajine.', 'Dorer les oignons, ajouter le poulet, le citron et les pommes de terre, couvrir et cuire doucement 1 h.', [['Poulet', 1, '1 kg'], ['Oignons', .5, '0,5 kg'], ['Citrons', .3, '0,3 kg'], ['Pommes de terre', .5, '0,5 kg']]),
  M('Ratatouille', '🍆', 50, 4, 'France', '🇫🇷', ['Économique', 'Végétarien'], 'Courgettes, tomates et poivrons confits doucement, parfaits avec du riz ou du pain.', 'Faire revenir les légumes coupés en dés dans l\'huile, couvrir et confire à feu doux 40 min.', [['Courgettes', .5, '0,5 kg'], ['Tomates', .6, '0,6 kg'], ['Poivrons', .4, '0,4 kg'], ['Oignons', .3, '0,3 kg'], ['Huile d\'olive', .05, '0,05 L']]),
  M('Riz cantonais', '🍳', 25, 4, 'Chine', '🇨🇳', ['Économique', 'Rapide'], 'Riz sauté aux œufs, carottes et petits morceaux de poulet.', 'Cuire le riz, le faire sauter avec carottes et poulet en dés, ajouter les œufs brouillés en fin de cuisson.', [['Riz', .4, '0,4 kg'], ['Œufs', .5, '3 œufs'], ['Carottes', .3, '0,3 kg'], ['Poulet', .2, '0,2 kg']]),
];
// stores = enseignes comparées (3 pour le ticket d'accueil, 5 dans l'appli)
export function plan(items: { name: string; qty: number; price: number }[], stores = STORES) {
  const at = (i: { name: string; price: number }, s: string) => PRODUCTS.find(p => p.name === i.name)?.prices.find(x => x.store === s)?.price ?? i.price;
  const per = stores.map(s => ({ store: s.n, color: s.c, total: items.reduce((t, i) => t + i.qty * at(i, s.n), 0) }));
  const best = [...per].sort((a, b) => a.total - b.total)[0];
  const groups = stores.map(s => ({ store: s.n, color: s.c, lines: [] as string[], total: 0 }));
  items.forEach(i => { let k = 0, bp = Infinity; stores.forEach((s, j) => { const p = at(i, s.n); if (p < bp) { bp = p; k = j; } }); groups[k].lines.push(`${i.name} ×${i.qty}`); groups[k].total += i.qty * bp; });
  const mix = groups.reduce((t, g) => t + g.total, 0);
  return { per, best, groups: groups.filter(g => g.lines.length), mix, saving: best.total - mix };
}
