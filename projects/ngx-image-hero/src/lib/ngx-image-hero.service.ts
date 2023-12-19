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
      this.scroll$ = fromEvent(this.document, 'scroll').pipe(
        throttleTime(50, undefined, { leading: true, trailing: true }),
        share(),
      );
    }
  }
}
