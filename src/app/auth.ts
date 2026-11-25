import { Injectable, signal, computed, inject, Component } from '@angular/core';
import { CanActivateFn, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
interface User { name: string; email: string; hash: string; city?: string }
// clés et sel de hachage conservés tels quels pour ne pas perdre les comptes déjà créés
const K = 'soumti2.';
const hash = async (p: string) => { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('soumti|' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch { return btoa(p); } };
const read = (): User[] => { try { return JSON.parse(localStorage.getItem(K + 'users') ?? '[]'); } catch { return []; } };

@Injectable({ providedIn: 'root' })
export class Auth {
  private users = signal<User[]>(read());
  email = signal<string | null>(localStorage.getItem(K + 'session'));
  user = computed(() => this.users().find(u => u.email === this.email()));
  private save(u: User[]) { this.users.set(u); localStorage.setItem(K + 'users', JSON.stringify(u)); }
  private enter(email: string) { localStorage.setItem(K + 'session', email); location.hash = '#/dashboard'; location.reload(); }
  async register(name: string, email: string, pass: string, city = '', household = 4): Promise<string> {
    email = email.trim().toLowerCase();
    if (!name.trim()) return 'Entrez votre prénom.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Adresse e-mail invalide.';
    if (pass.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (this.users().some(u => u.email === email)) return 'Un compte existe déjà avec cet e-mail.';
    this.save([...this.users(), { name: name.trim(), email, hash: await hash(pass), city: city.trim() }]);
    localStorage.setItem(K + email + '.members', JSON.stringify(Math.max(1, Math.round(household) || 1)));
    this.enter(email); return '';
  }
  async login(email: string, pass: string): Promise<string> {
    const u = this.users().find(x => x.email === email.trim().toLowerCase());
    if (!u || u.hash !== await hash(pass)) return 'E-mail ou mot de passe incorrect.';
    this.enter(u.email); return '';
  }
  logout() { localStorage.removeItem(K + 'session'); location.hash = '#/'; location.reload(); }
  update(name: string, city: string) { if (name.trim()) this.save(this.users().map(u => u.email === this.email() ? { ...u, name: name.trim(), city: city.trim() } : u)); }
  async changePassword(old: string, nw: string): Promise<string> {
    const u = this.user(); if (!u || u.hash !== await hash(old)) return 'Ancien mot de passe incorrect.';
    if (nw.length < 6) return 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
    this.save(this.users().map(x => x.email === u.email ? { ...x, hash: '' } : x)); const h = await hash(nw);
    this.save(this.users().map(x => x.email === u.email ? { ...x, hash: h } : x)); return 'ok';
  }
  remove() { const e = this.email(); Object.keys(localStorage).filter(k => k.startsWith(K + e + '.')).forEach(k => localStorage.removeItem(k)); this.save(this.users().filter(u => u.email !== e)); this.logout(); }
}
export const authGuard: CanActivateFn = () => inject(Auth).email() ? true : inject(Router).parseUrl('/login');

@Component({
  selector: 'app-auth', imports: [FormsModule, RouterLink],
  template: `
  <section class="auth card"><h1>{{reg ? 'Créer mon compte' : 'Se connecter'}}</h1>
    <p class="mute">Vos données restent dans ce navigateur : aucun serveur n'est utilisé.</p>
    <form (ngSubmit)="go()" class="f">
      @if (reg) { <label class="field">Prénom<input name="n" [(ngModel)]="name" autocomplete="given-name"></label> }
      <label class="field">E-mail<input name="e" type="email" [(ngModel)]="email" autocomplete="email"></label>
      <label class="field">Mot de passe<input name="p" type="password" [(ngModel)]="pass" [attr.autocomplete]="reg ? 'new-password' : 'current-password'"></label>
      @if (reg) { <label class="field">Confirmer le mot de passe<input name="c" type="password" [(ngModel)]="conf" autocomplete="new-password"></label>
        <div class="row"><label class="field" style="flex:1">Ville<input name="v" [(ngModel)]="city" placeholder="Tunis, Sfax, Sousse…"></label>
          <label class="field">Personnes au foyer<input name="h" type="number" min="1" max="15" [(ngModel)]="hh" style="width:8rem"></label></div> }
      @if (err()) { <p class="err">{{err()}}</p> }
      <button class="btn" type="submit">{{reg ? 'Créer mon compte' : 'Entrer'}}</button>
    </form>
    <p>@if (reg) { Déjà un compte ? <a routerLink="/login">Se connecter</a> } @else { Pas encore de compte ? <a routerLink="/register">Créer un compte</a> }</p>
  </section>`,
  styles: `.auth{max-width:440px;margin:1rem auto;display:grid;gap:.8rem}.f{display:grid;gap:.9rem}h1{font-size:2.2rem}`
})
export class AuthPage {
  a = inject(Auth); reg = inject(Router).url.includes('register'); name = ''; email = ''; pass = ''; conf = ''; city = ''; hh = 4; err = signal('');
  async go() {
    if (this.reg && this.pass !== this.conf) { this.err.set('Les mots de passe ne correspondent pas.'); return; }
    this.err.set(this.reg ? await this.a.register(this.name, this.email, this.pass, this.city, this.hh) : await this.a.login(this.email, this.pass));
  }
}
