export class ContextMenu
{
    private items: Map<string, ContextMenuItem>;
    private menuElement: HTMLElement | null;

    constructor(... items: (ContextMenuItem | ContextMenuItem[])[])
    {
        this.menuElement = null;
        this.items = new Map<string, ContextMenuItem>();

        const menuItems = [];
        for (const item of items)
            menuItems.push(... Array.isArray(item) ? item : [item])

        for (const item of menuItems)
            item.id = item.id ? item.id : item.text;

        for (const item of menuItems)
            this.items.set(item.id ? item.id : item.text, item)
    }

    get isOpen() { return this.menuElement !== null }

    addToElement(container: Element)
    {
        //@ts-ignore
        container["dd-contextmenu"] = this;

        document.addEventListener("contextmenu", evt => 
        {
            if (ContextMenu.canOpenContextMenu(evt.srcElement, this))
            {
                evt.preventDefault();
                this.open( evt.pageX, evt.pageY );
            }

            else
                this.close();
        });

        document.addEventListener("click",  evt => evt.button === 0 ? this.close() : undefined);
        document.addEventListener("scroll", evt => this.close());
    }

    click(itemId: string)
    {
        for (const [id, item] of this.items)
            if (itemId === id && item.onclick)
                item.onclick();
    }

    open(x: number, y: number)
    {
        if (this.isOpen)
            this.close();
        
        const menu = document.createElement("div");
        menu.classList.add("contextmenu");
        menu.setAttribute("data-contextmenu", "");
        menu.setAttribute("style", `left:${x}px;top:${y}px;`)

        for (const [id, item] of this.items)
        {
            const el = document.createElement("span");
            el.classList.add("contextmenu-item");
            el.setAttribute("data-contextmenu-item", id);
            
            el.innerHTML = item.text;

            if (item.border_under === true)
                el.classList.add("under-border");

            if (item.description)
                el.setAttribute("title", item.description);

            el.onclick = evt =>
            {
                if (item.onclick)
                    item.onclick();
                
                this.close();
            }

            menu.appendChild(el);
        }

        this.menuElement = menu;
        document.body.appendChild(menu);
    }

    close()
    {
        if (this.menuElement)
        {
            this.menuElement.remove();
            this.menuElement = null;
        }
    }

    private static canOpenContextMenu(element: Element | null, menu: ContextMenu)
    {
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

    static create (container: Element, ...items: (ContextMenuItem | ContextMenuItem[])[])
    {
        const menu = new ContextMenu(...items);
        menu.addToElement(container);

        return menu;
    }
}

export interface ContextMenuItem
{
    id?: string;
    text: string;
    onclick?: Function;

    description?: string;
    border_under?: boolean;
}