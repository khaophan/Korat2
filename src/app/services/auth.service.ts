import { Injectable, signal } from '@angular/core';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthReady = signal<boolean>(false);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.isAuthReady.set(true);
    });
  }

  async login(email: string, pass: string) {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  async logout() {
    return signOut(auth);
  }
}
