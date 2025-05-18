import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'meter-reading',
    loadComponent: () => import('./components/meter-reading/meter-reading.component').then(m => m.MeterReadingComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'meter-reading/:id',
    loadComponent: () => import('./components/meter-reading/meter-reading.component').then(m => m.MeterReadingComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'reading-list',
    loadComponent: () => import('./components/reading-list/reading-list.component').then(m => m.ReadingListComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'statistics',
    loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [authGuard]
  },  
  { 
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  
  { 
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  { path: '**', redirectTo: 'login' }
];
