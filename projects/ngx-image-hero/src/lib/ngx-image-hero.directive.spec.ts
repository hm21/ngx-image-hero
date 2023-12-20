import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxImageHeroDirective } from './ngx-image-hero.directive';

// Create a test component for the directive
@Component({
  template: `
    <img
    ngxHero
    highQualityPath="https://picsum.photos/id/100/2000"
    src="https://picsum.photos/id/100/400"
    alt="demo-image"
  />
  `,
})
class TestComponent {
}

describe('NgxImageHeroDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let directive: NgxImageHeroDirective;
  let imgDebugElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxImageHeroDirective, TestComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        // Add any other providers or dependencies needed for your directive
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    imgDebugElement = fixture.debugElement.query(By.directive(NgxImageHeroDirective));
    directive = imgDebugElement.injector.get(NgxImageHeroDirective);
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should have the ngx-hero class and cursor style', () => {
    const imgElement = imgDebugElement.nativeElement as HTMLElement;
    expect(imgElement.classList.contains('ngx-hero')).toBe(true);
    expect(imgElement.style.cursor).toBe('zoom-in');
  });

  it('should toggle expand state on click event', () => {
    const imgElement = imgDebugElement.nativeElement as HTMLElement;
    spyOn(directive, 'toggleExpandState').and.callThrough();
    imgElement.click();
    expect(directive.toggleExpandState).toHaveBeenCalled();
    directive.backdrop?.remove();
  });

  it('should call openDialog method when expanding', () => {
    spyOn(directive, 'openDialog').and.callThrough();
    directive.toggleExpandState();
    expect(directive.openDialog).toHaveBeenCalled();
    directive.backdrop?.remove();
  });

  it('should call closeDialog method when collapsing', () => {
    spyOn(directive, 'closeDialog').and.callThrough();
    directive.toggleExpandState(); // Expand
    directive.toggleExpandState(); // Collapse
    expect(directive.closeDialog).toHaveBeenCalled();
    directive.backdrop?.remove();
  });

  it('should emit openHero event when opening dialog', () => {
    spyOn(directive.openHero, 'emit');
    directive.openDialog();
    expect(directive.openHero.emit).toHaveBeenCalled();
    directive.backdrop?.remove();
  });

  it('should emit closeHero event when closing dialog', () => {
    spyOn(directive.closeHero, 'emit');
    directive.closeDialog();
    expect(directive.closeHero.emit).toHaveBeenCalled();
    directive.backdrop?.remove();
  });
});
