import { define } from "./CustomElements.js";
export class HTMLLiveCanvasElement extends HTMLElement {
    constructor() {
        super();
        this.clearOnUpdate = true;
        const can = HTMLLiveCanvasElement.createCanvas(this);
        const ctx = can.getContext("2d");
        this.canvas = can;
        this.context = ctx;
        this._listeners = [];
        const t0 = Date.now();
        let tLast = Date.now();
        let tNow = Date.now();
        const loop = (() => {
            tNow = Date.now();
            const delta = (tNow - tLast) * 0.001;
            const time = (tNow - t0) * 0.001;
            const painter = new LiveCanvasPainter(can, ctx);
            const update = {
                painter: painter,
                deltaTime: delta,
                time: time
            };
            if (this.clearOnUpdate)
                ctx.clearRect(0, 0, this.width, this.height);
            for (const callback of this._listeners)
                //@ts-ignore
                callback(update);
            if (this.enabled) {
                tLast = tNow;
                requestAnimationFrame(loop);
            }
        }).bind(this);
        requestAnimationFrame(loop);
    }
    onUpdate(callback) {
        this._listeners.push(callback);
    }
    update(update) {
        if (this.clearOnUpdate)
            this.context.clearRect(0, 0, this.width, this.height);
        for (const callback of this._listeners)
            //@ts-ignore
            callback(update);
    }
    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    get enabled() { return !this.hasAttribute("disabled"); }
    set enabled(enable) {
        enable ? this.removeAttribute("disabled") : this.setAttribute("disabled", "");
    }
    static createCanvas(element) {
        const can = document.createElement("canvas");
        can.setAttribute("style", "width: 100%; height: 100%;");
        const resize = (evt) => {
            can.width = element.clientWidth;
            can.height = element.clientHeight;
        };
        //@ts-ignore
        element.onresize = resize;
        resize();
        element.appendChild(can);
        return can;
    }
}
export class LiveCanvasPainter {
    constructor(_canvas, _context) {
        this._canvas = _canvas;
        this._context = _context;
    }
    get width() { return this._canvas.width; }
    get height() { return this._canvas.height; }
    stroke(style, width) {
        if (width !== undefined)
            this._context.lineWidth = width;
        this._context.strokeStyle = style;
    }
    fill(style) {
        this._context.strokeStyle = style;
    }
    clear() {
        this._context.clearRect(0, 0, this.width, this.height);
    }
    rect(x, y, width, height) {
        const ctx = this._context;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.closePath();
        ctx.stroke();
    }
    fillRect(x, y, width, height) {
        this._context.fillRect(x, y, width, height);
    }
    circle(x, y, radius) {
        this._context.beginPath();
        this._context.arc(x, y, radius, 0, Math.PI * 2);
        this._context.closePath();
        this._context.stroke();
    }
    fillCircle(x, y, radius) {
        this._context.beginPath();
        this._context.arc(x, y, radius, 0, Math.PI * 2);
        this._context.closePath();
        this._context.fill();
    }
    text(x, y, text, font) {
        if (font === undefined)
            font = "16pt sans-serif";
        this._context.font = font;
        this._context.strokeText(text, x, y);
    }
    fillText(x, y, text, font) {
        if (font === undefined)
            font = "16pt sans-serif";
        this._context.font = font;
        this._context.fillText(text, x, y);
    }
    line(x0, y0, x1, y1) {
        this._context.beginPath();
        this._context.moveTo(x0, y0);
        this._context.lineTo(x1, y1);
        this._context.closePath();
        this._context.stroke();
    }
}
define(HTMLLiveCanvasElement, "dd-livecanvas");
//# sourceMappingURL=livecanvas.js.map