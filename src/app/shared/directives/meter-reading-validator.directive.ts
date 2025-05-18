import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
@Directive({
  selector: '[appMeterReadingValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MeterReadingValidatorDirective,
      multi: true
    }
  ]
})
export class MeterReadingValidatorDirective implements Validator {
  @Input('appMeterReadingValidator') previousReading: number | null = null;
  
  /**
   * Ellenőrzi, hogy az új mérőállás érték nagyobb-e mint az előző mérőállás.
   * Ha nincs előző mérőállás (null), akkor csak azt ellenőrzi, hogy pozitív-e.
   */
  validate(control: AbstractControl): ValidationErrors | null {
    const meterReading = control.value;
    
    if (meterReading === null || meterReading === undefined || meterReading === '') {
      return null;
    }
    
    
    if (isNaN(meterReading) || meterReading < 0) {
      return { invalidReading: { message: 'A mérőállás nem lehet negatív' } };
    }
    
    
    if (this.previousReading !== null && meterReading <= this.previousReading) {
      return { 
        greaterThanPrevious: { 
          message: `Az új mérőállásnak nagyobbnak kell lennie, mint az előző (${this.previousReading})` 
        } 
      };
    }
    
    return null;
  }
}
