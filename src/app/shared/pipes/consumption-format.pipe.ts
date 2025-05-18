import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'consumptionFormat',
  standalone: true
})
export class ConsumptionFormatPipe implements PipeTransform {
  /**
   * A gázfogyasztási értékeket formázza megfelelő mértékegységgel és pontossággal.
   * 
   * @param value A fogyasztási érték
   * @param precision Az értékek tizedes jegyek száma (alapértelmezetten 1)
   * @param unit A mértékegység (alapértelmezetten 'm³')
   * @param addTrend Ha igaz, mutat trend nyilat (+/-) a nullától eltérő értékeknél
   * @returns Formázott string a fogyasztási értékkel és mértékegységgel
   */
  transform(
    value: number | null | undefined, 
    precision: number = 1, 
    unit: string = 'm³',
    addTrend: boolean = false
  ): string {
    if (value === null || value === undefined) {
      return '-';
    }
    
    const formattedValue = value.toFixed(precision);
    
    
    let trend = '';
    if (addTrend && value !== 0) {
      trend = value > 0 ? '↑ ' : '↓ ';
    }
    
    return `${trend}${formattedValue} ${unit}`;
  }
}
