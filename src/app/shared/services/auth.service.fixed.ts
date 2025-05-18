import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap, tap, map, catchError } from 'rxjs/operators';
import { 
  Auth, 
  UserCredential,
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc as firebaseDoc,
  getDoc as firebaseGetDoc,
  setDoc as firebaseSetDoc,
  updateDoc as firebaseUpdateDoc,
  DocumentReference,
  DocumentSnapshot
} from '@angular/fire/firestore';
interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSubject: BehaviorSubject<AuthUser | null> = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();
  
  
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  constructor() {
    
    this.auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const user: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined
        };
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }
  
  login(email: string, password: string): Observable<boolean> {
    return from(firebaseSignIn(this.auth, email, password))
      .pipe(
        switchMap((credential: UserCredential) => {
          
          const userDocRef = firebaseDoc(this.firestore, 'users', credential.user.uid);
          return from(firebaseGetDoc(userDocRef)).pipe(
            switchMap(docSnap => {
              if (docSnap.exists()) {
                
                return from(firebaseUpdateDoc(userDocRef, { lastLogin: new Date() })).pipe(
                  map(() => true)
                );
              } else {
                
                const userData: User = {
                  id: credential.user.uid,
                  email: credential.user.email || '',
                  displayName: credential.user.displayName || '',
                  createdAt: new Date(),
                  lastLogin: new Date(),
                  active: true
                };
                return from(firebaseSetDoc(userDocRef, userData)).pipe(
                  map(() => true)
                );
              }
            })
          );
        }),
        catchError(error => {
          console.error('Bejelentkezési hiba:', error.message);
          throw error;
        })
      );
  }
  
  register(email: string, password: string, displayName: string): Observable<any> {
    return from(firebaseCreateUser(this.auth, email, password))
      .pipe(
        switchMap((credential: UserCredential) => {
          
          return from(firebaseUpdateProfile(credential.user, { displayName })).pipe(
            switchMap(() => {
              
              const userDocRef = firebaseDoc(this.firestore, 'users', credential.user.uid);
              const userData: User = {
                id: credential.user.uid,
                email,
                displayName,
                createdAt: new Date(),
                lastLogin: new Date(),
                active: true
              };
              
              return from(firebaseSetDoc(userDocRef, userData));
            })
          );
        }),
        catchError(error => {
          console.error('Regisztrációs hiba:', error.message);
          throw error;
        })
      );
  }
  
  logout(): Observable<void> {
    return from(firebaseSignOut(this.auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }),
      catchError(error => {
        console.error('Kijelentkezési hiba:', error.message);
        throw error;
      })
    );
  }
  
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }
  
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
  
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.getValue();
  }
  
  updateUserInfo(userId: string, userData: Partial<User>): Observable<void> {
    const userDocRef = firebaseDoc(this.firestore, 'users', userId);
    return from(firebaseUpdateDoc(userDocRef, { ...userData }));
  }
  
  getUserDetails(userId: string): Observable<User | null> {
    const userDocRef = firebaseDoc(this.firestore, 'users', userId);
    return from(firebaseGetDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as User;
        }
        return null;
      })
    );
  }
}
