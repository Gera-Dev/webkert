import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
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

import { DummyDataService } from '../../shared/services/dummy-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';

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
export class ProfileComponent implements OnInit, AfterViewInit {
  profileForm!: FormGroup;
  meterForm!: FormGroup;
  loading = true;
  submitting = false;
  user: User | null = null;
  gasMeters: GasMeter[] = [];
  errorMessage: string | null = null;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dummyDataService: DummyDataService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForms();
    await this.loadUserData();
  }

  ngAfterViewInit(): void {
    // Az Angular Material ResizeObserver problémáinak javítása
    // Késleltetett detektálás a stabil megjelenítéshez
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

  async loadUserData(): Promise<void> {
    try {
      this.userId = this.authService.getCurrentUserId();
      
      if (!this.userId) {
        this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
        this.loading = false;
        return;
      }
      
      console.log('Adatok betöltése a következő felhasználóhoz:', this.userId);
      
      // Párhuzamosan lekérjük a felhasználói adatokat és a gázórákat
      const [userData, meters] = await Promise.all([
        this.dummyDataService.getUserById(this.userId),
        this.dummyDataService.getGasMeters(this.userId)
      ]);
      
      if (userData) {
        this.user = userData as User;
        this.profileForm.patchValue({
          displayName: this.user.displayName || '',
          phoneNumber: this.user.phoneNumber || '',
          address: this.user.address || ''
        });
      }
      
      this.gasMeters = meters;
      console.log(`Betöltött adatok: felhasználó és ${meters.length} gázóra`);
      this.loading = false;
    } catch (error) {
      console.error('Hiba a felhasználói adatok betöltése során:', error);
      this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
      this.loading = false;
    }
  }

  async onProfileSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }

    this.submitting = true;
    try {
      await this.dummyDataService.updateUser(this.userId, this.profileForm.value);
      this.showSuccess('Profil sikeresen frissítve!');
    } catch (error) {
      console.error('Hiba a profil mentése során:', error);
      this.showError('Nem sikerült menteni a profil adatokat!');
    } finally {
      this.submitting = false;
    }
  }

  async onMeterSubmit(): Promise<void> {
    if (this.meterForm.invalid) {
      this.markFormGroupTouched(this.meterForm);
      return;
    }

    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }

    this.submitting = true;
    try {
      const newMeter: GasMeter = {
        id: '',
        userId: this.userId,
        serialNumber: this.meterForm.value.serialNumber,
        address: this.meterForm.value.address,
        location: this.meterForm.value.location || '',
        installationDate: this.meterForm.value.installationDate,
        active: true
      };

      await this.dummyDataService.createGasMeter(newMeter);
      this.showSuccess('Gázóra sikeresen hozzáadva!');
      this.meterForm.reset({
        installationDate: new Date()
      });
      // Frissítsük a gázórák listáját
      await this.loadUserData();
    } catch (error) {
      console.error('Hiba a gázóra mentése során:', error);
      this.showError('Nem sikerült hozzáadni a gázórát!');
    } finally {
      this.submitting = false;
    }
  }

  async deleteMeter(meterId: string): Promise<void> {
    if (!confirm('Biztosan törölni szeretné ezt a gázórát? Ez a művelet nem vonható vissza!')) {
      return;
    }

    if (!this.userId) {
      this.showError('Nincs bejelentkezett felhasználó!');
      return;
    }

    try {
      await this.dummyDataService.deleteGasMeter(meterId);
      this.showSuccess('Gázóra sikeresen törölve!');
      // Frissítsük a gázórák listáját
      await this.loadUserData();
    } catch (error) {
      console.error('Hiba a gázóra törlése során:', error);
      this.showError('Nem sikerült törölni a gázórát!');
    }
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