import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
/**
 * Ez a direktíva egy megerősítő ablakot jelenít meg, amikor a felhasználó
 * egy mérőóra leolvasást próbál elmenteni vagy törölni.
 * 
 * Használat:
 * <button appReadingConfirmation 
 *   [confirmMessage]="'Biztosan szeretnéd menteni a leolvasást?'"
 *   [confirmTitle]="'Megerősítés'"
 *   (click)="saveReading()">
 *   Mentés
 * </button>
 */
@Directive({
  selector: '[appReadingConfirmation]',
  standalone: true
})
export class ReadingConfirmationDirective implements OnInit {
  @Input() confirmMessage = 'Biztos vagy benne, hogy szeretnéd végrehajtani ezt a műveletet?';
  @Input() confirmTitle = 'Megerősítés';
  
  private originalClick: any;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
  
  ngOnInit() {
    
    this.originalClick = this.el.nativeElement.onclick;
    
    
    this.renderer.listen(this.el.nativeElement, 'click', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      
      
      const confirmation = window.confirm(`${this.confirmTitle}\n\n${this.confirmMessage}`);
      
      if (confirmation) {
        
        if (this.el.nativeElement.type === 'submit' && this.el.nativeElement.form) {
          this.el.nativeElement.form.dispatchEvent(new Event('submit', { cancelable: true }));
        } 
        
        else if (this.originalClick) {
          this.originalClick.call(this.el.nativeElement, event);
        }
      }
    });
  }
}
