import { Injectable } from '@angular/core';
import { DummyDataService } from './dummy-data.service';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Tároljuk a bejelentkezett felhasználót
  private currentUserSubject: BehaviorSubject<AuthUser | null> = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();
  
  // Tároljuk a bejelentkezési állapotot
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private dummyDataService: DummyDataService) {
    // Ellenőrizzük, van-e már bejelentkezett felhasználó a session storage-ban
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Bejelentkezés email és jelszó párossal
  async login(email: string, password: string): Promise<boolean> {
    try {
      // Felhasználó keresése email alapján
      const user = await this.dummyDataService.getUserByEmail(email);
      
      if (user) {
        // Ellenőrizzük a jelszót
        if (user.password === password) {
          // Sikeres bejelentkezés
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            displayName: user.displayName
          };
          
          // Frissítsük az utolsó bejelentkezést
          await this.dummyDataService.updateUser(user.id, {
            lastLogin: new Date()
          });
          
          // Tároljuk a bejelentkezett felhasználót
          this.currentUserSubject.next(authUser);
          this.isAuthenticatedSubject.next(true);
          sessionStorage.setItem('currentUser', JSON.stringify(authUser));
          
          return true;
        } else {
          // Hibás jelszó
          throw new Error('Hibás email vagy jelszó!');
        }
      } else {
        // Nem létezik ilyen felhasználó
        throw new Error('Hibás email vagy jelszó!');
      }
    } catch (error) {
      console.error('Bejelentkezési hiba:', error);
      throw error;
    }
  }

  // Regisztráció email, jelszó és név megadásával
  async register(email: string, password: string, displayName: string): Promise<boolean> {
    try {
      // Ellenőrizzük, hogy létezik-e már ez az email
      const existingUser = await this.dummyDataService.getUserByEmail(email);
      
      if (existingUser) {
        throw new Error('Ez az email cím már használatban van!');
      }
      
      // Új felhasználó létrehozása
      const newUser: User = {
        id: '', // ezt a dummyDataService fogja beállítani
        email,
        password, // A jelszót is eltároljuk
        displayName,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      // Új felhasználó mentése
      const result = await this.dummyDataService.createUser(newUser);
      
      // Automatikus bejelentkezés regisztráció után
      const authUser: AuthUser = {
        id: result.id,
        email,
        displayName
      };
      
      this.currentUserSubject.next(authUser);
      this.isAuthenticatedSubject.next(true);
      sessionStorage.setItem('currentUser', JSON.stringify(authUser));
      
      return true;
    } catch (error) {
      console.error('Regisztrációs hiba:', error);
      throw error;
    }
  }

  // Kijelentkezés
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    sessionStorage.removeItem('currentUser');
  }

  // Jelenlegi felhasználó azonosítójának lekérdezése
  getCurrentUserId(): string | null {
    const currentUser = this.currentUserSubject.getValue();
    return currentUser ? currentUser.id : null;
  }

  // Teljes felhasználói adatok lekérdezése
  async getCurrentUserDetails(): Promise<User | null> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return null;
    }
    
    return await this.dummyDataService.getUserById(userId);
  }
}
