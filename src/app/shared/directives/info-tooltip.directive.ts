import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
@Directive({
  selector: '[appInfoTooltip]',
  standalone: true
})
export class InfoTooltipDirective implements OnInit {
  @Input('appInfoTooltip') tooltipText = '';
  @Input() tooltipPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() tooltipDelay: number = 500; 
  
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any = null;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
  
  ngOnInit(): void {
    
    if (this.tooltipText) {
      this.initTooltip();
    }
  }
  
  private initTooltip(): void {
    
    this.renderer.addClass(this.el.nativeElement, 'has-tooltip');
    
    
    this.renderer.listen(this.el.nativeElement, 'mouseenter', () => this.showTooltip());
    this.renderer.listen(this.el.nativeElement, 'mouseleave', () => this.hideTooltip());
    this.renderer.listen(this.el.nativeElement, 'click', () => this.hideTooltip());
    
    
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
  }
  
  private showTooltip(): void {
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    
    
    this.showTimeout = setTimeout(() => {
      
      this.removeTooltip();
      
      
      const tooltip = this.renderer.createElement('div');
      this.renderer.addClass(tooltip, 'info-tooltip');
      
      
      const text = this.renderer.createText(this.tooltipText);
      this.renderer.appendChild(tooltip, text);
      
      
      this.renderer.setStyle(tooltip, 'position', 'absolute');
      this.renderer.setStyle(tooltip, 'background-color', 'rgba(97, 97, 97, 0.9)');
      this.renderer.setStyle(tooltip, 'color', '#fff');
      this.renderer.setStyle(tooltip, 'padding', '6px 12px');
      this.renderer.setStyle(tooltip, 'border-radius', '4px');
      this.renderer.setStyle(tooltip, 'font-size', '12px');
      this.renderer.setStyle(tooltip, 'z-index', '1000');
      this.renderer.setStyle(tooltip, 'max-width', '250px');
      this.renderer.setStyle(tooltip, 'text-align', 'center');
      this.renderer.setStyle(tooltip, 'pointer-events', 'none');
      this.renderer.setStyle(tooltip, 'opacity', '0');
      this.renderer.setStyle(tooltip, 'transition', 'opacity 0.2s ease-in-out');
      
      
      this.setTooltipPosition(tooltip);
      
      
      this.renderer.appendChild(document.body, tooltip);
      this.tooltipElement = tooltip;
      
      
      setTimeout(() => {
        if (this.tooltipElement) {
          this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        }
      }, 10);
      
    }, this.tooltipDelay);
  }
  
  private hideTooltip(): void {
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
      
      
      setTimeout(() => {
        this.removeTooltip();
      }, 200);
    }
  }
  
  private removeTooltip(): void {
    if (this.tooltipElement) {
      const parent = this.tooltipElement.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.tooltipElement);
      }
      this.tooltipElement = null;
    }
  }
  
  private setTooltipPosition(tooltip: HTMLElement): void {
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    
    
    this.renderer.setStyle(tooltip, 'visibility', 'hidden');
    this.renderer.setStyle(tooltip, 'display', 'block');
    
    
    const tooltipPos = tooltip.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    
    let top = 0;
    let left = 0;
    
    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top + scrollY - tooltipPos.height - 8;
        left = hostPos.left + scrollX + (hostPos.width / 2) - (tooltipPos.width / 2);
        break;
      case 'right':
        top = hostPos.top + scrollY + (hostPos.height / 2) - (tooltipPos.height / 2);
        left = hostPos.right + scrollX + 8;
        break;
      case 'bottom':
        top = hostPos.bottom + scrollY + 8;
        left = hostPos.left + scrollX + (hostPos.width / 2) - (tooltipPos.width / 2);
        break;
      case 'left':
        top = hostPos.top + scrollY + (hostPos.height / 2) - (tooltipPos.height / 2);
        left = hostPos.left + scrollX - tooltipPos.width - 8;
        break;
    }
    
    
    this.renderer.setStyle(tooltip, 'top', `${top}px`);
    this.renderer.setStyle(tooltip, 'left', `${left}px`);
    
    
    this.renderer.setStyle(tooltip, 'visibility', 'visible');
  }
}
