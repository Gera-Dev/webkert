import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MeterReadingComponent } from './components/meter-reading/meter-reading.component';
import { ReadingListComponent } from './components/reading-list/reading-list.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Védett útvonalak
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'meter-reading', 
    component: MeterReadingComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'meter-reading/:id', 
    component: MeterReadingComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'reading-list', 
    component: ReadingListComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'statistics', 
    component: StatisticsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  
  // Nyilvános útvonalak
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Bármely más útvonal a login oldalra irányít
  { path: '**', redirectTo: 'login' }
];
