export declare const loadedIcons: Map<string, string>;
export declare class HTMLIconElement extends HTMLElement {
    readonly iconFolder: string;
    constructor();
    value: string;
    setIcon(icon: string): Promise<void>;
}
