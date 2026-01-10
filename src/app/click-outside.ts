import {
  Directive,
  ElementRef,
  inject,
  output
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  host: {
    '(document:click)': 'handleClick($event)',
  },
})
export class ClickOutsideDirective {
  appClickOutside = output<void>();

  private readonly elementRef = inject(ElementRef);

  handleClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
