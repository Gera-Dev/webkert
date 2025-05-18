export interface GasMeterStatistics {
  meterId: string;
  meterAddress: string;
  meterSerialNumber: string;
  totalReadings: number;
  averageConsumption?: number;
  maxConsumption?: number;
  minConsumption?: number;
  lastReadingDate?: Date;
  totalConsumption: number;
  consumptionByMonth: {
    month: string;
    consumption: number;
  }[];
  readingTrend: 'up' | 'down' | 'stable';
  estimatedNextReading?: number;
  estimatedMonthlyConsumption?: number;
}
export interface MeterStatisticsSummary {
  totalMeters: number;
  activeMeters: number;
  inactiveMeters: number;
  totalConsumption: number;
  averageConsumptionPerMeter: number;
  mostActiveMeterId?: string;
  mostActiveMeterAddress?: string;
}
