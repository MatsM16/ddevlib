export declare class ContextMenu {
    private items;
    private menuElement;
    constructor(...items: (ContextMenuItem | ContextMenuItem[])[]);
    readonly isOpen: boolean;
    addToElement(container: Element): void;
    click(itemId: string): void;
    open(x: number, y: number): void;
    close(): void;
    private static canOpenContextMenu;
    static create(container: Element, ...items: (ContextMenuItem | ContextMenuItem[])[]): ContextMenu;
}
export interface ContextMenuItem {
    id?: string;
    text: string;
    onclick?: Function;
    description?: string;
    border_under?: boolean;
}
