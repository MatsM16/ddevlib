export class ContextMenu {
    constructor(...items) {
        this.menuElement = null;
        this.items = new Map();
        const menuItems = [];
        for (const item of items)
            menuItems.push(...Array.isArray(item) ? item : [item]);
        for (const item of menuItems)
            item.id = item.id ? item.id : item.text;
        for (const item of menuItems)
            this.items.set(item.id ? item.id : item.text, item);
    }
    get isOpen() { return this.menuElement !== null; }
    addToElement(container) {
        //@ts-ignore
        container["dd-contextmenu"] = this;
        document.addEventListener("contextmenu", evt => {
            if (ContextMenu.canOpenContextMenu(evt.srcElement, this)) {
                evt.preventDefault();
                this.open(evt.pageX, evt.pageY);
            }
            else
                this.close();
        });
        document.addEventListener("click", evt => evt.button === 0 ? this.close() : undefined);
        document.addEventListener("scroll", evt => this.close());
    }
    click(itemId) {
        for (const [id, item] of this.items)
            if (itemId === id && item.onclick)
                item.onclick();
    }
    open(x, y) {
        if (this.isOpen)
            this.close();
        const menu = document.createElement("div");
        menu.classList.add("contextmenu");
        menu.setAttribute("data-contextmenu", "");
        menu.setAttribute("style", `left:${x}px;top:${y}px;`);
        for (const [id, item] of this.items) {
            const el = document.createElement("span");
            el.classList.add("contextmenu-item");
            el.setAttribute("data-contextmenu-item", id);
            el.innerHTML = item.text;
            if (item.border_under === true)
                el.classList.add("under-border");
            if (item.description)
                el.setAttribute("title", item.description);
            el.onclick = evt => {
                if (item.onclick)
                    item.onclick();
                this.close();
            };
            menu.appendChild(el);
        }
        this.menuElement = menu;
        document.body.appendChild(menu);
    }
    close() {
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
    }
    static canOpenContextMenu(element, menu) {
        if (element === null)
            return false;
        //@ts-ignore
        if (element["dd-contextmenu"] === menu)
            return true;
        //@ts-ignore
        if (element["dd-contextmenu"])
            return false;
        if (element === menu.menuElement)
            return true;
        if (ContextMenu.canOpenContextMenu(element.parentElement, menu))
            return true;
        return false;
    }
    static create(container, ...items) {
        const menu = new ContextMenu(...items);
        menu.addToElement(container);
        return menu;
    }
}
//# sourceMappingURL=ContextMenu.js.map