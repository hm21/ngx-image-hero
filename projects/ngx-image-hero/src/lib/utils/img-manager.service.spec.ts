import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { ImgManagerService } from './img-manager.service';

describe('ImgManagerService', () => {
  let service: ImgManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        ImgManagerService,
      ],
    });

    service = TestBed.inject(ImgManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize formatChecked$ to false', () => {
    expect(service.formatChecked$.getValue()).toBeFalse();
  });

  it('should check image format support and update support properties', async () => {
    await service.checkImageSupport();
    expect(service.support.webP).toBeTruthy();
    expect(service.support.avif).toBeTruthy();
    expect(service.formatChecked$.getValue()).toBeTrue();
  });

  it('should emit formatCheckerSubject$ with correct format support', async () => {
    const spy = spyOn(service.formatCheckerSubject$, 'next');
    await service.checkImageSupport();
    expect(spy).toHaveBeenCalledWith({ webP: true, avif: true });
  });

  it('should add "img-fallback" class to the document', async () => {
    const docElement = document.documentElement;
    await service.checkImageSupport();
    const updatedClassList = docElement.classList.value;
    expect(updatedClassList).toContain('img-fallback');
  });

  it('should add "webp" class to the document element if webP is supported', async () => {
    const docElement = document.documentElement;
    await service.checkImageSupport();
    const updatedClassList = docElement.classList.value;
    expect(updatedClassList).toContain('webp');
  });

  it('should add "avif" class to the document element if avif is supported', async () => {
    const docElement = document.documentElement;
    const initialClassList = docElement.classList.value;
    await service.checkImageSupport();
    const updatedClassList = docElement.classList.value;
    expect(updatedClassList).toContain('avif');
  });

  it('should emit true from supportCheckIsDone after image format check', async () => {
    let done = false;
    service.supportCheckIsDone.pipe(take(1)).subscribe((value) => {
      done = value;
    });
    await service.checkImageSupport();
    expect(done).toBeTrue();
  });
});
