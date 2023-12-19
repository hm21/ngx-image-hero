import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxImageHeroDirective } from './ngx-image-hero.directive';
import { NgxImageHeroService } from './ngx-image-hero.service';

describe('NgxImageHeroDirective', () => {
  let directive: NgxImageHeroDirective;
  let elementRefMock: ElementRef;
  let rendererMock: Renderer2;
  let imageHeroService: NgxImageHeroService;
  let documentMock: Document;

  beforeEach(() => {
    // Create mocks for dependencies
    elementRefMock = new ElementRef(document.createElement('div'));
    rendererMock = jasmine.createSpyObj('Renderer2', ['setStyle', 'appendChild', 'removeChild']);
    imageHeroService = jasmine.createSpyObj('NgxImageHeroService', ['observable']);
    documentMock = document;

    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        { provide: ElementRef, useValue: elementRefMock },
        { provide: Renderer2, useValue: rendererMock },
        { provide: NgxImageHeroService, useValue: imageHeroService },
        { provide: DOCUMENT, useValue: documentMock },
        ChangeDetectorRef,
        NgxImageHeroDirective
      ]
    });

    directive = TestBed.inject(NgxImageHeroDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
  it('should emit events correctly', () => {
    spyOn(directive.openHero, 'emit');
    spyOn(directive.closeHero, 'emit');

    directive.open();
    expect(directive.openHero.emit).toHaveBeenCalled();

    directive.close();
    expect(directive.closeHero.emit).toHaveBeenCalled();

    documentMock.getElementById('hero-backdrop')?.remove();
  });
});
