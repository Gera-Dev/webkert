import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MeterReadingService } from '../../shared/services/meter-reading.service';
import { GasMeterService } from '../../shared/services/gas-meter.service';
import { AuthService } from '../../shared/services/auth.service';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { HungarianDatePipe } from '../../shared/pipes/hungarian-date.pipe';
import { Subscription } from 'rxjs';
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
export class ReadingListComponent implements OnInit, OnDestroy {
  readings: MeterReading[] = [];
  gasMeters: Map<string, GasMeter> = new Map();
  loading = true;
  errorMessage: string | null = null;
  
  displayedColumns: string[] = ['readingDate', 'meterInfo', 'reading', 'consumption', 'status', 'actions'];
  private metersSubscription?: Subscription;
  private readingsSubscription?: Subscription;
  constructor(
    private gasMeterService: GasMeterService, 
    private meterReadingService: MeterReadingService,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
    this.loadData();
  }
  ngOnDestroy(): void {
    
    if (this.metersSubscription) {
      this.metersSubscription.unsubscribe();
    }
    if (this.readingsSubscription) {
      this.readingsSubscription.unsubscribe();
    }
  }
  
  loadData(): void {
    const userId = this.authService.getCurrentUserId();
      
    if (!userId) {
      this.errorMessage = 'Nem vagy bejelentkezve. Kérlek jelentkezz be az adatok megtekintéséhez.';
      this.loading = false;
      return;
    }
      
    console.log('Adatok betöltése a következő felhasználóhoz:', userId);
      
    
    this.metersSubscription = this.gasMeterService.getGasMeters().subscribe({
      next: (meters) => {
        meters.forEach(meter => {
          this.gasMeters.set(meter.id, meter);
        });
        
        
        this.loadAllReadings(userId);
      },
      error: (err) => {
        console.error('Hiba a gázórák betöltésekor:', err);
        this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
        this.loading = false;
      }
    });
  }
  
  loadAllReadings(userId: string): void {
    this.readingsSubscription = this.meterReadingService.getUserReadings(userId).subscribe({
      next: (readings) => {
        this.readings = readings;
        console.log(`Betöltött adatok: ${this.gasMeters.size} óra, ${readings.length} leolvasás`);
        this.loading = false;
      },
      error: (err) => {
        console.error('Hiba a leolvasások betöltésekor:', err);
        this.errorMessage = 'Hiba történt a leolvasások betöltése során. Kérjük, próbáld újra később.';
        this.loading = false;
      }
    });
  }
  
  getMeterAddress(meterId: string): string {
    const meter = this.gasMeters.get(meterId);
    return meter ? meter.address : 'Ismeretlen cím';
  }
  
  getMeterSerialNumber(meterId: string): string {
    const meter = this.gasMeters.get(meterId);
    return meter ? meter.serialNumber : 'Ismeretlen széria szám';
  }
  
  getStatusText(status: 'pending' | 'verified' | 'rejected' | string): string {
    switch (status) {
      case 'pending': return 'Függőben';
      case 'verified': return 'Elfogadva';
      case 'rejected': return 'Elutasítva';
      default: return 'Ismeretlen';
    }
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'verified': return 'status-verified';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }
}
