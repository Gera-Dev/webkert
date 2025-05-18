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
  collectionData
} from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Billing } from '../models/billing.model';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }
  
  getBillings(meterId: string): Observable<Billing[]> {
    this.loadingSubject.next(true);
    
    const billingsRef = collection(this.firestore, 'billings');
    const q = query(
      billingsRef, 
      where('meterId', '==', meterId),
      orderBy('dueDate', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(billings => {
        return billings.map(bill => {
          
          if (bill['dueDate']) {
            bill['dueDate'] = new Date(bill['dueDate'].seconds * 1000);
          }
          if (bill['startDate']) {
            bill['startDate'] = new Date(bill['startDate'].seconds * 1000);
          }
          if (bill['endDate']) {
            bill['endDate'] = new Date(bill['endDate'].seconds * 1000);
          }
          if (bill['paymentDate']) {
            bill['paymentDate'] = new Date(bill['paymentDate'].seconds * 1000);
          }
          
          return bill as Billing;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${meterId} mérő számláinak lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getBilling(billingId: string): Observable<Billing | null> {
    this.loadingSubject.next(true);
    const billingRef = doc(this.firestore, `billings/${billingId}`);
    
    return from(getDoc(billingRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) return null;
        
        const data = docSnap.data();
        const billing = {
          id: docSnap.id,
          ...data
        } as Billing;
        
        
        if (billing.dueDate) {
          billing.dueDate = new Date((billing.dueDate as any).seconds * 1000);
        }
        if (billing.startDate) {
          billing.startDate = new Date((billing.startDate as any).seconds * 1000);
        }
        if (billing.endDate) {
          billing.endDate = new Date((billing.endDate as any).seconds * 1000);
        }
        if (billing.paymentDate) {
          billing.paymentDate = new Date((billing.paymentDate as any).seconds * 1000);
        }
        
        return billing;
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${billingId} azonosítójú számla lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }
  
  addBilling(billingData: Omit<Billing, 'id'>): Observable<string> {
    this.loadingSubject.next(true);
    const billingsRef = collection(this.firestore, 'billings');
    
    return from(addDoc(billingsRef, billingData)).pipe(
      map(docRef => docRef.id),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Hiba az új számla létrehozásakor:', err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  updateBilling(billingId: string, data: Partial<Billing>): Observable<void> {
    this.loadingSubject.next(true);
    const billingRef = doc(this.firestore, `billings/${billingId}`);
    
    return from(updateDoc(billingRef, data)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${billingId} azonosítójú számla frissítésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  deleteBilling(billingId: string): Observable<void> {
    this.loadingSubject.next(true);
    const billingRef = doc(this.firestore, `billings/${billingId}`);
    
    return from(deleteDoc(billingRef)).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a ${billingId} azonosítójú számla törlésekor:`, err);
        this.loadingSubject.next(false);
        throw err;
      })
    );
  }
  
  getUnpaidBillings(userId: string): Observable<Billing[]> {
    this.loadingSubject.next(true);
    const currentDate = new Date();
    
    const billingsRef = collection(this.firestore, 'billings');
    const q = query(
      billingsRef,
      where('userId', '==', userId),
      where('isPaid', '==', false),
      where('dueDate', '<', currentDate),
      orderBy('dueDate', 'asc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(billings => {
        return billings.map(bill => {
          
          if (bill['dueDate']) {
            bill['dueDate'] = new Date(bill['dueDate'].seconds * 1000);
          }
          if (bill['startDate']) {
            bill['startDate'] = new Date(bill['startDate'].seconds * 1000);
          }
          if (bill['endDate']) {
            bill['endDate'] = new Date(bill['endDate'].seconds * 1000);
          }
          if (bill['paymentDate']) {
            bill['paymentDate'] = new Date(bill['paymentDate'].seconds * 1000);
          }
          
          return bill as Billing;
        });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a rendezetlen számlák lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
  
  getBillingSummaryByYear(userId: string): Observable<any[]> {
    this.loadingSubject.next(true);
    
    const billingsRef = collection(this.firestore, 'billings');
    const q = query(
      billingsRef,
      where('userId', '==', userId),
      orderBy('endDate', 'asc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(billings => {
        
        const processedBillings = billings.map(bill => {
          const processedBill = { ...bill } as any;
          
          if (processedBill.dueDate) {
            processedBill.dueDate = new Date(processedBill.dueDate.seconds * 1000);
          }
          if (processedBill.startDate) {
            processedBill.startDate = new Date(processedBill.startDate.seconds * 1000);
          }
          if (processedBill.endDate) {
            processedBill.endDate = new Date(processedBill.endDate.seconds * 1000);
          }
          if (processedBill.paymentDate) {
            processedBill.paymentDate = new Date(processedBill.paymentDate.seconds * 1000);
          }
          
          return processedBill as Billing;
        });
        
        
        const summaryMap: {[key: string]: any} = {};
        
        processedBillings.forEach(bill => {
          
          if (!bill.endDate) return;
          
          const year = bill.endDate.getFullYear();
          const meterId = bill.meterId;
          const key = `${year}_${meterId}`;
          
          if (!summaryMap[key]) {
            summaryMap[key] = {
              year,
              meterId,
              totalAmount: 0,
              totalConsumption: 0,
              billCount: 0,
              avgPricePerUnit: 0
            };
          }
          
          summaryMap[key].totalAmount += bill.amount;
          summaryMap[key].totalConsumption += bill.consumption || 0;
          summaryMap[key].billCount += 1;
        });
        
        
        Object.values(summaryMap).forEach(summary => {
          if (summary.totalConsumption > 0) {
            summary.avgPricePerUnit = summary.totalAmount / summary.totalConsumption;
          }
        });
        
        
        return Object.values(summaryMap)
          .sort((a: any, b: any) => {
            if (a.year !== b.year) {
              return a.year - b.year;
            }
            return a.meterId.localeCompare(b.meterId);
          });
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error(`Hiba a számlák éves összesítésének lekérésekor:`, err);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }
}
