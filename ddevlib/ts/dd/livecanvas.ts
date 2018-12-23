import { define } from "./CustomElements.js";

export class HTMLLiveCanvasElement extends HTMLElement
{
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private _listeners: LiveCanvasListener[];

    clearOnUpdate: boolean = true;

    constructor()
    {
        super();

        const can = HTMLLiveCanvasElement.createCanvas(this);
        const ctx = can.getContext("2d") as CanvasRenderingContext2D;

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
            const painter = new LiveCanvasPainter(can, ctx)

            const update = {
                painter: painter,
                deltaTime: delta,
                time: time
            }

            if (this.clearOnUpdate)
                ctx.clearRect(0, 0, this.width, this.height);
            
            for (const callback of this._listeners)
            //@ts-ignore
                callback(update);

            if (this.enabled)
            {
                tLast = tNow;
                requestAnimationFrame(loop);
            }
        }).bind(this);
        
        requestAnimationFrame(loop)
    }

    onUpdate(callback: LiveCanvasListener)
    {
        this._listeners.push(callback);
    }

    update(update: LiveCanvasUpdate)
    {
        if (this.clearOnUpdate)
        this.context.clearRect(0, 0, this.width, this.height);
    
        for (const callback of this._listeners)
        //@ts-ignore
            callback(update);
    }

    get width () { return this.canvas.width }
    get height () { return this.canvas.height }

    get enabled () { return !this.hasAttribute("disabled") }
    set enabled (enable: boolean)
    {
        enable ? this.removeAttribute("disabled") : this.setAttribute("disabled", "")
    }

    static createCanvas(element: HTMLLiveCanvasElement)
    {
        const can = document.createElement("canvas");
        can.setAttribute("style", "width: 100%; height: 100%;");

        const resize = (evt?: UIEvent) => {
            can.width = element.clientWidth;
            can.height = element.clientHeight;
        }
        element.onresize = resize;
        resize()

        element.appendChild(can);

        return can;
    }
}

export class LiveCanvasPainter
{
    constructor(private readonly _canvas: HTMLCanvasElement, private readonly _context: CanvasRenderingContext2D) {}

    get width () { return this._canvas.width }
    get height () { return this._canvas.height }
    
    stroke(style: string | CanvasGradient | CanvasPattern, width?: number)
    {
        if (width !== undefined)
        this._context.lineWidth = width;
        
        this._context.strokeStyle = style;
    }

    fill(style: string | CanvasGradient | CanvasPattern)
    {
        this._context.strokeStyle = style;
    }

    clear()
    {
        this._context.clearRect(0, 0, this.width, this.height);
    }

    rect(x: number, y: number, width: number, height: number)
    {
        const ctx = this._context;

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.closePath();
        ctx.stroke();
    }

    fillRect(x: number, y: number, width: number, height: number)
    {
        this._context.fillRect(x, y, width, height);
    }

    circle(x: number, y: number, radius: number)
    {
        this._context.beginPath();
        this._context.arc(x, y, radius, 0, Math.PI * 2);
        this._context.closePath();
        this._context.stroke();
    }

    fillCircle(x: number, y: number, radius: number)
    {
        this._context.beginPath();
        this._context.arc(x, y, radius, 0, Math.PI * 2);
        this._context.closePath();
        this._context.fill();
    }

    text(x: number, y: number, text: string, font?: string)
    {
        if (font === undefined)
            font = "16pt sans-serif";

        this._context.font = font;
        this._context.strokeText(text, x, y);
    }

    fillText(x: number, y: number, text: string, font?: string)
    {
        if (font === undefined)
            font = "16pt sans-serif";

        this._context.font = font;
        this._context.fillText(text, x, y);
    }

    line(x0: number, y0: number, x1: number, y1: number)
    {
        this._context.beginPath();
        this._context.moveTo(x0, y0);
        this._context.lineTo(x1, y1);
        this._context.closePath();
        this._context.stroke();
    }
}

export interface LiveCanvasUpdate
{
    painter: LiveCanvasPainter,
    deltaTime: number,
    time: number,
}

export type LiveCanvasListener = ((update: LiveCanvasUpdate) => void) | (() => void);

define(HTMLLiveCanvasElement, "dd-livecanvas");