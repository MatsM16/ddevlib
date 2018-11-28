/**
 * Used to create custom context menues
 */
export class ContextMenu {
    /**
     * Creates an instance of ContextMenu.
     * @param {HTMLElement} element Element that can create this context menu
     * @param {{ text: string, func: Function, disabled?: boolean, border?: boolean, description?: string }[]} [items] Menu items
     * @param {string} [menuId] The ID for this menu, given to menu HTMLElement
     * @memberof ContextMenu
     */
    constructor(element, items, menuId) {
        this.element = element;
        this.menuElement = null;
        this.items = items ? items : [];
        this.menuId = menuId;
        //
        // Setup
        //
        document.addEventListener("contextmenu", this._onOpenMenu.bind(this));
        document.addEventListener("click", this._onCloseMenu.bind(this));
    }
    /**
     * Indicates wether the menu is currently open or not
     *
     * @readonly
     * @memberof ContextMenu
     */
    get isOpen() { return this.menuElement != null; }
    _getIndex(text) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].text == text) {
                return i;
            }
        }
        return -1;
    }
    _drawMenuItemElement(item) {
        if (!this.menuElement) {
            return;
        }
        let itemElement = document.createElement("a");
        //
        // Add potensial disabled class
        //
        if (item.disabled != null) {
            if (item.disabled == true) {
                itemElement.classList.add("disabled");
            }
        }
        //
        // Add potensial border class
        //
        if (item.border != null) {
            if (item.border == true) {
                itemElement.classList.add("border");
            }
        }
        if (item.description != undefined) {
            itemElement.title = item.description;
        }
        itemElement.innerHTML = item.text;
        itemElement.onclick = ((event) => {
            //
            // Call menu function if not disabled
            //
            if (!item.disabled) {
                item.func();
            }
            //
            // Close the menu
            //
            this.close();
        }).bind(this);
        //
        // Add item to menu
        //
        this.menuElement.appendChild(itemElement);
    }
    _drawMenuBaseElement(x, y) {
        //
        // Close old menu if it's open
        //
        if (this.menuElement) {
            this.close();
        }
        //
        // Open menu
        //
        this.menuElement = document.createElement("div");
        this.menuElement.classList.add("contextmenu");
        if (this.menuId) {
            this.menuElement.id = this.menuId;
        }
        //
        // Set menu location
        //
        this.menuElement.style.left = x + "px";
        this.menuElement.style.top = y + "px";
        //
        // Add menu to body
        //
        document.body.appendChild(this.menuElement);
        //
        // Handle special case when user opens context menu on top of open contextmenu
        //
        this.menuElement.oncontextmenu = this._onOpenMenu.bind(this);
    }
    _canOpenThisMenu(element) {
        const doesTreeContain = (root, find) => {
            if (root === this.element)
                return true;
            for (const child of root.children)
                if (doesTreeContain(child, find))
                    return true;
            return false;
        };
        if (element === null)
            return false;
        return doesTreeContain(this.element, element);
    }
    _onOpenMenu(contextMenuEvent) {
        if (this._canOpenThisMenu(contextMenuEvent.srcElement)) {
            contextMenuEvent.preventDefault();
            let x = contextMenuEvent.pageX;
            let y = contextMenuEvent.pageY;
            this.open(x, y);
        }
        else {
            this.close();
        }
    }
    _onCloseMenu(mouseEvent) {
        if (mouseEvent.button === 0) {
            this.close();
        }
    }
    /**
     * Adds a new item to menu item list. If the menu is open, the item will be drawn.
     *
     * @param {{ text: string, func: Function, disabled?: boolean, border?: boolean, description?: string }} item Item to add
     * @memberof ContextMenu
     */
    add(item) {
        this.items.push(item);
        if (this.isOpen) {
            this._drawMenuItemElement(item);
        }
    }
    /**
     * Removes an item from this menu
     *
     * @param {string} name
     * @memberof ContextMenu
     */
    remove(name) {
        let index = this._getIndex(name);
        this.items.splice(index, 1);
    }
    /**
     * Opens this item at the given global coordiantes
     *
     * @param {number} x Pixels from the left
     * @param {number} y Pixels from the top
     * @memberof ContextMenu
     */
    open(x, y) {
        this.close();
        this._drawMenuBaseElement(x, y);
        //
        // Populate menu item list
        //
        for (let item of this.items) {
            this._drawMenuItemElement(item);
        }
    }
    /**
     * Closes this menu if it's open
     *
     * @memberof ContextMenu
     */
    close() {
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
    }
    /**
     * Same as clicking a menu element
     *
     * @param {string} text Text of the menu element action to invoke
     * @memberof ContextMenu
     */
    invokeAction(text) {
        let index = this._getIndex(text);
        this.items[index].func();
        this.close();
    }
    /**
     * Creates a new ContextMenu and handles it in the background.
     *
     * @static
     * @param {(HTMLElement | string)} element Element that can create this context menu
     * @param {{ text: string, func: Function, disabled?: boolean, border?: boolean, description?: string }[]} items Menu items
     * @param {string} [menuId] The ID for this menu, given to menu HTMLElement
     * @returns {ContextMenu} A refrence to the created context menu
     * @memberof ContextMenu
     */
    static create(element, items, menuId) {
        if (typeof element === "string") {
            let tryElement = document.getElementById(element);
            if (tryElement)
                element = tryElement;
            else
                throw new Error(`Element with id "${element}" could not be found.`);
        }
        return new ContextMenu(element, items, menuId);
    }
    /**
     * Loads the default CSS styling for context menues
     *
     * @static
     * @memberof ContextMenu
     */
    static loadCSS() {
        let css = `:root {
    --contextmenu-border: 1px solid var(--default-alt, #ddd);
    --contextmenu-radius: 0px;
    --contextmenu-shadow: var(--default-alt, #888);
    --contextmenu-action-back: var(--default, white);
    --contextmenu-action-text: var(--text, black);
    --contextmenu-action-hover-back: var(--default-alt, rgba(0, 0, 0, 0.05));
    --contextmenu-action-hover-text: var(--primary, black);
}

.contextmenu {
    position: absolute;
    display: block;
    background-color: var(--contextmenu-action-back);
    border: var(--contextmenu-border);
    border-radius: var(--contextmenu-radius);
    overflow: hidden;

    box-shadow: 2px 2px 1px 0px var(--contextmenu-shadow);
}

.contextmenu a {
    display: block;
    white-space: nowrap;
    padding: 0.5em 2em;
    color: var(--contextmenu-action-text);
}

.contextmenu a:hover {
    background-color: var(--contextmenu-action-hover-back) !important;
    color: var(--contextmenu-action-hover-text) !important;
    cursor: pointer;
}
.contextmenu a.disabled:hover,
.contextmenu a.disabled {
    opacity: var(--disabled-opacity, 0.65);
    cursor: default;
}

.contextmenu a.border {
    border-bottom: var(--contextmenu-border);
}`;
        const head = document.head;
        if (head)
            head.innerHTML += `<style>${css}</style>`;
        else
            console.warn("Cannot load css due to the inexistance of the head tag. Yup, that's gonna be a problem...");
    }
}
export var ContextMenuTheme;
(function (ContextMenuTheme) {
    ContextMenuTheme.defaultTheme = {
        border: "1px solid #ddd",
        radius: "0px",
        shadow: "#888",
        action_back: "white",
        action_text: "black",
        action_hover_text: "rgba(0, 0, 0, 0.05)",
        action_hover_back: "black",
        action_disabled_text: "white",
        action_disabled_back: "gray"
    };
    function setTheme(theme, element) {
        if (theme === undefined)
            theme = ContextMenuTheme.defaultTheme;
        if (element === undefined)
            element = document.body;
        const valueOf = (theme, name) => theme[name];
        const hasValue = (theme, name) => valueOf(theme, name) !== undefined;
        for (const name in theme) {
            const stylename = `--contextmenu-${name.replace(/_/g, "-")}`;
            const value = hasValue(theme, name) ? valueOf(theme, name) : valueOf(ContextMenuTheme.defaultTheme, name);
            if (value !== null || value !== undefined)
                element.style.setProperty(stylename, value);
        }
    }
    ContextMenuTheme.setTheme = setTheme;
})(ContextMenuTheme || (ContextMenuTheme = {}));
//# sourceMappingURL=ContextMenu.js.map