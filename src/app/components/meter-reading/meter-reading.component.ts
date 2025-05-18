import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { AuthService } from '../../shared/services/auth.service';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { GasMeterService } from '../../shared/services/gas-meter.service';
import { MeterReadingService } from '../../shared/services/meter-reading.service';
import { Subscription } from 'rxjs';
import { MeterReadingValidatorDirective } from '../../shared/directives/meter-reading-validator.directive';
import { ConsumptionFormatPipe } from '../../shared/pipes/consumption-format.pipe';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';
import { FadeInDirective } from '../../shared/directives/fade-in.directive';
import { CustomFormControlDirective } from '../../shared/directives/custom-form-control.directive';
import { InfoTooltipDirective } from '../../shared/directives/info-tooltip.directive';
import { ReadingConfirmationDirective } from '../../shared/directives/reading-confirmation.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
@Component({
  selector: 'app-meter-reading',
  standalone: true,  imports: [
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
    MatSnackBarModule,
    MeterReadingValidatorDirective,
    ConsumptionFormatPipe,
    HungarianDatePipe,
    FadeInDirective,
    CustomFormControlDirective,
    InfoTooltipDirective,
    ReadingConfirmationDirective,
    TranslatePipe
  ],
  templateUrl: './meter-reading.component.html',
  styleUrls: ['./meter-reading.component.css']
})
export class MeterReadingComponent implements OnInit, OnDestroy {
  readingForm!: FormGroup;
  gasMeters: GasMeter[] = [];
  loading = true;
  submitting = false;
  isEditMode = false;
  selectedMeterId = '';
  userId: string | null = null;
  errorMessage: string | null = null;
  previousReading: number | null = null;
  lastReadingDate: Date | null = null;
  
  private metersSubscription?: Subscription;
  private readingSubscription?: Subscription;
  constructor(
    private fb: FormBuilder,
    private gasMeterService: GasMeterService,
    private meterReadingService: MeterReadingService,
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
  
  initForm(): void {
    this.readingForm = this.fb.group({
      meterId: ['', Validators.required],
      reading: ['', [Validators.required, Validators.min(0)]],
      readingDate: [new Date(), Validators.required],
      notes: ['']
    });
    
    
    this.readingForm.get('meterId')?.valueChanges.subscribe(meterId => {
      if (meterId) {
        this.loadPreviousReading(meterId);
      }
    });
  }
  ngOnDestroy(): void {
    
    if (this.metersSubscription) {
      this.metersSubscription.unsubscribe();
    }
    if (this.readingSubscription) {
      this.readingSubscription.unsubscribe();
    }
  }
  
  
  loadUserData(): void {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
      this.loading = false;
      return;
    }
    
    this.loadGasMeters();
  }
  
  loadGasMeters(): void {
    this.metersSubscription = this.gasMeterService.getGasMeters().subscribe({
      next: (meters) => {
        this.gasMeters = meters;
        this.loading = false;
        
        if (this.selectedMeterId && this.gasMeters.length > 0) {
          const selectedMeter = this.gasMeters.find(m => m.id === this.selectedMeterId);
          if (selectedMeter) {
            this.readingForm.patchValue({ meterId: selectedMeter.id });
            this.onMeterChange(selectedMeter.id);
          }
        }
      },
      error: (err) => {
        console.error('Hiba történt a gázórák betöltésekor:', err);
        this.loading = false;
        this.showError('Nem sikerült betölteni a gázórákat!');
      }
    });
  }
  
  onMeterChange(meterId: string): void {
    if (!meterId) return;
    
    this.readingSubscription = this.meterReadingService.getMeterReadings(meterId).subscribe({
      next: (readings) => {
        if (readings && readings.length > 0) {
          const lastReading = readings[0]; 
          this.readingForm.patchValue({
            previousReading: lastReading.reading
          });
        }
      },
      error: (err) => {
        console.error('Hiba történt a leolvasások betöltésekor:', err);
      }
    });
  }  
  onSubmit(): void {
    if (this.readingForm.invalid) {
      this.markFormGroupTouched(this.readingForm);
      return;
    }
    this.submitting = true;
    const formValues = this.readingForm.value;
    const meter = this.gasMeters.find(m => m.id === formValues.meterId);
    
    if (!meter) {
      this.showError('A kiválasztott gázóra nem található!');
      this.submitting = false;
      return;
    }
    if (meter.lastReading && formValues.reading <= meter.lastReading) {
      this.showError('Az új leolvasásnak nagyobbnak kell lennie, mint az előző érték!');
      this.submitting = false;
      return;
    }
    const newReading: Omit<MeterReading, 'id'> = {
      userId: this.userId!,
      meterId: formValues.meterId,
      reading: Number(formValues.reading),
      previousReading: meter.lastReading || 0,
      consumption: meter.lastReading ? Number(formValues.reading) - meter.lastReading : 0,
      readingDate: formValues.readingDate,
      notes: formValues.notes || '',
      status: 'pending',
      createdAt: new Date()
    };
    
    this.meterReadingService.addMeterReading(newReading).subscribe({
      next: (readingId) => {
        console.log('Leolvasás mentve:', readingId);
        
        
        this.gasMeterService.updateGasMeter(meter.id, {
          lastReading: formValues.reading,
          lastReadingDate: formValues.readingDate
        }).subscribe({
          next: () => {
            this.showSuccess('Sikeres leolvasás mentés!');
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Hiba történt a mérőóra frissítésekor:', err);
            this.showError('A leolvasást elmentettük, de nem sikerült frissíteni a mérőórát!');
            this.submitting = false;
          }
        });
      },
      error: (err) => {
        console.error('Hiba történt a leolvasás mentésekor:', err);
        this.showError('Nem sikerült menteni a leolvasást!');
        this.submitting = false;
      }
    });
  }
  
  loadPreviousReading(meterId: string): void {
    if (!meterId) return;
    
    this.readingSubscription?.unsubscribe();
    this.readingSubscription = this.meterReadingService.getMeterReadings(meterId).subscribe({
      next: (readings) => {
        if (readings.length > 0) {
          
          const sortedReadings = [...readings].sort((a, b) => 
            new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
          );
          
          
          const latestReading = sortedReadings[0];
          this.previousReading = latestReading.reading;
          this.lastReadingDate = latestReading.readingDate;
          
          
          const today = new Date();
          this.readingForm.patchValue({ readingDate: today });
        } else {
          this.previousReading = null;
          this.lastReadingDate = null;
        }
      },
      error: (err) => {
        console.error('Hiba az előző mérőállás betöltésekor:', err);
        this.errorMessage = 'Nem sikerült betölteni az előző mérőállást.';
        this.previousReading = null;
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
