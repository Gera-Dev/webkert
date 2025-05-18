import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './shared/services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'GázŐr';
  currentYear: number = new Date().getFullYear();
  mobileMenuOpen: boolean = false;
  isAuthenticated = false;
  currentUserName: string | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUserName = user?.displayName || null;
    });
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
    logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        
        console.log('Sikeres kijelentkezés');
      },
      error: (error) => {
        console.error('Kijelentkezési hiba:', error);
      }
    });
  }
}
