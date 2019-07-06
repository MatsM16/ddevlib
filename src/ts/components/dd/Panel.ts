import { Component, Tag, Prop } from "../../Component.js";
import { html } from "../../Html.js";

@Tag("dd-panel")
export class Panel extends Component
{
    @Prop()
    color = "default";
    
    render()
    {
        return html`
        <style>
            :host 
            {
                display: block;

                box-shadow: var(--container-shadow);
                box-sizing: border-box;
                border-radius: var(--container-radius);

                background-color: var(--${this.color});
                color: var(--${(this.color === "default") ? "text" : "text-alt"});
            }

            slot
            {
                display: block;
                padding: var(--container-spacing);
            }

        </style>
        <slot>

        </slot>
        `;
    }
    
}