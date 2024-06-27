import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, take } from 'rxjs';

/**
 * Service for managing image formats and their support.
 */
@Injectable({
    providedIn: 'root'
})
export class ImgManagerService {
    /**
      * BehaviorSubject indicating whether image format support check has been completed.
      */
    public formatChecked$ = new BehaviorSubject(false);

    /**
     * Subject for broadcasting image format support status.
     */
    public formatCheckerSubject$ = new Subject<{ webP: boolean, avif: boolean }>();

    /**
     * Object to store format support status (e.g., webP and avif).
     */
    public support = {
        webP: false,
        avif: false,
    }

    private document = inject(DOCUMENT);

    /**
        * Observable that emits when image format support check is completed.
        *
        * @returns {Observable<any>} An Observable that emits true when support check is done.
        */
    public get supportCheckIsDone(): Observable<any> {
        return new Observable((subscriber => {
            this.formatChecked$.pipe(filter(el => el), take(1)).subscribe({
                next() {
                    subscriber.next(true);
                    subscriber.complete();
                },
                complete() {
                    subscriber.complete();
                }
            });
        }));
    }

    /**
     * Asynchronously checks image format support (webP and avif).
     */
    public async checkImageSupport() {
        await new Promise(resolve => {
            const avif = new Image();
            avif.src =
                "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
            avif.onload = () => {
                this.support.webP = true;
                this.support.avif = true;
                resolve(true);
            };
            avif.onerror = () => {
                return check_webp_feature((isSupported: boolean) => {
                    this.support.webP = isSupported;
                    resolve(true);
                });
            };
            function check_webp_feature(callback: any) {
                const img = new Image();
                img.onload = function () {
                    const result = img.width > 0 && img.height > 0;
                    callback(result);
                };
                img.onerror = function () {
                    callback(false);
                };
                img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
            }
        }).catch(() => console.warn);

        this.addClass('img-fallback')
        if (this.support.webP) this.addClass('webp')
        if (this.support.avif) this.addClass('avif')
        this.formatCheckerSubject$.next(this.support);
        this.formatChecked$.next(true);
    }

    /**
     * Adds a CSS class to the document's root element.
     *
     * @param {string} className - The CSS class to add.
     */
    private addClass(className: string) {
        this.document.documentElement.classList.add(className);
    }
}
