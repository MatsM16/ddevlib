export declare class HTMLLiveCanvasElement extends HTMLElement {
    private readonly canvas;
    private readonly context;
    private _listeners;
    clearOnUpdate: boolean;
    constructor();
    onUpdate(callback: LiveCanvasListener): void;
    update(update: LiveCanvasUpdate): void;
    readonly width: number;
    readonly height: number;
    enabled: boolean;
    static createCanvas(element: HTMLLiveCanvasElement): HTMLCanvasElement;
}
export declare class LiveCanvasPainter {
    private readonly _canvas;
    private readonly _context;
    constructor(_canvas: HTMLCanvasElement, _context: CanvasRenderingContext2D);
    readonly width: number;
    readonly height: number;
    stroke(style: string | CanvasGradient | CanvasPattern, width?: number): void;
    fill(style: string | CanvasGradient | CanvasPattern): void;
    clear(): void;
    rect(x: number, y: number, width: number, height: number): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    circle(x: number, y: number, radius: number): void;
    fillCircle(x: number, y: number, radius: number): void;
    text(x: number, y: number, text: string, font?: string): void;
    fillText(x: number, y: number, text: string, font?: string): void;
    line(x0: number, y0: number, x1: number, y1: number): void;
}
export interface LiveCanvasUpdate {
    painter: LiveCanvasPainter;
    deltaTime: number;
    time: number;
}
export declare type LiveCanvasListener = ((update: LiveCanvasUpdate) => void) | (() => void);
