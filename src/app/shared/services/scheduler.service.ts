import { Injectable } from '@angular/core';
import { Observable, of, Subject, interval, Subscription } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MeterReadingService } from './meter-reading.service';
import { GasMeterService } from './gas-meter.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { MatDialog } from '@angular/material/dialog';
export interface ScheduledTask {
  id: string;
  type: 'reading' | 'backup' | 'report' | 'custom';
  name: string;
  description?: string;
  scheduledTime: Date;
  recurrence?: 'once' | 'daily' | 'weekly' | 'monthly';
  isPaused: boolean;
  data?: any;
  lastRun?: Date;
  nextRun?: Date;
}
@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private tasks: ScheduledTask[] = [];
  private taskSubject = new Subject<ScheduledTask>();
  private checkIntervalMs = 60000; 
  private checkSubscription: Subscription | null = null;
  private destroySubject = new Subject<void>();
  public task$ = this.taskSubject.asObservable();
  constructor(
    private authService: AuthService,
    private meterService: GasMeterService,
    private readingService: MeterReadingService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}
  
  startScheduler(): void {
    if (!this.checkSubscription) {
      this.checkSubscription = interval(this.checkIntervalMs).pipe(
        takeUntil(this.destroySubject)
      ).subscribe(() => this.checkScheduledTasks());
      
      console.log('Scheduler szolgáltatás elindítva');
    }
  }
  
  stopScheduler(): void {
    if (this.checkSubscription) {
      this.destroySubject.next();
      this.checkSubscription = null;
      console.log('Scheduler szolgáltatás leállítva');
    }
  }
  
  private checkScheduledTasks(): void {
    const now = new Date();
    
    this.tasks.forEach(task => {
      if (task.isPaused) return;
      
      
      if (task.nextRun && task.nextRun <= now) {
        this.executeTask(task);
        
        
        task.lastRun = new Date();
        
        
        if (task.recurrence) {
          switch (task.recurrence) {
            case 'daily':
              task.nextRun = new Date(task.nextRun.getTime() + 24 * 60 * 60 * 1000);
              break;
            case 'weekly':
              task.nextRun = new Date(task.nextRun.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              const nextMonth = task.nextRun.getMonth() + 1;
              const nextYear = task.nextRun.getFullYear() + Math.floor(nextMonth / 12);
              const normalizedMonth = nextMonth % 12;
              task.nextRun = new Date(
                nextYear,
                normalizedMonth,
                task.nextRun.getDate(),
                task.nextRun.getHours(),
                task.nextRun.getMinutes()
              );
              break;
            default: 
              task.isPaused = true; 
              task.nextRun = undefined;
          }
        } else {
          task.isPaused = true;
          task.nextRun = undefined;
        }
      }
    });
  }
  
  private executeTask(task: ScheduledTask): void {
    console.log(`Feladat végrehajtása: ${task.name}`);
    
    switch (task.type) {
      case 'reading':
        this.executeReadingReminder(task);
        break;
      case 'report':
        this.executeReportGeneration(task);
        break;
      case 'backup':
        this.executeDataBackup(task);
        break;
      case 'custom':
        this.executeCustomTask(task);
        break;
    }
    
    
    this.taskSubject.next(task);
  }
  
  private executeReadingReminder(task: ScheduledTask): void {
    if (!task.data?.meterId) return;
    
    
    this.meterService.getGasMeter(task.data.meterId).subscribe(meter => {
      if (meter) {
        const message = `Ideje leolvasni a gázórát a következő címen: ${meter.address}`;
        const title = 'Gázóra leolvasás emlékeztető';
        
        
        this.notificationService.showNotification(message);
        
        
        this.notificationService.showPushNotification(title, { 
          body: message, 
          icon: '/assets/icons/meter-icon.png' 
        });
      }
    });
  }
  
  private executeReportGeneration(task: ScheduledTask): void {
    
    this.notificationService.showNotification(
      `${task.name} jelentés generálás kezdeményezve`
    );
  }
  
  private executeDataBackup(task: ScheduledTask): void {
    
    this.notificationService.showNotification(
      `${task.name} biztonsági mentés elkezdődött`
    );
  }
  
  private executeCustomTask(task: ScheduledTask): void {
    
    if (task.data?.action && typeof task.data.action === 'function') {
      try {
        task.data.action(task);
      } catch (error) {
        console.error(`Hiba az egyéni feladat végrehajtása közben:`, error);
      }
    }
  }
  
  scheduleTask(task: Omit<ScheduledTask, 'id'>): string {
    const id = `task_${Date.now()}`;
    const newTask: ScheduledTask = {
      id,
      ...task,
      nextRun: task.scheduledTime
    };
    
    this.tasks.push(newTask);
    console.log(`Új feladat létrehozva: ${newTask.name}`);
    
    return id;
  }
  
  cancelTask(taskId: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    
    const wasRemoved = initialLength > this.tasks.length;
    if (wasRemoved) {
      console.log(`Feladat törölve: ${taskId}`);
    }
    
    return wasRemoved;
  }
  
  toggleTaskPause(taskId: string, isPaused: boolean): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (task) {
      task.isPaused = isPaused;
      console.log(`Feladat ${isPaused ? 'szüneteltetve' : 'újraindítva'}: ${task.name}`);
      return true;
    }
    
    return false;
  }
  
  getTasks(): ScheduledTask[] {
    return [...this.tasks];
  }
  
  scheduleReadingReminders(meterId: string, intervalDays: number, startDate?: Date): string {
    const start = startDate || new Date();
      
    return this.scheduleTask({
      type: 'reading',
      name: 'Mérőállás leolvasás emlékeztető',
      description: `Rendszeres emlékeztető a(z) ${meterId} azonosítójú mérő leolvasására`,
      scheduledTime: start,
      recurrence: 'monthly', 
      isPaused: false,
      data: {
        meterId,
        intervalDays
      }
    });
  }
  
  destroy(): void {
    this.stopScheduler();
    this.destroySubject.complete();
  }
}
