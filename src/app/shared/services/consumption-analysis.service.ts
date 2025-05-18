import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MeterReadingService } from './meter-reading.service';
import { AuthService } from './auth.service';
export interface ConsumptionTrend {
  period: 'weekly' | 'monthly' | 'yearly';
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  previousTotal: number;
  currentTotal: number;
}
@Injectable({
  providedIn: 'root'
})
export class ConsumptionAnalysisService {
  constructor(
    private readingService: MeterReadingService,
    private authService: AuthService
  ) { }
  /**
   * A felhasználó összes mérőórájának fogyasztási trendelemzése
   * 
   * @param period Időszak: heti, havi vagy éves
   * @returns Trend információk
   */
  getConsumptionTrend(period: 'weekly' | 'monthly' | 'yearly'): Observable<ConsumptionTrend> {
    const userId = this.authService.getCurrentUserId();    if (!userId) {
      return of({
        period,
        trend: 'stable' as const,
        percentage: 0,
        previousTotal: 0,
        currentTotal: 0
      });
    }
    
    return this.readingService.getUserReadings(userId).pipe(
      map(readings => {
        
        const sortedReadings = [...readings].sort((a, b) => 
          new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
        );
        
        if (sortedReadings.length < 2) {          return {
            period,
            trend: 'stable' as const,
            percentage: 0,
            previousTotal: 0,
            currentTotal: 0
          };
        }
        
        
        let dateThreshold: Date;
        const now = new Date();
        switch (period) {
          case 'weekly':
            dateThreshold = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'monthly':
            dateThreshold = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'yearly':
            dateThreshold = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        
        
        const currentPeriodReadings = sortedReadings.filter(r => 
          new Date(r.readingDate) >= dateThreshold
        );
        
        const previousPeriodReadings = sortedReadings.filter(r => 
          new Date(r.readingDate) < dateThreshold
        );
        
        
        const currentTotal = currentPeriodReadings.reduce(
          (sum, reading) => sum + (reading.consumption || 0), 0
        );
        
        const previousTotal = previousPeriodReadings.reduce(
          (sum, reading) => sum + (reading.consumption || 0), 0
        );
        
        
        let percentage = 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (previousTotal > 0) {
          percentage = ((currentTotal - previousTotal) / previousTotal) * 100;
          trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';
        }
        
        return {
          period,
          trend,
          percentage: Math.abs(percentage),
          previousTotal,
          currentTotal
        };
      }),
      catchError(error => {
        console.error('Hiba a fogyasztási trend elemzésekor:', error);        return of({
          period,
          trend: 'stable' as const,
          percentage: 0,
          previousTotal: 0,
          currentTotal: 0
        });
      })
    );
  }
  
  /**
   * Több időszakra vonatkozó trend elemzés
   * 
   * @returns Összes időszak trend elemzése
   */
  getAllTrends(): Observable<ConsumptionTrend[]> {
    return combineLatest([
      this.getConsumptionTrend('weekly'),
      this.getConsumptionTrend('monthly'),
      this.getConsumptionTrend('yearly')
    ]);
  }
}
