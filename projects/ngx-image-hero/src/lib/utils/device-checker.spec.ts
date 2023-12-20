import { isMobileDevice } from "./device-checker";

describe('isMobileDevice', () => {
    it('should return true when the user agent contains a mobile keyword', () => {
        const mobileUserAgents = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0',
            'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; NOKIA; Lumia 635) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36 Edg/91.0.864.59',
        ];

        mobileUserAgents.forEach((userAgent) => {
            const isMobile = isMobileDevice(userAgent);
            expect(isMobile).toBe(true);
        });
    });

    it('should return false when the user agent does not contain a mobile keyword', () => {
        const desktopUserAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            'Mozilla/5.0 (Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0',
        ];

        desktopUserAgents.forEach((userAgent) => {
            const isMobile = isMobileDevice(userAgent);
            expect(isMobile).toBe(false);
        });
    });
});
