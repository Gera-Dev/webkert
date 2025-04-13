import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DummyDataService } from '../../shared/services/dummy-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';

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
    HungarianDatePipe
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gasMeters: GasMeter[] = [];
  recentReadings: MeterReading[] = [];
  loading = true;
  errorMessage: string | null = null;
  
  constructor(
    private dummyDataService: DummyDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  // Betölti a felhasználó adatait és a hozzá tartozó mérőórákat és leolvasásokat
  async loadUserData() {
    try {
      const userId = this.authService.getCurrentUserId();
      
      if (!userId) {
        this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
        this.loading = false;
        return;
      }
      
      console.log('Adatok betöltése a következő felhasználóhoz:', userId);
      
      const [meters, readings] = await Promise.all([
        this.dummyDataService.getGasMeters(userId),
        this.dummyDataService.getMeterReadings(userId)
      ]);
      
      console.log(`Betöltött adatok: ${meters.length} óra, ${readings.length} leolvasás`);
      
      this.gasMeters = meters;
      this.recentReadings = readings.slice(0, 5);
      this.loading = false;
    } catch (error) {
      this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
      this.loading = false;
    }
  }
}