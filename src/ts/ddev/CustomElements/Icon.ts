import { define } from "./Define.js";
import { Web } from "../Web.js";

export const loadedIcons: Map<string, string> = new Map<string, string>();

export class HTMLIconElement extends HTMLElement
{
    readonly iconFolder = "/ddevlib/icons/svg/";

    constructor()
    {
        super();

        if (this.innerHTML || this.innerHTML.trim().length > 0)
            this.setIcon(this.innerHTML);
    }

    get value(): string
    {
        const icon = this.getAttribute("value");

        if (icon)
            return icon;
        else
            return "";
    }
    set value(icon: string)
    {
        this.setIcon(icon);
    }
    async setIcon(icon: string)
    {
        icon = icon
            .trim()
            .replace(/[\s\_\.\-\,]+/g, "-")

        if (loadedIcons.has(icon))
            this.innerHTML = loadedIcons.get(icon) as string;
        else
        {
            try
            {
                let svg = await Web.get(this.iconFolder + icon + ".svg", "TEXT") as string;
    
                this.innerHTML = svg;
                this.setAttribute("value", icon);

                loadedIcons.set(icon, svg);
            }
            catch (e)
            {
                this.innerHTML = "";
            }
        }
    }
}

define(HTMLIconElement, "dd-icon", `
dd-icon
{
    display: inline-block;
    height: 1.2em;
    width: 1.2em;
    border-radius: 10px;

    color: inherit;
}

dd-icon svg
{
    width: 100%;
    height: 100%;

    fill: currentColor;

    object-fit: contain;

    position: relative;
    bottom: -0.2em;
}`);