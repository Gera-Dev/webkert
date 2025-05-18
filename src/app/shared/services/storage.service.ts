import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  autoReadingReminders: boolean;
  defaultReadingInterval: number; 
  defaultGasPrice: number;
  currency: string;
  language: string;
}
export interface AppState {
  lastVisitedRoute: string;
  lastActiveMeterId?: string;
  expandedSections: string[];
  filterSettings: any;
  sortSettings: any;
}
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private readonly defaultPreferences: UserPreferences = {
    theme: 'system',
    notificationsEnabled: true,
    autoReadingReminders: true,
    defaultReadingInterval: 30, 
    defaultGasPrice: 101.9, 
    currency: 'HUF',
    language: 'hu'
  };
  
  
  private readonly defaultState: AppState = {
    lastVisitedRoute: '/',
    expandedSections: [],
    filterSettings: {},
    sortSettings: {
      readings: 'date_desc',
      meters: 'address_asc'
    }
  };
  
  
  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.defaultPreferences);
  private stateSubject = new BehaviorSubject<AppState>(this.defaultState);
  
  
  public preferences$ = this.preferencesSubject.asObservable();
  public state$ = this.stateSubject.asObservable();
  
  constructor(private authService: AuthService) {
    
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        
        this.loadUserData();
      } else {
        
        this.resetToDefaults();
      }
    });
  }
  
  
  private loadUserData(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;
    
    const preferencesKey = `gazor_preferences_${userId}`;
    const stateKey = `gazor_state_${userId}`;
    
    try {
      
      const savedPreferencesStr = localStorage.getItem(preferencesKey);
      if (savedPreferencesStr) {
        const savedPreferences = JSON.parse(savedPreferencesStr) as Partial<UserPreferences>;
        this.preferencesSubject.next({
          ...this.defaultPreferences,
          ...savedPreferences
        });
      }
      
      
      const savedStateStr = localStorage.getItem(stateKey);
      if (savedStateStr) {
        const savedState = JSON.parse(savedStateStr) as Partial<AppState>;
        this.stateSubject.next({
          ...this.defaultState,
          ...savedState
        });
      }
      
      console.log('Felhasználói adatok betöltve a lokális tárolóból');
    } catch (error) {
      console.error('Hiba a felhasználói adatok betöltése közben:', error);
      
      this.resetToDefaults();
    }
  }
  
  
  private resetToDefaults(): void {
    this.preferencesSubject.next(this.defaultPreferences);
    this.stateSubject.next(this.defaultState);
  }
  
  
  savePreferences(preferences: Partial<UserPreferences>): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;
    
    const preferencesKey = `gazor_preferences_${userId}`;
    const currentPreferences = this.preferencesSubject.getValue();
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };
    
    
    this.preferencesSubject.next(updatedPreferences);
    
    
    try {
      localStorage.setItem(preferencesKey, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Hiba a felhasználói beállítások mentése közben:', error);
    }
  }
  
  
  saveState(state: Partial<AppState>): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;
    
    const stateKey = `gazor_state_${userId}`;
    const currentState = this.stateSubject.getValue();
    const updatedState = {
      ...currentState,
      ...state
    };
    
    
    this.stateSubject.next(updatedState);
    
    
    try {
      localStorage.setItem(stateKey, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Hiba az alkalmazás állapot mentése közben:', error);
    }
  }
  
  
  saveLastVisitedRoute(route: string): void {
    this.saveState({ lastVisitedRoute: route });
  }
  
  
  saveLastActiveMeterId(meterId: string): void {
    this.saveState({ lastActiveMeterId: meterId });
  }
  
  
  saveThemeSetting(theme: 'light' | 'dark' | 'system'): void {
    this.savePreferences({ theme });
    
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'system') {
      
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }
  
  
  clearAllData(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;
    
    const preferencesKey = `gazor_preferences_${userId}`;
    const stateKey = `gazor_state_${userId}`;
    
    localStorage.removeItem(preferencesKey);
    localStorage.removeItem(stateKey);
    
    this.resetToDefaults();
    console.log('Felhasználói adatok törölve a lokális tárolóból');
  }
  
  
  getLocalStorageUsage(): { used: number, total: number, percentage: number } {
    try {
      let usedSpace = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gazor_')) {
          const value = localStorage.getItem(key) || '';
          usedSpace += value.length * 2; 
        }
      }
      
      
      const totalSpace = 5 * 1024 * 1024; 
      const percentage = (usedSpace / totalSpace) * 100;
      
      return {
        used: usedSpace,
        total: totalSpace,
        percentage: percentage
      };
    } catch (error) {
      console.error('Hiba a helyi tárhelyhasználat ellenőrzése közben:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}
