import { Directive, ElementRef, Input, OnInit, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
@Directive({
  selector: '[appFadeIn]',
  standalone: true
})
export class FadeInDirective implements OnInit {
  @Input() duration = 500; 
  @Input() delay = 0; 
  @Input() translateY = 20; 
  
  private player: AnimationPlayer | undefined;
  
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private builder: AnimationBuilder
  ) {}
  
  ngOnInit() {
    
    this.renderer.setStyle(this.element.nativeElement, 'opacity', '0');
    
    
    const myAnimation = this.builder.build([
      style({ 
        opacity: 0, 
        transform: `translateY(${this.translateY}px)` 
      }),
      animate(`${this.duration}ms ${this.delay}ms ease-out`, 
        style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        })
      )
    ]);
    
    
    this.player = myAnimation.create(this.element.nativeElement);
    
    
    setTimeout(() => {
      if (this.player) {
        this.player.play();
      }
    }, this.delay);
  }
}
