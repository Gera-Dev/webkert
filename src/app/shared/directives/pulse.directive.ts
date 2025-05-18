import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style, keyframes } from '@angular/animations';
@Directive({
  selector: '[appPulse]',
  standalone: true
})
export class PulseDirective implements OnInit {
  @Input() duration = 1500; 
  @Input() delay = 0; 
  @Input() scale = 1.1; 
  @Input() repeat = 'infinite'; 
  
  private player: AnimationPlayer | undefined;
  
  constructor(
    private element: ElementRef,
    private builder: AnimationBuilder
  ) {}
  
  ngOnInit() {
    
    const myAnimation = this.builder.build([
      animate(`${this.duration}ms ${this.delay}ms ease-in-out`, 
        keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: `scale(${this.scale})`, offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ])
      )
    ]);
    
    
    this.player = myAnimation.create(this.element.nativeElement);
    
    
    this.player.onDone(() => {
      if (this.repeat === 'infinite') {
        this.player?.play();
      } else if (typeof this.repeat === 'number' && this.repeat > 1) {
        this.repeat--;
        this.player?.play();
      }
    });
    
    
    setTimeout(() => {
      if (this.player) {
        this.player.play();
      }
    }, this.delay);
  }
}
