/**
 * Used to create custom context menues
 */
export declare class ContextMenu {
    /**
     * Element that can create this context menu
     */
    element: HTMLElement;
    /**
     * The actual HTMLElement that is this menu
     */
    menuElement: HTMLElement | null;
    /**
     * The ID for this menu, given to menu HTMLElement
     */
    menuId: string | undefined;
    /**
     * Menu items
     */
    items: ContextMenuItem[];
    /**
     * Creates an instance of ContextMenu.
     * @param {HTMLElement} element Element that can create this context menu
     * @param {ContextMenuItem[]} [items] Menu items
     * @param {string} [menuId] The ID for this menu, given to menu HTMLElement
     * @memberof ContextMenu
     */
    constructor(element: HTMLElement, items?: ContextMenuItem[], menuId?: string);
    /**
     * Indicates wether the menu is currently open or not
     *
     * @readonly
     * @memberof ContextMenu
     */
    readonly isOpen: boolean;
    private _getIndex;
    private _drawMenuItemElement;
    private _drawMenuBaseElement;
    private _canOpenThisMenu;
    private _onOpenMenu;
    private _onCloseMenu;
    /**
     * Adds a new item to menu item list. If the menu is open, the item will be drawn.
     *
     * @param {ContextMenuItem} item Item to add
     * @memberof ContextMenu
     */
    add(item: ContextMenuItem): void;
    /**
     * Removes an item from this menu
     *
     * @param {string} name
     * @memberof ContextMenu
     */
    remove(name: string): void;
    /**
     * Opens this item at the given global coordiantes
     *
     * @param {number} x Pixels from the left
     * @param {number} y Pixels from the top
     * @memberof ContextMenu
     */
    open(x: number, y: number): void;
    /**
     * Closes this menu if it's open
     *
     * @memberof ContextMenu
     */
    close(): void;
    /**
     * Same as clicking a menu element
     *
     * @param {string} text Text of the menu element action to invoke
     * @memberof ContextMenu
     */
    invokeAction(text: string): void;
    /**
     * Creates a new ContextMenu and handles it in the background.
     *
     * @static
     * @param {(HTMLElement | string)} element Element that can create this context menu
     * @param {ContextMenuItem[]} items Menu items
     * @param {string} [menuId] The ID for this menu, given to menu HTMLElement
     * @returns {ContextMenu} A refrence to the created context menu
     * @memberof ContextMenu
     */
    static create(element: HTMLElement | string, items: ContextMenuItem[], menuId?: string): ContextMenu;
    static readonly ctxPropertyName: string;
    /**
     * Loads the default CSS styling for context menues
     *
     * @static
     * @memberof ContextMenu
     */
    static loadCSS(): void;
}
export declare type ContextMenuItem = {
    /**
     * Text displayed in item
     */
    text: string;
    /**
     * Function called when item is selected
     */
    func: Function;
    /**
     * Wether this item is disabled or not
     */
    disabled?: boolean;
    /**
     * Draw a border under this item. DEFAULT: FALSE
     */
    border?: boolean;
    /**
     * A description shows when the item is hovered over
     */
    description?: string;
};
export declare namespace ContextMenuTheme {
    const defaultTheme: {
        border: string;
        radius: string;
        shadow: string;
        action_back: string;
        action_text: string;
        action_hover_text: string;
        action_hover_back: string;
        action_disabled_text: string;
        action_disabled_back: string;
    };
    function setTheme(theme?: {
        /**
         * Main element border
         *
         * @type {string}
         */
        border?: string;
        /**
         * Main element corner radius
         *
         * @type {string}
         */
        radius?: string;
        /**
         * Main element shadow
         *
         * @type {string}
         */
        shadow?: string;
        /**
         * Menu item normal background color
         *
         * @type {string}
         */
        action_back?: string;
        /**
         * Menu item normal text color
         *
         * @type {string}
         */
        action_text?: string;
        /**
         * Menu item hover text color
         *
         * @type {string}
         */
        action_hover_text?: string;
        /**
         * Menu item hover background color
         *
         * @type {string}
         */
        action_hover_back?: string;
        /**
         * Menu item disabled text color
         *
         * @type {string}
         */
        action_disabled_text?: string;
        /**
         * Menu item disabled background color
         *
         * @type {string}
         */
        action_disabled_back?: string;
    }, element?: HTMLElement): void;
}
