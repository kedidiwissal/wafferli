import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from './store';
import { Auth } from './auth';
@Component({
  selector: 'app-profil', imports: [FormsModule],
  template: `
  <h1>Profil & réglages 👤</h1>
  <div class="grid g2" style="margin-top:1rem">
    <div class="card"><h3>Mon profil</h3>
      <label class="field" style="margin:.8rem 0">Prénom<input [ngModel]="name" (ngModelChange)="name=$event"></label>
      <p class="mute">E-mail : {{a.email()}}</p>
      <label class="field" style="margin:.8rem 0">Ville<input [ngModel]="city" (ngModelChange)="city=$event" placeholder="Tunis, Sfax, Sousse…"></label>
      <label class="field" style="margin:.8rem 0">Personnes dans le foyer<input type="number" min="1" [ngModel]="s.members()" (ngModelChange)="s.members.set(+$event||1)" style="width:7rem"></label>
      <label class="field" style="margin:.8rem 0">Budget de la semaine (TND)<input type="number" min="0" [ngModel]="s.budget()" (ngModelChange)="s.budget.set(+$event||0)" style="width:9rem"></label>
      <button class="btn sm" (click)="save()">Enregistrer</button> @if (saved()) { <span class="pill">Enregistré ✓</span> }</div>
    <div class="card"><h3>Apparence</h3><p class="mute">Choisissez le thème de l'application.</p>
      <div class="row"><button class="chip" [class.on]="s.theme()==='light'" (click)="s.theme.set('light')">☀️ Clair</button><button class="chip" [class.on]="s.theme()==='dark'" (click)="s.theme.set('dark')">🌙 Sombre</button></div>
      <p class="mute" style="margin-top:1rem">Devise : dinar tunisien (TND).</p></div>
    <div class="card"><h3>Mot de passe</h3>
      <form (ngSubmit)="pwd()" style="display:grid;gap:.7rem;margin-top:.6rem"><input name="o" type="password" [(ngModel)]="old" placeholder="Ancien mot de passe" autocomplete="current-password"><input name="n" type="password" [(ngModel)]="nw" placeholder="Nouveau mot de passe" autocomplete="new-password"><button class="btn sm" type="submit">Changer</button></form>
      @if (pmsg()) { <p [class.err]="pmsg()!=='Mot de passe modifié ✓'">{{pmsg()}}</p> }</div>
    <div class="card"><h3>Mes données</h3><p class="mute">Elles restent dans ce navigateur. Pensez à exporter une sauvegarde avant de vider le cache.</p>
      <p class="mute">{{s.items().length}} produit(s) en liste · {{s.expenses().length}} dépense(s) · {{s.goals().length}} objectif(s) · {{s.trips().length}} course(s) archivée(s).</p>
      <div class="row"><button class="btn sm ghost" (click)="export()">⬇ Exporter (JSON)</button><button class="btn sm ghost" (click)="reset()">Réinitialiser mes données</button></div>
      <div class="row" style="margin-top:1rem"><button class="btn sm" (click)="a.logout()">Se déconnecter</button><button class="btn sm ghost" style="color:var(--warn);border-color:var(--warn)" (click)="del()">Supprimer mon compte</button></div></div>
  </div>`
})
export class Profil {
  s = inject(Store); a = inject(Auth); name = this.a.user()?.name ?? ''; city = this.a.user()?.city ?? ''; saved = signal(false); old = ''; nw = ''; pmsg = signal('');
  save() { this.a.update(this.name, this.city); this.saved.set(true); setTimeout(() => this.saved.set(false), 2000); }
  async pwd() { const r = await this.a.changePassword(this.old, this.nw); this.pmsg.set(r === 'ok' ? 'Mot de passe modifié ✓' : r); if (r === 'ok') { this.old = ''; this.nw = ''; } }
  export() {
    const ns = `soumti2.${this.a.email()}.`, o: Record<string, unknown> = {};
    Object.keys(localStorage).filter(k => k.startsWith(ns)).forEach(k => o[k.slice(ns.length)] = JSON.parse(localStorage.getItem(k)!));
    const u = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' })); const l = document.createElement('a'); l.href = u; l.download = 'wafferli-donnees.json'; l.click(); URL.revokeObjectURL(u);
  }
  reset() { if (confirm('Effacer budget, liste, dépenses, objectifs et historique ?')) this.s.reset(); }
  del() { if (confirm('Supprimer définitivement votre compte et vos données ?')) this.a.remove(); }
}
