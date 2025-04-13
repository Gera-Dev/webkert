export interface MeterReading {
  id: string;
  userId: string;
  meterId: string;
  reading: number;
  previousReading?: number;
  consumption?: number;
  readingDate: Date;
  photoURL?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}