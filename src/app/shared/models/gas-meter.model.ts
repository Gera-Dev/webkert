export interface GasMeter {
  id: string;
  userId: string;
  serialNumber: string;
  address: string;
  location?: string;
  installationDate: Date;
  lastReadingDate?: Date;
  lastReading?: number;
  active: boolean;
}