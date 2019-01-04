import { define } from "./Define.js";
import { Web } from "../Web.js";

export class HTMLIconElement extends HTMLElement
{
    readonly iconFolder = "/ddevlib/icons/svg/";

    constructor()
    {
        super();

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
            .replace(/[\s\_\.\-\,]+/g, "-")

        try
        {
            const svg = await Web.get(this.iconFolder + icon + ".svg", "TEXT") as string;
            this.innerHTML = svg;
            this.setAttribute("value", icon);
        }
        catch
        {
            this.innerHTML = "";
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