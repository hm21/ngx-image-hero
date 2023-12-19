import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, DestroyRef, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, booleanAttribute, inject, isDevMode } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, filter, fromEvent, take, takeUntil, timer } from 'rxjs';
import { NgxImageHeroService } from './ngx-image-hero.service';
import { isMobileDevice } from './utils/device-checker';

@Directive({
  selector: '[ngxHero]',
  standalone: true
})
export class NgxImageHeroDirective implements OnInit, OnDestroy {

  /**
 * Specifies whether to use the fixed-hero mode when absolute positioning is not effective due to overflow issues.
 * @description In the case absolute positioning does not work due to overflow issues, you can enable this mode.
 */
  @Input({ transform: booleanAttribute }) fixedHero?: boolean;

  /**
   * The path to the high-quality image or content to be displayed.
   */
  @Input() highQualityPath?: string;

  /**
   * An array of supported image formats.
   */
  @Input() supportedFormats?: string[];

  /**
   * Event emitter for when the dialog is opened.
   */
  @Output() openHero = new EventEmitter<void>();

  /**
   * Event emitter for when the dialog is closed.
   */
  @Output() closeHero = new EventEmitter<void>();


  private expanded = false;
  private heroDuration = 250;

  private backdrop?: HTMLElement;
  private placeholder?: HTMLElement;

