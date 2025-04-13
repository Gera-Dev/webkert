import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hungarianDate',
  standalone: true
})
export class HungarianDatePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Magyar dátum formátum: ÉÉÉÉ. HH. NN.
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}