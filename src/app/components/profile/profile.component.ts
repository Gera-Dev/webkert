import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { GasMeterService } from '../../shared/services/gas-meter.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    HungarianDatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  profileForm!: FormGroup;
  meterForm!: FormGroup;
  loading = true;
  submitting = false;
  user: User | null = null;
  gasMeters: GasMeter[] = [];
  errorMessage: string | null = null;
  userId: string | null = null;
  private metersSubscription?: Subscription;
  private userSubscription?: Subscription;
  constructor(
    private fb: FormBuilder,
    private gasMeterService: GasMeterService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }
  ngOnDestroy(): void {
    
    if (this.metersSubscription) {
      this.metersSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  ngAfterViewInit(): void {
    
    
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }, 100);
    });
  }
  initForms(): void {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      phoneNumber: ['', Validators.pattern('^[+]?[0-9]{11,12}$')],
      address: ['', Validators.required],
    });
    this.meterForm = this.fb.group({
      serialNumber: ['', Validators.required],
      address: ['', Validators.required],
      location: [''],
      installationDate: [new Date(), Validators.required]
    });
  }
  loadUserData(): void {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
      this.loading = false;
      return;
    }
    
    console.log('Adatok betöltése a következő felhasználóhoz:', this.userId);
    
    
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (userData) => {
        if (userData) {
          this.user = userData as unknown as User;
          this.profileForm.patchValue({
            displayName: this.user.displayName || '',
            phoneNumber: this.user.phoneNumber || '',
            address: this.user.address || ''
          });
        }
        
        
        this.loadGasMeters();
      },
      error: (err) => {
        console.error('Hiba a felhasználó adatainak betöltésekor:', err);
        this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
        this.loading = false;
      }
    });
  }
  
  loadGasMeters(): void {
    this.metersSubscription = this.gasMeterService.getGasMeters().subscribe({
      next: (meters) => {
        this.gasMeters = meters;
        console.log(`Betöltött adatok: felhasználó és ${meters.length} gázóra`);
        this.loading = false;
      },
      error: (err) => {
        console.error('Hiba a gázórák betöltésekor:', err);
        this.errorMessage = 'Hiba történt a gázórák betöltése során. Kérjük, próbáld újra később.';
        this.loading = false;
      }
    });
  }
  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }
    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }
    this.submitting = true;
    
    
    this.authService.updateUserProfile(this.profileForm.value).subscribe({
      next: () => {
        this.showSuccess('Profil sikeresen frissítve!');
        this.submitting = false;
      },
      error: (err) => {
        console.error('Hiba a profil mentése során:', err);
        this.showError('Nem sikerült menteni a profil adatokat!');
        this.submitting = false;
      }
    });
  }
  onMeterSubmit(): void {
    if (this.meterForm.invalid) {
      this.markFormGroupTouched(this.meterForm);
      return;
    }
    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }
    this.submitting = true;
    
    const newMeter: Omit<GasMeter, 'id'> = {
      userId: this.userId,
      serialNumber: this.meterForm.value.serialNumber,
      address: this.meterForm.value.address,
      location: this.meterForm.value.location || '',
      installationDate: this.meterForm.value.installationDate,
      active: true
    };
    
    this.gasMeterService.addGasMeter(newMeter).subscribe({
      next: () => {
        this.showSuccess('Gázóra sikeresen hozzáadva!');
        this.meterForm.reset({
          installationDate: new Date()
        });
        
        this.loadGasMeters();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Hiba a gázóra mentése során:', err);
        this.showError('Nem sikerült hozzáadni a gázórát!');
        this.submitting = false;
      }
    });
  }
  deleteMeter(meterId: string): void {
    if (!confirm('Biztosan törölni szeretné ezt a gázórát? Ez a művelet nem vonható vissza!')) {
      return;
    }
    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }
    
    this.gasMeterService.deleteGasMeter(meterId).subscribe({
      next: () => {
        this.showSuccess('Gázóra sikeresen törölve!');
        
        this.loadGasMeters();
      },
      error: (err) => {
        console.error('Hiba a gázóra törlése során:', err);
        this.showError('Nem sikerült törölni a gázórát!');
      }
    });
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
  showError(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