  private fixedHelper = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }

  private reset$ = new Subject();

  private imageHeroService = inject(NgxImageHeroService);
  private destroyRef = inject(DestroyRef);
  private el = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private zone = inject(NgZone);
  private renderer = inject(Renderer2);
  private cdRef = inject(ChangeDetectorRef);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !isMobileDevice()) {
      this.setupListeners();
    }
  }

  ngOnDestroy(): void {
    this.reset$.next(true);
    this.reset$.complete();
  }

  /**
   * Sets up listeners for scroll and click events.
   */
  private setupListeners() {
    this.zone.runOutsideAngular(() => {
      this.setupScrollListener();
      this.setupClickListener();
    });
  }

  /**
   * Sets up listener for scroll events.
   */
  private setupScrollListener() {
    this.imageHeroService.scroll$?.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => this.expanded)
    ).subscribe(() => this.close());
  }

  /**
   * Sets up listener for click events.
   */
  private setupClickListener() {
    fromEvent(this.el.nativeElement, 'click').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !isMobileDevice()),
    ).subscribe(() => this.toggleExpandState());
  }

  /**
   * Toggles the expand state of the hero.
   */
  private toggleExpandState() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.open();
    } else {
      this.close();
    }
  }

  /**
   * Opens the hero animation effect.
   */
  public open() {
    function preloadImage(url: string): Observable<Event> {
      return new Observable((observer) => {
        const img = new Image();

        img.onload = (event) => {
          observer.next(event);
          observer.complete();
        };

        img.onerror = (event) => {
          observer.error(event);
        };

        img.src = url;

        return {
          unsubscribe() {
            img.onload = null;
            img.onerror = null;
          },
        };
      });
    }

    if (isMobileDevice()) return;

    const gap = 16;

    const el = this.el.nativeElement;

    const bounding = el.getBoundingClientRect();

    const cmpWidth = el.offsetWidth;
    const cmpHeight = el.offsetHeight;

    const screenWidth = window.innerWidth - gap * 2;
    const screenHeight = window.innerHeight - gap * 2;

    const scaleHeight = screenHeight / cmpHeight;
    const scaleWidth = screenWidth / cmpWidth;
    const scale = Math.min(scaleHeight, scaleWidth);

    const translateY = -(bounding.y - gap - (screenHeight - cmpHeight) / 2) / scale;
    const translateX = -(bounding.x - gap - (screenWidth - cmpWidth) / 2) / scale;

    el.style.zIndex = '9999';
    el.style.cursor = 'zoom-out';

    if (this.highQualityPath && el.parentElement?.querySelectorAll('source')?.length !== 0) {
      let highQualityPath = this.highQualityPath;
      if (this.supportedFormats) {
        if (this.supportedFormats.includes('avif') && this.imgManager.support.avif) {
          highQualityPath += '.avif';
        } else if (this.supportedFormats.includes('webp') && this.imgManager.support.webP) {
          highQualityPath += '.webp';
        } else if (this.supportedFormats.includes('png')) {
          highQualityPath += '.png';
        } else if (this.supportedFormats.includes('jpeg')) {
          highQualityPath += '.jpeg';
        } else if (this.supportedFormats.includes('jpg')) {
          highQualityPath += '.jpg';
        }
      }

      preloadImage(highQualityPath).subscribe({
        next: () => {
          el.src = highQualityPath;
          const sources = el.parentElement?.querySelectorAll('source');
          sources?.forEach(source => {
            this.renderer.removeChild(el.parentElement, source);
          });
          this.cdRef.detectChanges();
        },
        error: () => {
          if (isDevMode()) {
            console.error('Oops, something went wrong with the image!')
          }
        },
      });
    }


    if (!this.fixedHero) {
      // Position to relative will ensure that zIndex will work
      el.style.position = 'relative';
      el.style.transition = `transform ${this.heroDuration}ms cubic-bezier(0.2, 0, 0.2, 1)`;
      el.style.transform = `scale(${scale.toString()}) translate(${translateX}px, ${translateY}px)`;
    } else {
      // Build placeholder
      this.placeholder?.remove();

      const placeholder = this.document.createElement('div');
      placeholder.style.display = 'block';
      placeholder.style.width = `${cmpWidth}px`;
      placeholder.style.height = `${cmpHeight}px`;

      el.parentElement?.appendChild(placeholder)
      this.placeholder = placeholder;

      // Update styles
      el.style.position = 'fixed';
      el.style.transition = 'none';

      this.fixedHelper = {
        height: cmpHeight,
        width: cmpWidth,
        y: bounding.y + cmpHeight / 2,
        x: bounding.x + cmpWidth / 2,
      }
      el.style.top = `${this.fixedHelper.y}px`;
      el.style.left = `${this.fixedHelper.x}px`;
      el.style.width = `${this.fixedHelper.width}px`;
      el.style.height = `${this.fixedHelper.height}px`;

      el.style.transform = `translate(-50%, -50%)`;

      timer(1).pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.reset$),
      ).subscribe(() => {
        el.style.transition = `all ${this.heroDuration}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        el.style.maxWidth = 'unset';
        el.style.maxHeight = 'unset';

        el.style.top = `50vh`;
        el.style.left = `50vw`;

        if (scale === scaleWidth) {
          el.style.width = `calc(100vw - ${2 * gap}px)`;
          el.style.height = `auto`;
        } else {
          el.style.width = `auto`;
          el.style.height = `calc(100vh - ${2 * gap}px)`;
        }
      });
    }


    this.createBackdrop();

    this.openHero.emit();
  }

  /**
   * Closes the hero animation effect.
   */
  public close() {
    this.expanded = false;
    this.reset$.next(true);

    const el = this.el.nativeElement;


    // First set zIndex to 1 and then to unset so that the closing animation continues to fly over other content but behind the navigation bar
    el.style.zIndex = '1';
    el.style.cursor = 'zoom-in';


    const backdrop = this.backdrop ?? this.document.getElementById('hero-backdrop');

    if (this.fixedHero) {
      el.style.maxWidth = '';
      el.style.maxHeight = '';

      el.style.top = `${this.fixedHelper.y}px`;
      el.style.left = `${this.fixedHelper.x}px`;
      el.style.width = `${this.fixedHelper.width}px`;
      el.style.height = `${this.fixedHelper.height}px`;

      timer(this.heroDuration).pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.reset$),
      ).subscribe(() => {
        this.placeholder?.remove();

        el.style.position = 'relative';
        el.style.transition = 'none';
        el.style.transform = '';
        el.style.top = '';
        el.style.left = '';
        el.style.width = '';
        el.style.height = '';

        timer(this.heroDuration).pipe(
          takeUntilDestroyed(this.destroyRef),
          takeUntil(this.reset$),
        ).subscribe(() => {
          el.style.transition = '';
        });
      });
    } else {
      el.style.transform = '';
      el.style.position = 'relative';
    }

    if (backdrop) {
      backdrop.classList.replace('fade-in', 'fade-out');
      fromEvent(backdrop, 'animationend').pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        takeUntil(this.reset$),
      ).subscribe(() => {
        backdrop.remove();
      });
    }

    timer(this.heroDuration).pipe(
      takeUntilDestroyed(this.destroyRef),
      takeUntil(this.reset$),
      take(1),
    ).subscribe(() => {
      el.style.zIndex = 'unset';
    })
    this.closeHero.emit();
  }

  /**
   * Create backdrop element
   */
  private createBackdrop() {
    const backdrop = this.document.createElement('div');
    backdrop.id = 'hero-backdrop';
    backdrop.role = 'dialog';
    backdrop.tabIndex = -1;

    backdrop.style.top = '0px';
    backdrop.style.left = '0px';
    backdrop.style.right = '0px';
    backdrop.style.bottom = '0px';
    backdrop.style.position = 'fixed';
    backdrop.style.zIndex = '9998';
    backdrop.style.cursor = 'zoom-out';
    backdrop.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';

    backdrop.classList.add('fade-in');

    // Add click listener to the backdrop
    fromEvent(backdrop, 'click').pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1),
      takeUntil(this.reset$),
    ).subscribe(() => {
      this.close();
    });

    this.document.body.appendChild(backdrop);
    this.backdrop = backdrop;
  }
}