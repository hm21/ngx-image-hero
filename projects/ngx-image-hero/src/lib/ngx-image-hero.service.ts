import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, fromEvent, share, throttleTime } from 'rxjs';

/**
 * Service to create an observable that emits increasing numbers periodically.
 */
@Injectable({
  providedIn: 'root'
})
export class NgxImageHeroService {

  public scroll$!: Observable<Event>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Observable for scroll events on the window
      this.createStyles();
      this.scroll$ = fromEvent(this.document, 'scroll').pipe(
        throttleTime(250, undefined, { leading: true, trailing: true }),
        share(),
      );
    }
  }

  /**
   * Creates and injects CSS styles for fade-in and fade-out animations into the document's head.
   * This function generates CSS rules for fading in and fading out elements and appends them to the document's head.
   * These animations can be applied to elements with the respective CSS classes: .ngx-hero-fade-in and .ngx-hero-fade-out.
   */
  private createStyles() {
    const fadeInCSS = `
      .ngx-hero-fade-in {
        animation: fadeIn 250ms cubic-bezier(0.2, 0, 0.2, 1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;

    const fadeOutCSS = `
      .ngx-hero-fade-out {
        animation: fadeOut 250ms cubic-bezier(0.2, 0, 0.2, 1);
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;

    const styleElement = this.document.createElement('style');
    styleElement.textContent = fadeInCSS + fadeOutCSS;

    this.document.head.appendChild(styleElement);
  }
}
