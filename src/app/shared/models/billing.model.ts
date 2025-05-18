export interface Billing {
  id: string;
  userId: string;
  meterId: string;
  readingId: string;
  amount: number;
  currency: string;
  consumption: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: Date;
  createdAt: Date;
}
