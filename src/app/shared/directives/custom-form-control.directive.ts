import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Optional, Renderer2, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, FormControlDirective, FormControlName, NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
@Directive({
  selector: '[appCustomFormControl]',
  standalone: true
})
export class CustomFormControlDirective implements OnInit, OnDestroy {
  @Input() highlightOnError = true;
  @Input() showErrorMessage = true;
  
  private destroy$ = new Subject<void>();
  private originalBorderColor: string | null = null;
  private errorMessageElement: HTMLElement | null = null;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() @Self() private ngControl: NgControl
  ) { }
  
  ngOnInit(): void {
    if (!this.ngControl) {
      return;
    }
    
    
    this.originalBorderColor = this.el.nativeElement.style.borderColor;
    
    
    const control = this.ngControl.control;
    if (control) {
      control.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateErrorStyles();
        });
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    
    this.removeErrorMessageElement();
  }
  
  @HostListener('blur')
  onBlur(): void {
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.markAsTouched();
      this.updateErrorStyles();
    }
  }
  
  private updateErrorStyles(): void {
    if (!this.ngControl || !this.ngControl.control) {
      return;
    }
    
    const control = this.ngControl.control;
    const isInvalid = control.invalid && (control.dirty || control.touched);
    
    
    if (this.highlightOnError) {
      if (isInvalid) {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', '#f44336');
        this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 0 1px #f44336');
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'border-color', this.originalBorderColor);
        this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
      }
    }
    
    
    if (this.showErrorMessage) {
      if (isInvalid) {
        this.showErrorMessageElement(control);
      } else {
        this.removeErrorMessageElement();
      }
    }
  }
    private showErrorMessageElement(control: AbstractControl): void {
    
    this.removeErrorMessageElement();
    
    
    const errors = control.errors;
    if (!errors) return;
    
    let errorMessage = '';
    if (errors['required']) {
      errorMessage = 'Ez a mező kötelező.';
    } else if (errors['email']) {
      errorMessage = 'Érvénytelen email formátum.';
    } else if (errors['minlength']) {
      errorMessage = `Legalább ${errors['minlength'].requiredLength} karakter szükséges.`;
    } else if (errors['maxlength']) {
      errorMessage = `Legfeljebb ${errors['maxlength'].requiredLength} karakter megengedett.`;
    } else if (errors['min']) {
      errorMessage = `A minimális érték: ${errors['min'].min}.`;
    } else if (errors['max']) {
      errorMessage = `A maximális érték: ${errors['max'].max}.`;
    } else if (errors['pattern']) {
      errorMessage = 'Érvénytelen formátum.';
    } else {
      
      errorMessage = 'Érvénytelen érték.';
    }
    
    
    const errorElement = this.renderer.createElement('div');
    this.renderer.addClass(errorElement, 'custom-error-message');
    this.renderer.setStyle(errorElement, 'color', '#f44336');
    this.renderer.setStyle(errorElement, 'font-size', '12px');
    this.renderer.setStyle(errorElement, 'margin-top', '4px');
    
    const errorText = this.renderer.createText(errorMessage);
    this.renderer.appendChild(errorElement, errorText);
    
    
    const parent = this.el.nativeElement.parentNode;
    this.renderer.insertBefore(parent, errorElement, this.el.nativeElement.nextSibling);
    
    
    this.errorMessageElement = errorElement;
  }
  
  private removeErrorMessageElement(): void {
    if (this.errorMessageElement) {
      const parent = this.errorMessageElement.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.errorMessageElement);
      }
      this.errorMessageElement = null;
    }
  }
}
