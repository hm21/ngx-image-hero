export function isMobileDevice(agent?: string): boolean {
    const userAgent = agent ?? window.navigator.userAgent;
    const mobileKeywords = ['Android', 'iPhone', 'iPad', 'iPod', 'Windows Phone', 'Mobile'];

    return mobileKeywords.some(keyword => userAgent.includes(keyword));
}