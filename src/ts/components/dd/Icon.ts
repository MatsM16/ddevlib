import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-icon")
export class Icon extends Component
{
    @Prop()
    icon = "home";

    render()
    {
        const icon = this.getIcon();

        return html`
        <style>

            :host
            {
                display: inline-flex;
                justify-content: center;
                align-items: center;

                width:  calc(1 * var(--icon-size));
                height: calc(1 * var(--icon-size));
            }

            slot
            {
                display: none;
            }

            svg, img, video
            {
                width: 100%;
                height: 100%;

                object-fit: contain;
            }

            svg
            {
                fill: currentColor;
            }

        </style>
        ${html([icon] as unknown as TemplateStringsArray)}
        <slot></slot>`;
    }

    getIcon()
    {
        const ico = Icon.icon(
            this.icon
                .replace(/\s/g, "-")
                .replace(/_/g, "-")
                .replace(/\./g, "-")
        );

        if (ico) return ico;

        Icon._iconsToRender.add(this);

        return "ICO"; // Placeholder
    }

    private static _icons: Record<string, string> = {}
    private static _iconsToRender: Set<Icon> = new Set();

    private static icon(name: string): string | null
    {
        if (this._icons && name in this._icons && this._icons[name])
            return this._icons[name];
        else
            return null;
    }

    static iconsAreLoaded(icons: Record<string, string>)
    {
        this._icons = icons;
        
        for (const icon of this._iconsToRender)
            Component.render(icon);
        this._iconsToRender.clear();
    }
}

fetch("./icons.json")
    .then(response => response.json())
    .then(json => Icon.iconsAreLoaded(json))
    .catch(reason => console.warn("Failed to find icons file, will use placeholders", reason))
