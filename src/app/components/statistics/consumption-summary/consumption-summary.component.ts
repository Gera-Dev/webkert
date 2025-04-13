import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-consumption-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './consumption-summary.component.html',
  styleUrls: ['./consumption-summary.component.css']
})
export class ConsumptionSummaryComponent implements OnChanges {
  // Bemenő adat a szülő komponenstől
  @Input() data: { month: string, consumption: number }[] = [];
  @Input() title: string = 'Fogyasztási adatok';
  
  // Kimenő események a szülő komponens felé
  @Output() exportData = new EventEmitter<string>();
  @Output() detailView = new EventEmitter<string>();
  
  // Származtatott adatok
  totalConsumption: number = 0;
  maxConsumptionMonth: string = '';
  maxConsumption: number = 0;
  minConsumptionMonth: string = '';
  minConsumption: number = 0;
  
  constructor() { }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length > 0) {
      this.calculateSummaryData();
    }
  }
  
  // Összefoglaló adatok számítása
  calculateSummaryData(): void {
    this.totalConsumption = this.data.reduce((sum, item) => sum + item.consumption, 0);
    
    // Legnagyobb fogyasztás keresése
    const maxConsumptionItem = this.data.reduce((max, item) => 
      item.consumption > max.consumption ? item : max, this.data[0]);
    this.maxConsumptionMonth = maxConsumptionItem.month;
    this.maxConsumption = maxConsumptionItem.consumption;
    
    // Legkisebb fogyasztás keresése (csak a nullánál nagyobb értékek)
    const nonZeroConsumption = this.data.filter(item => item.consumption > 0);
    if (nonZeroConsumption.length > 0) {
      const minConsumptionItem = nonZeroConsumption.reduce((min, item) => 
        item.consumption < min.consumption ? item : min, nonZeroConsumption[0]);
      this.minConsumptionMonth = minConsumptionItem.month;
      this.minConsumption = minConsumptionItem.consumption;
    }
  }
  
  // Események továbbítása a szülő komponensnek
  onExportClick(): void {
    this.exportData.emit('csv');
  }
  
  onDetailClick(month: string): void {
    this.detailView.emit(month);
  }
  
  // Trendjelző - növekvő vagy csökkenő trend az utolsó két hónapban
  getTrend(): string {
    if (this.data.length < 2) return 'stable';
    
    const latest = this.data[0].consumption;
    const previous = this.data[1].consumption;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  }
}