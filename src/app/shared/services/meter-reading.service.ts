import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  collectionData
} from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { MeterReading } from '../models/meter-reading.model';
import { AuthService } from './auth.service';
import { GasMeter } from '../models/gas-meter.model';
@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }
  
  getMeterReadings(meterId: string): Observable<MeterReading[]> {
    this.loadingSubject.next(true);
    
    const readingsRef = collection(this.firestore, 'readings');
    const q = query(
      readingsRef, 
      where('meterId', '==', meterId),
      orderBy('readingDate', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(readings => {
        return readings.map(reading => {
          
          if (reading['readingDate']) {
            reading['readingDate'] = new Date(reading['readingDate'].seconds * 1000);
          }
          return reading as MeterReading;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} mérő leolvasásainak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getUserReadings(userId: string): Observable<MeterReading[]> {
    this.loadingSubject.next(true);
    
    const readingsRef = collection(this.firestore, 'readings');
    const q = query(
      readingsRef, 
      where('userId', '==', userId),
      orderBy('readingDate', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(readings => {
        return readings.map(reading => {
          
          if (reading['readingDate']) {
            reading['readingDate'] = new Date(reading['readingDate'].seconds * 1000);
          }
          if (reading['createdAt']) {
            reading['createdAt'] = new Date(reading['createdAt'].seconds * 1000);
          }
          return reading as MeterReading;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${userId} felhasználó leolvasásainak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getMeterReading(readingId: string): Observable<MeterReading | null> {
    this.loadingSubject.next(true);
    const readingRef = doc(this.firestore, `readings/${readingId}`);
    
    return from(getDoc(readingRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) return null;
        
        const data = docSnap.data();
        const reading = {
          id: docSnap.id,
          ...data
        } as MeterReading;
        
        
        if (reading.readingDate) {
          reading.readingDate = new Date((reading.readingDate as any).seconds * 1000);
        }
        
        return reading;
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${readingId} azonosítójú mérőállás lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }
  
  addMeterReading(readingData: Omit<MeterReading, 'id'>): Observable<string> {
    this.loadingSubject.next(true);
    const readingsRef = collection(this.firestore, 'readings');
    
    return from(addDoc(readingsRef, readingData)).pipe(
      map(docRef => docRef.id),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Hiba az új mérőállás létrehozásakor:', err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  updateMeterReading(readingId: string, data: Partial<MeterReading>): Observable<void> {
    this.loadingSubject.next(true);
    const readingRef = doc(this.firestore, `readings/${readingId}`);
    
    return from(updateDoc(readingRef, data)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${readingId} azonosítójú mérőállás frissítésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  deleteMeterReading(readingId: string): Observable<void> {
    this.loadingSubject.next(true);
    const readingRef = doc(this.firestore, `readings/${readingId}`);
    
    return from(deleteDoc(readingRef)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${readingId} azonosítójú mérőállás törlésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  getReadingsByDateRange(meterId: string, startDate: Date, endDate: Date): Observable<MeterReading[]> {
    this.loadingSubject.next(true);
    
    const readingsRef = collection(this.firestore, 'readings');
    const q = query(
      readingsRef,
      where('meterId', '==', meterId),
      where('readingDate', '>=', startDate),
      where('readingDate', '<=', endDate),
      orderBy('readingDate', 'asc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(readings => {
        return readings.map(reading => {
          
          if (reading['readingDate']) {
            reading['readingDate'] = new Date(reading['readingDate'].seconds * 1000);
          }
          return reading as MeterReading;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba az adott időszak mérőállásainak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getHighestConsumptionPeriods(meterId: string, limit: number = 5): Observable<any[]> {
    this.loadingSubject.next(true);
    
    
    return this.getMeterReadings(meterId).pipe(
      map(readings => {
        if (readings.length < 2) return [];
        
        
        const sortedReadings = [...readings].sort((a, b) => 
          b.readingDate.getTime() - a.readingDate.getTime()
        );
        
        
        const consumptionPeriods = [];
        
        for (let i = 0; i < sortedReadings.length - 1; i++) {
          const currentReading = sortedReadings[i];
          const previousReading = sortedReadings[i + 1];
            
          const consumption = currentReading.reading - previousReading.reading;
          const daysDiff = Math.floor(
            (currentReading.readingDate.getTime() - previousReading.readingDate.getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          
          
          if (consumption > 0 && daysDiff > 0) {
            
            const dailyConsumption = consumption / daysDiff;
            
            consumptionPeriods.push({
              startDate: previousReading.readingDate,
              endDate: currentReading.readingDate,
              consumption,
              days: daysDiff,
              dailyConsumption
            });
          }
        }
        
        
        return consumptionPeriods
          .sort((a, b) => b.dailyConsumption - a.dailyConsumption)
          .slice(0, limit);
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a legnagyobb fogyasztású időszakok lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getMonthlyConsumption(meterId: string, year?: number): Observable<any[]> {
    
    const selectedYear = year || new Date().getFullYear();
    const startDate = new Date(selectedYear, 0, 1); 
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59); 
    
    this.loadingSubject.next(true);
    
    return this.getMeterReadings(meterId).pipe(
      map(readings => {
        
        const yearReadings = readings.filter(reading => 
          reading.readingDate >= startDate && reading.readingDate <= endDate
        );
        
        
        const sortedReadings = [...yearReadings].sort((a, b) => 
          a.readingDate.getTime() - b.readingDate.getTime()
        );
        
        
        const months: {[key: string]: any} = {};
        
        
        for (let i = 0; i < 12; i++) {
          const monthName = new Date(selectedYear, i, 1).toLocaleString('hu-HU', { month: 'long' });
          months[monthName] = {
            month: monthName,
            monthIndex: i,
            startReading: null,
            endReading: null,
            consumption: 0,
            hasData: false
          };
        }
        
        
        sortedReadings.forEach(reading => {
          const month = reading.readingDate.getMonth();
          const monthName = new Date(selectedYear, month, 1).toLocaleString('hu-HU', { month: 'long' });
          
          if (!months[monthName].startReading || 
              reading.readingDate < months[monthName].startReading.readingDate) {
            months[monthName].startReading = reading;
          }
          
          if (!months[monthName].endReading || 
              reading.readingDate > months[monthName].endReading.readingDate) {
            months[monthName].endReading = reading;
          }
        });
        
        
        Object.keys(months).forEach(month => {
          const data = months[month];
          if (data.startReading && data.endReading) {
            data.consumption = data.endReading.value - data.startReading.value;
            data.hasData = true;
          }
        });
        
        
        return Object.values(months)
          .sort((a, b) => a.monthIndex - b.monthIndex)
          .map(data => ({
            month: data.month,
            consumption: data.hasData ? data.consumption : null,
            startValue: data.startReading?.value || null,
            endValue: data.endReading?.value || null,
            hasData: data.hasData
          }));
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a havi fogyasztás lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
}
