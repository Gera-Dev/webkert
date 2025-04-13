import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { MeterReading } from '../models/meter-reading.model';
import { GasMeter } from '../models/gas-meter.model';
import { Billing } from '../models/billing.model';
import { lastValueFrom } from 'rxjs';

interface DummyData {
  users: any[];
  gasMeters: any[];
  meterReadings: any[];
  billings: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DummyDataService {
  // Adatok tárolója
  private users: User[] = [];
  private gasMeters: GasMeter[] = [];
  private meterReadings: MeterReading[] = [];
  private billings: Billing[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) {
    this.loadData();
  }

  // Adatok betöltése a JSON fájlból
  private async loadData() {
    try {
      const data = await lastValueFrom(this.http.get<DummyData>('/assets/dummy-data.json'));
      
      // Dátumok konvertálása string-ből Date objektummá
      this.users = data.users.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: new Date(user.lastLogin)
      }));
      
      this.gasMeters = data.gasMeters.map(meter => ({
        ...meter,
        installationDate: new Date(meter.installationDate),
        lastReadingDate: new Date(meter.lastReadingDate)
      }));
      
      this.meterReadings = data.meterReadings.map(reading => ({
        ...reading,
        readingDate: new Date(reading.readingDate),
        createdAt: new Date(reading.createdAt)
      }));
      
      this.billings = data.billings.map(billing => ({
        ...billing,
        billingPeriodStart: new Date(billing.billingPeriodStart),
        billingPeriodEnd: new Date(billing.billingPeriodEnd),
        dueDate: new Date(billing.dueDate),
        paymentDate: billing.paymentDate ? new Date(billing.paymentDate) : undefined,
        createdAt: new Date(billing.createdAt)
      }));
      
      this.dataLoaded = true;
      console.log('Dummy adatok betöltve', {
        users: this.users.length,
        gasMeters: this.gasMeters.length, 
        meterReadings: this.meterReadings.length,
        billings: this.billings.length
      });
    } catch (error) {
      console.error('Hiba a dummy adatok betöltése során:', error);
    }
  }

  // Segédmetódus az adatok betöltésének biztosítására
  private async ensureDataLoaded(): Promise<void> {
    if (!this.dataLoaded) {
      await this.loadData();
    }
  }

  // Felhasználó műveletek
  async getUserById(id: string): Promise<User | null> {
    await this.ensureDataLoaded();
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureDataLoaded();
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async createUser(user: User): Promise<{ id: string }> {
    await this.ensureDataLoaded();
    const newId = `user${this.users.length + 1}`;
    const newUser = { ...user, id: newId };
    this.users.push(newUser);
    return { id: newId };
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data };
    }
    return Promise.resolve();
  }

  // Gázóra műveletek
  async getGasMeters(userId: string): Promise<GasMeter[]> {
    await this.ensureDataLoaded();
    return this.gasMeters.filter(m => m.userId === userId);
  }

  async getGasMeterById(id: string): Promise<GasMeter | null> {
    await this.ensureDataLoaded();
    const meter = this.gasMeters.find(m => m.id === id);
    return meter || null;
  }

  async createGasMeter(gasMeter: GasMeter): Promise<{ id: string }> {
    await this.ensureDataLoaded();
    const newId = `meter${this.gasMeters.length + 1}`;
    const newMeter = { ...gasMeter, id: newId };
    this.gasMeters.push(newMeter);
    return { id: newId };
  }

  async updateGasMeter(id: string, data: Partial<GasMeter>): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.gasMeters.findIndex(m => m.id === id);
    if (index !== -1) {
      this.gasMeters[index] = { ...this.gasMeters[index], ...data };
    }
    return Promise.resolve();
  }

  async deleteGasMeter(id: string): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.gasMeters.findIndex(m => m.id === id);
    if (index !== -1) {
      this.gasMeters.splice(index, 1);
    }
    return Promise.resolve();
  }

  // Mérőállások műveletek
  async getMeterReadings(userId: string): Promise<MeterReading[]> {
    await this.ensureDataLoaded();
    return this.meterReadings
      .filter(r => r.userId === userId)
      .sort((a, b) => b.readingDate.getTime() - a.readingDate.getTime());
  }

  async getMeterReadingsByMeter(meterId: string): Promise<MeterReading[]> {
    await this.ensureDataLoaded();
    return this.meterReadings
      .filter(r => r.meterId === meterId)
      .sort((a, b) => b.readingDate.getTime() - a.readingDate.getTime());
  }

  async getMeterReadingById(id: string): Promise<MeterReading | null> {
    await this.ensureDataLoaded();
    const reading = this.meterReadings.find(r => r.id === id);
    return reading || null;
  }

  async createMeterReading(meterReading: MeterReading): Promise<{ id: string }> {
    await this.ensureDataLoaded();
    const newId = `reading${this.meterReadings.length + 1}`;
    const newReading = { ...meterReading, id: newId };
    this.meterReadings.push(newReading);
    
    // Frissítsük a gázóra utolsó leolvasási adatait
    const meterIndex = this.gasMeters.findIndex(m => m.id === meterReading.meterId);
    if (meterIndex !== -1) {
      this.gasMeters[meterIndex].lastReading = meterReading.reading;
      this.gasMeters[meterIndex].lastReadingDate = meterReading.readingDate;
    }
    
    return { id: newId };
  }

  async updateMeterReading(id: string, data: Partial<MeterReading>): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.meterReadings.findIndex(r => r.id === id);
    if (index !== -1) {
      this.meterReadings[index] = { ...this.meterReadings[index], ...data };
    }
    return Promise.resolve();
  }

  async deleteMeterReading(id: string): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.meterReadings.findIndex(r => r.id === id);
    if (index !== -1) {
      this.meterReadings.splice(index, 1);
    }
    return Promise.resolve();
  }

  // Számlázási műveletek
  async getBillings(userId: string): Promise<Billing[]> {
    await this.ensureDataLoaded();
    return this.billings
      .filter(b => b.userId === userId)
      .sort((a, b) => b.billingPeriodEnd.getTime() - a.billingPeriodEnd.getTime());
  }

  async getBillingById(id: string): Promise<Billing | null> {
    await this.ensureDataLoaded();
    const billing = this.billings.find(b => b.id === id);
    return billing || null;
  }

  async createBilling(billing: Billing): Promise<{ id: string }> {
    await this.ensureDataLoaded();
    const newId = `billing${this.billings.length + 1}`;
    const newBilling = { ...billing, id: newId };
    this.billings.push(newBilling);
    return { id: newId };
  }

  async updateBilling(id: string, data: Partial<Billing>): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.billings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.billings[index] = { ...this.billings[index], ...data };
    }
    return Promise.resolve();
  }

  async deleteBilling(id: string): Promise<void> {
    await this.ensureDataLoaded();
    const index = this.billings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.billings.splice(index, 1);
    }
    return Promise.resolve();
  }
}