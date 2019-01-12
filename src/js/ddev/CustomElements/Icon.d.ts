export declare const loadedIcons: Map<string, string>;
export declare class HTMLIconElement extends HTMLElement {
    readonly iconFolder = "/ddevlib/icons/svg/";
    constructor();
    value: string;
    setIcon(icon: string): Promise<void>;
}
