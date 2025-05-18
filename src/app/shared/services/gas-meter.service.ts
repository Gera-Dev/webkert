import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  collectionData,
  docData
} from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject, of, catchError, switchMap, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GasMeter } from '../models/gas-meter.model';
import { GasMeterStatistics, MeterStatisticsSummary } from '../models/gas-meter-statistics.model';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class GasMeterService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }
  getGasMeters(): Observable<GasMeter[]> {
    this.loadingSubject.next(true);
    
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.loadingSubject.next(false);
      return of([]);
    }
    
    const metersRef = collection(this.firestore, 'meters');
    const q = query(metersRef, where('userId', '==', userId), orderBy('address', 'asc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(meters => {
        return meters.map(meter => {
          const result = { ...meter } as GasMeter;
          
          if (result.installationDate && typeof result.installationDate === 'object' && 'seconds' in result.installationDate) {
            result.installationDate = new Date((result.installationDate as any).seconds * 1000);
          }
          if (result.lastReadingDate && typeof result.lastReadingDate === 'object' && 'seconds' in result.lastReadingDate) {
            result.lastReadingDate = new Date((result.lastReadingDate as any).seconds * 1000);
          }
          return result;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Hiba a gázmérők lekérésekor:', err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getGasMeter(meterId: string): Observable<GasMeter | null> {
    this.loadingSubject.next(true);
    const meterRef = doc(this.firestore, `meters/${meterId}`);
    
    return docData(meterRef, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        
        const result = { ...data } as GasMeter;
        
        if (result.installationDate && typeof result.installationDate === 'object' && 'seconds' in result.installationDate) {
          result.installationDate = new Date((result.installationDate as any).seconds * 1000);
        }
        if (result.lastReadingDate && typeof result.lastReadingDate === 'object' && 'seconds' in result.lastReadingDate) {
          result.lastReadingDate = new Date((result.lastReadingDate as any).seconds * 1000);
        }
        
        return result;
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} azonosítójú gázmérő lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }
  
  addGasMeter(meterData: Omit<GasMeter, 'id'>): Observable<string> {
    this.loadingSubject.next(true);
    const metersRef = collection(this.firestore, 'meters');
    
    return from(addDoc(metersRef, meterData)).pipe(
      map(docRef => docRef.id),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Hiba az új gázmérő létrehozásakor:', err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  updateGasMeter(meterId: string, data: Partial<GasMeter>): Observable<void> {
    this.loadingSubject.next(true);
    const meterRef = doc(this.firestore, `meters/${meterId}`);
    
    return from(updateDoc(meterRef, data)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} azonosítójú gázmérő frissítésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  deleteGasMeter(meterId: string): Observable<void> {
    this.loadingSubject.next(true);
    const meterRef = doc(this.firestore, `meters/${meterId}`);
    
    return from(deleteDoc(meterRef)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} azonosítójú gázmérő törlésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  getActiveMeters(limitCount: number = 10, startAfterDoc?: DocumentData): Observable<GasMeter[]> {
    this.loadingSubject.next(true);
    
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.loadingSubject.next(false);
      return of([]);
    }
    
    const metersRef = collection(this.firestore, 'meters');
    const queryConstraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('active', '==', true),
      orderBy('address', 'asc'),
      limit(limitCount)
    ];
    
    
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    const q = query(metersRef, ...queryConstraints);
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(meters => {
        return meters.map(meter => {
          const result = { ...meter } as GasMeter;
          
          if (result.installationDate && typeof result.installationDate === 'object' && 'seconds' in result.installationDate) {
            result.installationDate = new Date((result.installationDate as any).seconds * 1000);
          }
          if (result.lastReadingDate && typeof result.lastReadingDate === 'object' && 'seconds' in result.lastReadingDate) {
            result.lastReadingDate = new Date((result.lastReadingDate as any).seconds * 1000);
          }
          return result;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Hiba az aktív gázmérők lekérésekor:', err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getMeterCountByUser(userId: string): Observable<number> {
    this.loadingSubject.next(true);
    const metersRef = collection(this.firestore, 'meters');
    const q = query(metersRef, where('userId', '==', userId));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.size),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${userId} felhasználó gázmérőinek számoláskor:`, err);
        this.loadingSubject.next(false);
        return of(0);
      })
    );
  }
  
  getMeterStatisticsSummary(userId: string): Observable<MeterStatisticsSummary> {
    this.loadingSubject.next(true);
    
    return this.getGasMetersByUserId(userId).pipe(
      switchMap(meters => {
        if (meters.length === 0) {
          return of({
            totalMeters: 0,
            activeMeters: 0,
            inactiveMeters: 0,
            totalConsumption: 0,
            averageConsumptionPerMeter: 0
          });
        }
        
        
        const activeMeters = meters.filter(m => m.active).length;
        const inactiveMeters = meters.length - activeMeters;
        
        
        const meterIds = meters.map(meter => meter.id);
        
        
        return combineLatest(
          meterIds.map(meterId => this.getMeterConsumptionHistory(meterId))
        ).pipe(
          map(consumptionHistories => {
            
            let totalConsumption = 0;
            let mostActiveMeterId: string | undefined;
            let mostActiveConsumption = 0;
            
            consumptionHistories.forEach((history, index) => {
              const meterTotalConsumption = history.reduce((sum, item) => sum + item.consumption, 0);
              totalConsumption += meterTotalConsumption;
              
              
              if (meterTotalConsumption > mostActiveConsumption) {
                mostActiveConsumption = meterTotalConsumption;
                mostActiveMeterId = meterIds[index];
              }
            });
            
            
            const averageConsumptionPerMeter = meters.length > 0 
              ? totalConsumption / meters.length 
              : 0;
            
            
            const mostActiveMeter = meters.find(meter => meter.id === mostActiveMeterId);
            
            return {
              totalMeters: meters.length,
              activeMeters,
              inactiveMeters,
              totalConsumption,
              averageConsumptionPerMeter,
              mostActiveMeterId,
              mostActiveMeterAddress: mostActiveMeter?.address
            };
          })
        );
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${userId} felhasználó mérő statisztikáinak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of({
          totalMeters: 0,
          activeMeters: 0,
          inactiveMeters: 0,
          totalConsumption: 0,
          averageConsumptionPerMeter: 0
        });
      })
    );
  }
  getMeterStatistics(meterId: string): Observable<GasMeterStatistics | null> {
    this.loadingSubject.next(true);
    return this.getGasMeter(meterId).pipe(
      switchMap(meter => {
        if (!meter) {
          return of(null);
        }
        return this.getMeterConsumptionHistory(meterId).pipe(
          map(consumptionHistory => {
            if (consumptionHistory.length === 0) {
              return {                meterId,
                meterAddress: meter.address,
                meterSerialNumber: meter.serialNumber,
                totalReadings: 0,
                totalConsumption: 0,
                consumptionByMonth: [],
                readingTrend: 'stable' as 'up' | 'down' | 'stable'
              };
            }
            
            const totalConsumption = consumptionHistory.reduce((sum, item) => sum + item.consumption, 0);
            const consumptions = consumptionHistory.map(item => item.consumption).filter(c => c > 0);
            
            
            const averageConsumption = consumptions.length > 0 
              ? totalConsumption / consumptions.length 
              : 0;
            
            const maxConsumption = consumptions.length > 0 
              ? Math.max(...consumptions) 
              : 0;
              
            const minConsumption = consumptions.length > 0 
              ? Math.min(...consumptions) 
              : 0;
            
            
            const consumptionByMonth = this.groupConsumptionByMonth(consumptionHistory);
            
            
            let readingTrend: 'up' | 'down' | 'stable' = 'stable';
            
            if (consumptionHistory.length >= 2) {
              const latestConsumption = consumptionHistory[0].consumption;
              const previousConsumption = consumptionHistory[1].consumption;
              
              if (latestConsumption > previousConsumption) {
                readingTrend = 'up';
              } else if (latestConsumption < previousConsumption) {
                readingTrend = 'down';
              }
            }
            
            
            let estimatedNextReading: number | undefined;
            let estimatedMonthlyConsumption: number | undefined;
            
            if (consumptionHistory.length >= 2 && meter.lastReading !== undefined) {
              
              const avgLastConsumptions = consumptionHistory.slice(0, 3)
                .reduce((sum, item) => sum + item.consumption, 0) / Math.min(3, consumptionHistory.length);
              
              estimatedMonthlyConsumption = avgLastConsumptions;
              estimatedNextReading = meter.lastReading + avgLastConsumptions;
            }
            
            return {
              meterId,
              meterAddress: meter.address,
              meterSerialNumber: meter.serialNumber,
              totalReadings: consumptionHistory.length,
              averageConsumption,
              maxConsumption,
              minConsumption,
              lastReadingDate: meter.lastReadingDate,
              totalConsumption,
              consumptionByMonth,
              readingTrend,
              estimatedNextReading,
              estimatedMonthlyConsumption
            } as GasMeterStatistics;
          })
        );
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} gázmérő statisztikáinak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }
  
  getMeterConsumptionHistory(meterId: string): Observable<{ date: Date, reading: number, consumption: number }[]> {
    const readingsRef = collection(this.firestore, 'readings');
    const q = query(
      readingsRef,
      where('meterId', '==', meterId),
      orderBy('readingDate', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(readings => {
        const history = readings.map(reading => {
          let readingDate = new Date();
          
          if (reading['readingDate']) {
            if (typeof reading['readingDate'] === 'object' && 'seconds' in reading['readingDate']) {
              readingDate = new Date(reading['readingDate'].seconds * 1000);
            } else {
              readingDate = new Date(reading['readingDate']);
            }
          }
          
          return {
            date: readingDate,
            reading: reading['reading'] || 0,
            consumption: reading['consumption'] || 0
          };
        });
        
        return history;
      })
    );
  }
  
  
  private getGasMetersByUserId(userId: string): Observable<GasMeter[]> {
    const metersRef = collection(this.firestore, 'meters');
    const q = query(metersRef, where('userId', '==', userId));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(meters => {
        return meters.map(meter => {
          const result = { ...meter } as GasMeter;
          
          if (result.installationDate && typeof result.installationDate === 'object' && 'seconds' in result.installationDate) {
            result.installationDate = new Date((result.installationDate as any).seconds * 1000);
          }
          if (result.lastReadingDate && typeof result.lastReadingDate === 'object' && 'seconds' in result.lastReadingDate) {
            result.lastReadingDate = new Date((result.lastReadingDate as any).seconds * 1000);
          }
          return result;
        });
      }),
      catchError(err => {
        console.error(`Hiba a ${userId} felhasználó gázmérőinek lekérésekor:`, err);
        return of([]);
      })
    );
  }
  
  
  private groupConsumptionByMonth(consumptionHistory: { date: Date, reading: number, consumption: number }[]) {
    const months: { [key: string]: number } = {};
    
    consumptionHistory.forEach(item => {
      const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = 0;
      }
      months[monthKey] += item.consumption;
    });
    
    
    return Object.entries(months).map(([month, consumption]) => ({
      month,
      consumption
    })).sort((a, b) => b.month.localeCompare(a.month)); 
  }
}
