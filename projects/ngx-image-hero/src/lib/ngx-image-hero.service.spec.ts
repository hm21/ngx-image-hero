import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { NgxImageHeroService } from './ngx-image-hero.service';

describe('NgxImageHeroService', () => {
  let service: NgxImageHeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgxImageHeroService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(NgxImageHeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create and return a scroll observable', () => {
    expect(service.scroll$).toBeInstanceOf(Observable);
  });
});
