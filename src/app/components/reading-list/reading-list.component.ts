import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DummyDataService } from '../../shared/services/dummy-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    HungarianDatePipe
  ],
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.css']
})
export class ReadingListComponent implements OnInit {
  readings: MeterReading[] = [];
  gasMeters: Map<string, GasMeter> = new Map();
  loading = true;
  errorMessage: string | null = null;

  // Tábla oszlopok
  displayedColumns: string[] = ['readingDate', 'meterInfo', 'reading', 'consumption', 'status', 'actions'];

  constructor(
    private dummyDataService: DummyDataService, 
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  // Betölti a felhasználó összes leolvasását és mérőóráját
  async loadData(): Promise<void> {
    try {
      const userId = this.authService.getCurrentUserId();
      
      if (!userId) {
        this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
        this.loading = false;
        return;
      }
      
      console.log('Adatok betöltése a következő felhasználóhoz:', userId);
      
      // Párhuzamosan lekérjük a mérőórákat és a leolvasásokat
      const [meters, readings] = await Promise.all([
        this.dummyDataService.getGasMeters(userId),
        this.dummyDataService.getMeterReadings(userId)
      ]);
      
      meters.forEach(meter => {
        this.gasMeters.set(meter.id, meter);
      });

      this.readings = readings;
      
      console.log(`Betöltött adatok: ${meters.length} óra, ${readings.length} leolvasás`);
      this.loading = false;
    } catch (error) {
      console.error('Hiba történt az adatok betöltésekor:', error);
      this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
      this.loading = false;
    }
  }

  // Visszaadja a mérő címét az id alapján
  getMeterAddress(meterId: string): string {
    const meter = this.gasMeters.get(meterId);
    return meter ? meter.address : 'Ismeretlen cím';
  }

  // Visszaadja a mérő sorozatszámát az id alapján
  getMeterSerialNumber(meterId: string): string {
    const meter = this.gasMeters.get(meterId);
    return meter ? meter.serialNumber : 'Ismeretlen széria szám';
  }

  // Átalakítja az angol státusz szöveget magyarra
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Függőben';
      case 'verified': return 'Elfogadva';
      case 'rejected': return 'Elutasítva';
      default: return 'Ismeretlen';
    }
  }

  // Visszaadja a státuszhoz tartozó CSS osztályt
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'verified': return 'status-verified';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }
}