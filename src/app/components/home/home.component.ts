import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';
import { PulseDirective } from '../../shared/directives/pulse.directive';
import { GasMeterService } from '../../shared/services/gas-meter.service';
import { MeterReadingService } from '../../shared/services/meter-reading.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,  
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HungarianDatePipe,
    PulseDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  gasMeters: GasMeter[] = [];
  recentReadings: MeterReading[] = [];
  loading = true;
  errorMessage: string | null = null;
  
  private metersSubscription?: Subscription;
  private readingsSubscription?: Subscription;
  constructor(
    private gasMeterService: GasMeterService,
    private meterReadingService: MeterReadingService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    this.loadUserData();
  }
  ngOnDestroy(): void {
    
    if (this.metersSubscription) {
      this.metersSubscription.unsubscribe();
    }
    if (this.readingsSubscription) {
      this.readingsSubscription.unsubscribe();
    }
  }
  
  
  loadUserData(): void {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
      this.loading = false;
      return;
    }
    
    console.log('Adatok betöltése a következő felhasználóhoz:', userId);
    
    
    this.metersSubscription = this.gasMeterService.getGasMeters().subscribe({
      next: (meters) => {
        this.gasMeters = meters;
        console.log(`Betöltött adatok: ${meters.length} óra`);
        
        
        if (meters.length > 0) {
          this.loadRecentReadings(meters[0].id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Hiba a gázórák betöltésekor:', err);
        this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
        this.loading = false;
      }
    });
  }
    
  loadRecentReadings(meterId: string): void {
    this.readingsSubscription = this.meterReadingService.getMeterReadings(meterId).subscribe({
      next: (readings) => {
        this.recentReadings = readings.slice(0, 5);
        console.log(`Betöltött adatok: ${readings.length} leolvasás`);
        this.loading = false;
      },
      error: (err) => {
        console.error('Hiba a leolvasások betöltésekor:', err);
        this.errorMessage = 'Hiba történt a leolvasások betöltése során.';
        this.loading = false;
      }
    });
  }
}
