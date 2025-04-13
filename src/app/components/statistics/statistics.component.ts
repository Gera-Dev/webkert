import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { DummyDataService } from '../../shared/services/dummy-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { GasMeter } from '../../shared/models/gas-meter.model';
import { ConsumptionSummaryComponent } from './consumption-summary/consumption-summary.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    ConsumptionSummaryComponent
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  filterForm!: FormGroup;
  loading = true;
  gasMeters: GasMeter[] = [];
  meterReadings: MeterReading[] = [];
  selectedMeterReadings: MeterReading[] = [];
  monthlySummary: { month: string, consumption: number }[] = [];
  errorMessage: string | null = null;

  constructor(
    private dummyDataService: DummyDataService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadData();

    this.filterForm.get('meterId')?.valueChanges.subscribe(meterId => {
      this.filterReadings(meterId);
    });
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      meterId: ['']
    });
  }

  async loadData(): Promise<void> {
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
      
      this.gasMeters = meters;
      this.meterReadings = readings;
      
      this.selectedMeterReadings = [...this.meterReadings];
      this.calculateMonthlySummary(this.selectedMeterReadings);
      
      console.log(`Betöltött adatok: ${meters.length} óra, ${readings.length} leolvasás`);
      this.loading = false;
    } catch (error) {
      console.error('Hiba az adatok betöltésekor:', error);
      this.errorMessage = 'Hiba történt az adatok betöltése során. Kérjük, próbáld újra később.';
      this.loading = false;
    }
  }

  filterReadings(meterId: string): void {
    if (!meterId) {
      this.selectedMeterReadings = [...this.meterReadings];
    } else {
      this.selectedMeterReadings = this.meterReadings.filter(reading => reading.meterId === meterId);
    }
    
    this.calculateMonthlySummary(this.selectedMeterReadings);
  }

  calculateMonthlySummary(readings: MeterReading[]): void {
    const sortedReadings = [...readings].sort((a, b) => {
      return new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime();
    });
    
    const monthlySummary = new Map<string, number>();
    
    sortedReadings.forEach(reading => {
      if (reading.consumption) {
        const date = new Date(reading.readingDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthLabel = this.getMonthLabel(date.getMonth(), date.getFullYear());
        
        const currentConsumption = monthlySummary.get(monthLabel) || 0;
        monthlySummary.set(monthLabel, currentConsumption + reading.consumption);
      }
    });
    
    this.monthlySummary = Array.from(monthlySummary.entries())
      .map(([month, consumption]) => ({ month, consumption }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  getMonthLabel(month: number, year: number): string {
    const months = [
      'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
      'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];
    return `${months[month]} ${year}`;
  }

  getTotalConsumption(): number {
    return this.selectedMeterReadings
      .filter(reading => reading.consumption !== undefined)
      .reduce((sum, reading) => sum + (reading.consumption || 0), 0);
  }

  getAverageConsumption(): number {
    const readings = this.selectedMeterReadings.filter(reading => reading.consumption !== undefined);
    if (readings.length === 0) return 0;
    
    const totalConsumption = readings.reduce((sum, reading) => sum + (reading.consumption || 0), 0);
    return totalConsumption / readings.length;
  }

  onExportData(format: string): void {
    this.snackBar.open(
      `Az adatok exportálása ${format} formátumban elkezdődött...`, 
      'Bezárás', 
      { duration: 3000 }
    );

    try {
      const exportData = this.prepareExportData();
      this.exportAsCSV(exportData);
    } catch (error) {
      console.error('Hiba az exportálás során:', error);
      this.snackBar.open(
        'Hiba történt az adatok exportálása közben!', 
        'Bezárás', 
        { duration: 3000, panelClass: 'error-snackbar' }
      );
    }
  }

  private prepareExportData(): any[] {
    return this.selectedMeterReadings.map(reading => {
      const meter = this.gasMeters.find(m => m.id === reading.meterId);
      return {
        id: reading.id,
        readingDate: new Date(reading.readingDate).toLocaleDateString('hu-HU'),
        reading: reading.reading,
        consumption: reading.consumption || 0,
        meterAddress: meter?.address || 'Ismeretlen cím',
        meterSerialNumber: meter?.serialNumber || 'Ismeretlen sorozatszám',
        notes: reading.notes || ''
      };
    });
  }

  private exportAsCSV(data: any[]): void {
    if (data.length === 0) {
      this.snackBar.open('Nincs exportálható adat!', 'Bezárás', { duration: 3000 });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(';') + '\n';
    
    const csvRows = data.map(item => {
      return headers.map(header => {
        const value = item[header] || '';
        return typeof value === 'string' && (value.includes(',') || value.includes(';')) 
          ? `"${value}"` 
          : value;
      }).join(';');
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    this.downloadFile(csvContent, 'gazora_leolvasasok.csv', 'text/csv;charset=utf-8;');
    
    this.snackBar.open(
      'CSV exportálás sikeres!', 
      'Bezárás', 
      { duration: 3000, panelClass: 'success-snackbar' }
    );
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }

  onDetailView(month: string): void {
    const [monthName, yearStr] = month.split(' ');
    const year = parseInt(yearStr);

    const months = [
      'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
      'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];
    const monthIndex = months.findIndex(m => m === monthName);
    
    if (monthIndex === -1) {
      console.error('Érvénytelen hónap:', month);
      this.snackBar.open(
        'Érvénytelen dátum formátum!', 
        'Bezárás', 
        { duration: 3000, panelClass: 'error-snackbar' }
      );
      return;
    }
    
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    
    const monthlyReadings = this.selectedMeterReadings.filter(reading => {
      const readingDate = new Date(reading.readingDate);
      return readingDate >= startDate && readingDate <= endDate;
    });
    
    if (monthlyReadings.length === 0) {
      this.snackBar.open(
        `Nincs leolvasási adat a(z) ${month} időszakra.`, 
        'Bezárás', 
        { duration: 3000 }
      );
      return;
    }
    
    const totalConsumption = monthlyReadings.reduce(
      (sum, reading) => sum + (reading.consumption || 0), 
      0
    );
    
    const meterId = this.filterForm.get('meterId')?.value;
    const meterInfo = meterId ? 
      this.gasMeters.find(m => m.id === meterId)?.address : 
      'Összes mérőóra';
    
    this.snackBar.open(
      `${month} időszak adatai: ${monthlyReadings.length} leolvasás, összesen ${totalConsumption} m³ fogyasztás. (${meterInfo})`, 
      'Bezárás', 
      { duration: 5000 }
    );
    
    console.log('Részletes adatok a következő hónapra:', month, monthlyReadings);
  }
}