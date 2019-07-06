import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-fab")
export class Fab extends Component
{
    @Prop()
    icon = "add";

    @Prop()
    color = "default";

    @Prop()
    size = "normal";

    render()
    {
        const size = this.getSize() * 3;

        return html`
        <style>
            :host
            {
                display: inline-block;

                border-radius: 100vw;

                box-shadow: var(--component-shadow);

                width:  calc(${size} * var(--icon-size));
                height: calc(${size} * var(--icon-size));
            }


            button
            {
                all: unset;

                width: 100%;
                height: 100%;

                border-radius: inherit;
                overflow: hidden;

                display: flex;
                justify-content: center;
                align-items: center;

                transition:
                    background-color;
                transition-duration: var(--transition-time);

                background-color: var(--${this.color});
                color: var(--text${this.color !== "default" ? "-alt" : ""})
            }
            button:hover
            {
                background-color: var(--${this.color}-dark);
                cursor: pointer;
            }
            button:active
            {
                background-color: var(--${this.color}-darker);
            }

            dd-icon
            {
                width:  calc(100% - 0.5rem);
                height: calc(100% - 0.5rem);
            }

            slot
            {
                display: none;
            }
        </style>
        <button>
            <dd-icon icon="${this.icon}"></dd-icon>
        </button>
        <slot></slot>
        `;
    }

    getSize()
    {
        switch (this.size)
        {
            case    "big"    : return 1.2;
            case    "bigger" : return 1.5;
            case    "small"  : return 0.7;
            default          : return 1.0;
        }
    }
}