import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DummyDataService } from '../../shared/services/dummy-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { MeterReading } from '../../shared/models/meter-reading.model';

@Component({
  selector: 'app-meter-reading',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './meter-reading.component.html',
  styleUrls: ['./meter-reading.component.css']
})
export class MeterReadingComponent implements OnInit {
  readingForm!: FormGroup;
  gasMeters: GasMeter[] = [];
  loading = true;
  submitting = false;
  isEditMode = false;
  selectedMeterId = '';
  userId: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dummyDataService: DummyDataService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
    
    this.route.paramMap.subscribe(params => {
      const meterId = params.get('id');
      if (meterId) {
        this.selectedMeterId = meterId;
        this.readingForm.patchValue({ meterId });
      }
    });
  }

  // Inicializálja az űrlapot a validátorokkal
  initForm(): void {
    this.readingForm = this.fb.group({
      meterId: ['', Validators.required],
      reading: ['', [Validators.required, Validators.min(0)]],
      readingDate: [new Date(), Validators.required],
      notes: ['']
    });
  }

  // Betölti a felhasználó adatait
  async loadUserData(): Promise<void> {
    try {
      this.userId = this.authService.getCurrentUserId();
      
      if (!this.userId) {
        this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
        this.loading = false;
        return;
      }
      
      await this.loadGasMeters();
    } catch (error) {
      console.error('Hiba történt az adatok betöltésekor:', error);
      this.loading = false;
      this.showError('Nem sikerült betölteni az adatokat!');
    }
  }

  // Betölti a felhasználó gázóráit
  async loadGasMeters(): Promise<void> {
    if (!this.userId) return;
    
    try {
      this.gasMeters = await this.dummyDataService.getGasMeters(this.userId);
      this.loading = false;
      
      if (this.selectedMeterId && this.gasMeters.length > 0) {
        const selectedMeter = this.gasMeters.find(m => m.id === this.selectedMeterId);
        if (selectedMeter) {
          this.readingForm.patchValue({ meterId: selectedMeter.id });
          this.onMeterChange(selectedMeter.id);
        }
      }
    } catch (error) {
      console.error('Hiba történt a gázórák betöltésekor:', error);
      this.loading = false;
      this.showError('Nem sikerült betölteni a gázórákat!');
    }
  }

  // Frissíti az űrlapot a kiválasztott mérőóra alapján
  async onMeterChange(meterId: string): Promise<void> {
    if (!meterId) return;
    
    try {
      const readings = await this.dummyDataService.getMeterReadingsByMeter(meterId);
      
      if (readings && readings.length > 0) {
        const lastReading = readings[0]; 
        this.readingForm.get('previousReading')?.setValue(lastReading.reading);
      }
    } catch (error) {
      console.error('Hiba történt a leolvasások betöltésekor:', error);
    }
  }

  // Feldolgozza az űrlap beküldését és menti a leolvasást
  async onSubmit(): Promise<void> {
    if (this.readingForm.invalid) {
      this.markFormGroupTouched(this.readingForm);
      return;
    }

    this.submitting = true;
    const formValues = this.readingForm.value;

    try {
      const meter = this.gasMeters.find(m => m.id === formValues.meterId);
      
      if (!meter) {
        throw new Error('A kiválasztott gázóra nem található!');
      }

      if (meter.lastReading && formValues.reading <= meter.lastReading) {
        this.showError('Az új leolvasásnak nagyobbnak kell lennie, mint az előző érték!');
        this.submitting = false;
        return;
      }

      const newReading: MeterReading = {
        id: '',
        userId: this.userId!,
        meterId: formValues.meterId,
        reading: formValues.reading,
        previousReading: meter.lastReading || 0,
        consumption: meter.lastReading ? formValues.reading - meter.lastReading : 0,
        readingDate: formValues.readingDate,
        notes: formValues.notes || '',
        status: 'pending',
        createdAt: new Date()
      };

      const docRef = await this.dummyDataService.createMeterReading(newReading);
      
      await this.dummyDataService.updateGasMeter(meter.id, {
        lastReading: formValues.reading,
        lastReadingDate: formValues.readingDate
      });

      this.showSuccess('Sikeres leolvasás mentés!');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Hiba történt a leolvasás mentésekor:', error);
      this.showError('Nem sikerült menteni a leolvasást!');
    } finally {
      this.submitting = false;
    }
  }

  // Megjelöli az űrlap összes mezőjét megérintettként
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Sikeres üzenetet jelenít meg
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Hibaüzenetet jelenít meg
  showError(message: string): void {
    this.snackBar.open(message, 'Bezárás', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}