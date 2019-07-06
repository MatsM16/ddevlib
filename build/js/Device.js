export var Device;
(function (Device) {
    // Touch devices has special touch detection events
    Device.isTouch = ('ontouchstart' in window || 'onmsgesturechange' in window);
    // Browser vendors mark their user agent if on mobile
    Device.isMobile = navigator.userAgent.toLowerCase().includes("mobi");
    // Smartphone or tablet windows cannot be moved
    Device.isDesktop = 'onresize' in window && 'onkeydown' in window && !Device.isMobile;
    function vibrate(pattern) {
        if (!('vibrate' in navigator))
            return false;
        return navigator.vibrate(pattern);
    }
    Device.vibrate = vibrate;
})(Device || (Device = {}));
