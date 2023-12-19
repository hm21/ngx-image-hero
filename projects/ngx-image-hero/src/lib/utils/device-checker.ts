export function isMobileDevice(): boolean {
    const userAgent = window.navigator.userAgent;
    const mobileKeywords = ['Android', 'iPhone', 'iPad', 'iPod', 'Windows Phone', 'Mobile'];

    return mobileKeywords.some(keyword => userAgent.includes(keyword));
}