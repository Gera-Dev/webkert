import { Injectable, Optional, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, map } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { ApplicationRef, inject } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private updateCheckInterval = 6 * 60 * 60 * 1000; 
  private updateCheckSubscription: Subscription | null = null;
  private readingReminderSubscriptions: { [key: string]: Subscription } = {};
  
  
  private scheduleTimers: { [key: string]: any } = {};
  
  constructor(
    @Optional() private swUpdate: SwUpdate | null,
    private snackBar: MatSnackBar
  ) {
    
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.showUpdateNotification();
      });
    }
  }
  
  ngOnDestroy(): void {
    
    if (this.updateCheckSubscription) {
      this.updateCheckSubscription.unsubscribe();
    }
    
    Object.values(this.readingReminderSubscriptions).forEach(sub => {
      if (sub) sub.unsubscribe();
    });
    
    
    Object.values(this.scheduleTimers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
  }
  
  
  initialize(): void {
    this.startPeriodicUpdateCheck();
  }
    
  startPeriodicUpdateCheck(): void {
    if (this.swUpdate && this.swUpdate.isEnabled && !this.updateCheckSubscription) {
      this.updateCheckSubscription = interval(this.updateCheckInterval).subscribe(() => {
        this.checkForUpdates();
      });
    }
  }
    
  checkForUpdates(): void {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate()
        .then(() => console.log('Frissítés ellenőrzés kész'))
        .catch((err: Error) => console.error('Frissítés ellenőrzési hiba:', err));
    }
  }
  
  
  private showUpdateNotification(): void {
    const snackBarRef = this.snackBar.open(
      'Új verzió érhető el!',
      'Frissítés',
      {
        duration: 0,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
    
    snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }
  
  
  showNotification(message: string, action: string = 'Bezár', duration: number = 5000): void {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  
  async showPushNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    try {
      
      if (!('Notification' in window)) {
        console.warn('Ez a böngésző nem támogatja az asztali értesítéseket');
        return false;
      }
      
      
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Az értesítések engedélye megtagadva');
          return false;
        }
      }
      
      
      const notification = new Notification(title, options);
      return true;
    } catch (error) {
      console.error('Értesítés küldési hiba:', error);
      return false;
    }
  }
  
  
  scheduleReadingReminder(meterId: string, date: Date, reminderTitle: string, reminderMessage: string): string {
    
    const reminderId = `reminder_${meterId}_${Date.now()}`;
    
    
    const now = new Date();
    const timeUntilReminder = date.getTime() - now.getTime();
    
    if (timeUntilReminder <= 0) {
      console.warn('Az emlékeztető ideje már elmúlt');
      return '';
    }
    
    
    this.scheduleTimers[reminderId] = setTimeout(() => {
      this.showPushNotification(reminderTitle, {
        body: reminderMessage,
        icon: '/assets/icons/reminder-icon.png'
      });
      
      
      delete this.scheduleTimers[reminderId];
    }, timeUntilReminder);
    
    return reminderId;
  }
  
  
  cancelReadingReminder(reminderId: string): boolean {
    if (this.scheduleTimers[reminderId]) {
      clearTimeout(this.scheduleTimers[reminderId]);
      delete this.scheduleTimers[reminderId];
      return true;
    }
    return false;
  }
  
  
  cancelAllReminders(): void {
    Object.keys(this.scheduleTimers).forEach(id => {
      clearTimeout(this.scheduleTimers[id]);
      delete this.scheduleTimers[id];
    });
    
    console.log('Minden emlékeztető törölve');
  }
  
  
  destroy(): void {
    if (this.updateCheckSubscription) {
      this.updateCheckSubscription.unsubscribe();
      this.updateCheckSubscription = null;
    }
    
    
    this.cancelAllReminders();
    
    
    Object.values(this.readingReminderSubscriptions).forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    this.readingReminderSubscriptions = {};
  }
}
