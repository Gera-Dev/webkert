import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService, UserPreferences } from '../../shared/services/storage.service';
import { NotificationService } from '../../shared/services/notification.service';
import { SchedulerService } from '../../shared/services/scheduler.service';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-settings',
  standalone: true,  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule
  ],
  template: `
    <section class="settings-container">
      <h1>Beállítások</h1>
      @if (isLoading) {
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Beállítások betöltése...</p>
        </div>
      }
      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Megjelenés</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="fill">
              <mat-label>Téma</mat-label>
              <mat-select formControlName="theme">
                <mat-option value="light">Világos</mat-option>
                <mat-option value="dark">Sötét</mat-option>
                <mat-option value="system">Rendszer (auto)</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>Nyelv</mat-label>
              <mat-select formControlName="language">
                <mat-option value="hu">Magyar</mat-option>
                <mat-option value="en">Angol</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header>
            <mat-card-title>Értesítések</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-label>Értesítések engedélyezése</mat-label>
              <mat-slide-toggle formControlName="notificationsEnabled">
                {{ settingsForm.get('notificationsEnabled')?.value ? 'Engedélyezve' : 'Kikapcsolva' }}
              </mat-slide-toggle>
            </div>
            <div class="form-row">
              <mat-label>Automatikus leolvasási emlékeztetők</mat-label>
              <mat-slide-toggle formControlName="autoReadingReminders">
                {{ settingsForm.get('autoReadingReminders')?.value ? 'Engedélyezve' : 'Kikapcsolva' }}
              </mat-slide-toggle>
            </div>
            @if (settingsForm.get('autoReadingReminders')?.value) {
              <mat-form-field appearance="fill">
                <mat-label>Alapértelmezett emlékeztető gyakoriság (napokban)</mat-label>
                <input matInput type="number" formControlName="defaultReadingInterval" min="1" max="365">
                <mat-error *ngIf="settingsForm.get('defaultReadingInterval')?.hasError('required')">
                  A gyakoriság megadása kötelező!
                </mat-error>
                <mat-error *ngIf="settingsForm.get('defaultReadingInterval')?.hasError('min')">
                  Minimum 1 nap lehet!
                </mat-error>
                <mat-error *ngIf="settingsForm.get('defaultReadingInterval')?.hasError('max')">
                  Maximum 365 nap lehet!
                </mat-error>
              </mat-form-field>
            }
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-header>
            <mat-card-title>Számlázási adatok</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="fill">
              <mat-label>Alapértelmezett gáz ár (Ft/m3)</mat-label>
              <input matInput type="number" formControlName="defaultGasPrice" min="0">
              <mat-error *ngIf="settingsForm.get('defaultGasPrice')?.hasError('required')">
                Az ár megadása kötelező!
              </mat-error>
              <mat-error *ngIf="settingsForm.get('defaultGasPrice')?.hasError('min')">
                Az ár nem lehet negatív!
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>Pénznem</mat-label>
              <mat-select formControlName="currency">
                <mat-option value="HUF">Forint (HUF)</mat-option>
                <mat-option value="EUR">Euro (EUR)</mat-option>
                <mat-option value="USD">Amerikai dollár (USD)</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
        <div class="actions">
          <button type="submit" mat-raised-button color="primary" [disabled]="isSubmitting || !settingsForm.valid || !settingsForm.dirty">
            <mat-icon>save</mat-icon> Mentés
          </button>
          <button type="button" mat-button (click)="resetForm()">
            <mat-icon>restore</mat-icon> Visszaállítás
          </button>
        </div>
      </form>
      <mat-card class="danger-zone">
        <mat-card-header>
          <mat-card-title>Veszélyes zóna</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>A helyi adatok törlése kijelentkezteti a felhasználót és törli az összes helyi beállítást.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="clearLocalData()">
            <mat-icon>delete_forever</mat-icon> Helyi adatok törlése
          </button>
        </mat-card-actions>
      </mat-card>
      <div class="storage-info">
        <h3>Helyi tárhely használat</h3>
        <div class="progress-bar">
          <div class="progress" [style.width.%]="storageUsage.percentage"></div>
        </div>
        <p>{{ formatBytes(storageUsage.used) }} / {{ formatBytes(storageUsage.total) }} ({{ storageUsage.percentage.toFixed(1) }}%)</p>
      </div>
    </section>
  `,
  styles: `
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }
    
    mat-card {
      margin-bottom: 1.5rem;
    }
    
    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    
    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .danger-zone {
      border: 1px solid var(--warn-color);
      margin-top: 2rem;
    }
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 2rem 0;
    }
    
    .storage-info {
      margin-top: 2rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .progress {
      height: 100%;
      background-color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
      .actions {
        flex-direction: column;
      }
    }
  `
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  storageUsage = { used: 0, total: 0, percentage: 0 };
  
  private subscriptions = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private schedulerService: SchedulerService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      theme: ['system', Validators.required],
      language: ['hu', Validators.required],
      notificationsEnabled: [true],
      autoReadingReminders: [true],
      defaultReadingInterval: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
      defaultGasPrice: [101.9, [Validators.required, Validators.min(0)]],
      currency: ['HUF', Validators.required]
    });
  }
  
  ngOnInit(): void {
    
    this.subscriptions.add(
      this.storageService.preferences$.subscribe(prefs => {
        this.settingsForm.patchValue(prefs);
        this.isLoading = false;
      })
    );
    
    
    this.storageUsage = this.storageService.getLocalStorageUsage();
  }
  
  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.isSubmitting = true;
      
      const preferences: UserPreferences = this.settingsForm.value;
      
      
      let currentTheme = '';
      this.storageService.preferences$.pipe(
        take(1) 
      ).subscribe(prefs => {
        if (prefs && preferences.theme !== prefs.theme) {
          this.storageService.saveThemeSetting(preferences.theme);
        }
      });
      
      
      this.storageService.savePreferences(preferences);
      
      
      this.notificationService.showNotification(
        'A beállítások sikeresen mentve!',
        'Rendben',
        3000
      );
      
      this.isSubmitting = false;
      this.settingsForm.markAsPristine();
    }
  }
  resetForm(): void {
    this.storageService.preferences$.pipe(
      take(1) 
    ).subscribe(preferences => {
      this.settingsForm.reset(preferences);
    });
  }
  
  clearLocalData(): void {
    
    const confirmClear = window.confirm(
      'Biztos, hogy törölni szeretné az összes helyi adatot? Ez a művelet nem vonható vissza és kijelentkezteti a rendszerből.'
    );
    
    if (confirmClear) {
      
      this.storageService.clearAllData();
      
      
      this.authService.logout().subscribe({
        next: () => {
          this.notificationService.showNotification(
            'Az összes helyi adat törlésre került. Kijelentkezés...'
          );
          
          
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Kijelentkezési hiba:', error);
          this.snackBar.open(
            'Hiba történt a kijelentkezés során, de a helyi adatok törölve lettek.',
            'Bezár',
            { duration: 5000 }
          );
        }
      });
    }
  }
  
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
