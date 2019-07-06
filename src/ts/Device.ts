export namespace Device
{
    // Touch devices has special touch detection events
    export const isTouch = ('ontouchstart' in window || 'onmsgesturechange' in window);

    // Browser vendors mark their user agent if on mobile
    export const isMobile = navigator.userAgent.toLowerCase().includes("mobi");

    // Smartphone or tablet windows cannot be moved
    export const isDesktop = 'onresize' in window && 'onkeydown' in window && !isMobile;

    export function vibrate(pattern: number | number[]): boolean
    {
        if (!('vibrate' in navigator))
            return false;
            
        return navigator.vibrate(pattern);
    }
}