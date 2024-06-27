import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, isDevMode } from '@angular/core';
import { Observable, Subject, filter, fromEvent, take, takeUntil, timer } from 'rxjs';
import { NgxImageHeroService } from './ngx-image-hero.service';
import { BooleanInput, coerceBooleanProperty } from './utils/coercion/coercion-boolean';
import { isMobileDevice } from './utils/device-checker';
import { ImgManagerService } from './utils/img-manager.service';

@Directive({
  standalone: true,
  selector: '[ngxHero]',
})
export class NgxImageHeroDirective implements OnInit, OnDestroy {

  /**
   * Specifies whether to use the fixed-hero mode when absolute positioning is not effective due to overflow issues.
   * @description In the case absolute positioning does not work due to overflow issues, you can enable this mode.
   */
  @Input()
  set fixedHero(value: BooleanInput) {
    this._fixedHero = coerceBooleanProperty(value);
  }
  get fixedHero() {
    return this._fixedHero;
  }
  private _fixedHero?: boolean;

  /**
   * If you have already manually determined whether the browser supports AVIF, you can set it using this option. Otherwise, the package will automatically perform the check. This option is only required when 'supportedFormats' contains values.
   */
  @Input() browserSupportAvif?: BooleanInput;

  /**
   * If you have already manually determined whether the browser supports WebP, you can set it using this option. Otherwise, the package will automatically perform the check. This option is only required when 'supportedFormats' contains values.
   */
  @Input() browserSupportWebP?: BooleanInput;

  /**
   * The path to the high-quality image or content to be displayed, which seamlessly replaces the current picture when opened.
   */
  @Input() highQualityPath?: string;

  /**
   * Insert backdrop at this position.
   */
  @Input() backdropPosition: 'documentEnd' | 'beforeHeroItem' = 'documentEnd';


  /**
   * An array of supported image formats, which is only required when using the `<picture>` element where the browser automatically selects the format.
   *
   * @example
   * When `supportedFormats` includes ['avif', 'webp', 'jpeg'], the URL should only contain the image name without a specific format extension like img/name without .avif. 
   * The library will automatically choose the best-supported format from the list.
   *
   * @type {string[] | undefined}
   */
  @Input() supportedFormats?: string[];


  /**
   * Event emitter triggered when the hero animation start.
   */
  @Output() openHero = new EventEmitter<void>();

  /**
   * Event emitter triggered when the hero animation end.
   */
  @Output() closeHero = new EventEmitter<void>();


  private expanded = false;
  private heroDuration = 250;

  public backdrop?: HTMLElement;
  private placeholder?: HTMLElement;

  private fixedHelper = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }

  private reset$ = new Subject();
  private destroy$ = new Subject();


  constructor(
    private imageHeroService: NgxImageHeroService,
    private el: ElementRef<HTMLImageElement>,
    private zone: NgZone,
    private renderer: Renderer2,
    private imgManager: ImgManagerService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
  ) { }

  ngOnInit() {
    this.el.nativeElement.style.cursor = 'zoom-in';
    this.el.nativeElement.classList.add('ngx-hero');
    if (isPlatformBrowser(this.platformId) && !isMobileDevice()) {
      this.setupListeners();
      if (this.supportedFormats &&
        this.browserSupportAvif === undefined &&
        this.browserSupportWebP === undefined &&
        !this.imgManager.formatChecked$.getValue()
      ) {
        this.imgManager.checkImageSupport();
      }
    }
  }

  ngOnDestroy(): void {
    this.reset$.next(true);
    this.reset$.complete();
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Sets up listeners for scroll and click events.
   */
  private setupListeners() {
    this.zone.runOutsideAngular(() => {
      this.setupClickListener();
    });
  }

  /**
   * Sets up listener for scroll events.
   */
  private setupScrollListener() {
    this.imageHeroService.scroll$?.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter(() => this.expanded)
    ).subscribe(() => this.closeDialog());
  }

  /**
   * Sets up listener for click events.
   */
  private setupClickListener() {
    fromEvent(this.el.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
      filter(() => !isMobileDevice()),
    ).subscribe(() => this.toggleExpandState());
  }

  /**
   * Toggles the expand state of the hero.
   */
  public toggleExpandState() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.openDialog();
    } else {
      this.closeDialog();
    }
  }

  /**
   * Start the hero animation effect.
   */
  public openDialog() {
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

    this.setupScrollListener();

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

    if (this.highQualityPath) {
      let highQualityPath = this.highQualityPath;
      if (this.supportedFormats) {
        if (this.supportedFormats.includes('avif') && (this.browserSupportAvif || this.imgManager.support.avif)) {
          highQualityPath += '.avif';
        } else if (this.supportedFormats.includes('webp') && this.browserSupportWebP || this.imgManager.support.webP) {
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
          /// Remove old source tags when the image is inside a picture tag
          if (el.parentElement?.tagName.toLowerCase() === 'picture') {
            const sources = el.parentElement?.querySelectorAll('source');
            sources?.forEach(source => {
              this.renderer.removeChild(el.parentElement, source);
            });
          }
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
        takeUntil(this.destroy$),
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
  public closeDialog() {
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
        takeUntil(this.destroy$),
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
          takeUntil(this.destroy$),
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
      backdrop.classList.replace('ngx-hero-fade-in', 'ngx-hero-fade-out');
      fromEvent(backdrop, 'animationend').pipe(
        takeUntil(this.destroy$),
        takeUntil(this.reset$),
        take(1)
      ).subscribe(() => {
        backdrop.remove();
      });
    }

    timer(this.heroDuration).pipe(
      takeUntil(this.destroy$),
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

    backdrop.classList.add('ngx-hero-fade-in');

    // Add click listener to the backdrop
    fromEvent(backdrop, 'click').pipe(
      takeUntil(this.destroy$),
      take(1),
      takeUntil(this.reset$),
    ).subscribe(() => {
      this.closeDialog();
    });

    if (this.backdropPosition === 'documentEnd') {
      this.document.body.appendChild(backdrop);
    } else {
      this.renderer.insertBefore(this.el.nativeElement.parentElement, backdrop, this.el.nativeElement);
    }
    this.backdrop = backdrop;
  }
}