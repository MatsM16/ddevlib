export var DeviceInfo;
(function (DeviceInfo) {
    // Touch devices has special touch detection events
    DeviceInfo.isTouch = ('ontouchstart' in window || 'onmsgesturechange' in window);
    // Browser vendors mark their user agent if on mobile
    DeviceInfo.isMobile = navigator.userAgent.toLowerCase().includes("mobi");
    // Smartphone or tablet windows cannot be moved
    DeviceInfo.isDesktop = 'onresize' in window && 'onkeydown' in window && !DeviceInfo.isMobile;
})(DeviceInfo || (DeviceInfo = {}));
if (DeviceInfo.isMobile)
    document.body.classList.add("mobile");
if (DeviceInfo.isTouch)
    document.body.classList.add("touch");
//# sourceMappingURL=DeviceInfo.js.map