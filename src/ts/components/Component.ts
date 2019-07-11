import { html, HtmlResult } from "../Html.js";

export type ComponentConstructor = { new (element: ComponentElement): Component }

export namespace Components.Information
{
    export interface IComponent
    {
        tagname: string;
        constructor: ComponentConstructor;

        methods: IMethod[];
        properties: IProperty[];
        selfEvents: ISelfEvent[];
    }

    export interface IMethod
    {
        key: string | symbol;
    }
    
    export interface IProperty
    {
        key: string | symbol;
        readonly: boolean;
        attribute: string | undefined | null | false;
        initFromAttribute: boolean;
        updateAttribute: boolean;
        type: "string" | "boolean" | "number";
    }
    
    export interface ISelfEvent
    {
        key: string | symbol;
        event: string;
    }
}

export namespace Components.Description
{
    export const _descriptions = new Map<Component, Information.IComponent>();

    export function info(prototype: Component): Information.IComponent
    {
        const found = _descriptions.get(prototype);

        if (found)
            return found;

        //@ts-ignore
        const info = {
            tagname: undefined,
            constructor: undefined,
            methods: [],
            properties: [],
            selfEvents: []
        }

        //@ts-ignore
        _descriptions.set(prototype, info);

        //@ts-ignore
        return info;
    }

    export function attributeNames(prototype: Component): string[]
    {
        return [];
    }
}

export namespace Components
{
    export function handleProperty(component: Component, element: ComponentElement, property: Information.IProperty)
    {

    }
}

export abstract class ComponentElement extends HTMLElement
{
    public static customElement(constructor: ComponentConstructor)
    {
        return class extends ComponentElement
        {
            static get attributes() { return Components.Description.attributeNames(constructor.prototype) }

            constructor()
            {
                super(constructor);
            }
        }
    }

    public __shadow: ShadowRoot;
    public __component: Component;
    public __info: Components.Information.IComponent;

    public constructor(constructor: ComponentConstructor)
    {
        super();

        //
        // Handle pre init setup
        //
        this.__shadow = this.attachShadow({mode: "open"});
        this.__info = Components.Description.info(constructor.prototype);

        //
        // Construct the component interface
        //
        this.__component = new constructor(this);
        
        //
        // Link
        for (const {key} of this.__info.properties)
        {

        }
    }
}

export abstract class Component
{
    private _element: ComponentElement;

    protected get tag() { return this._element.tagName }

    public constructor(element: ComponentElement)
    {
        this._element = element;
    }

    abstract render(): HtmlResult;
}

export function component(tagname: string)
{
    return (constructor: ComponentConstructor) =>
    {
        const info = Components.Description.info(constructor.prototype);

        info.tagname = tagname;
        info.constructor = constructor;
        
        const element = ComponentElement.customElement(constructor);

        customElements.define(tagname, element);
    }
}

export function prop()
{
    return (prototype: Component, key: string | symbol) =>
    {
        const info = Components.Description.info(prototype);

        info.properties.push({
            attribute: String(key),
            initFromAttribute: true,
            key: key,
            readonly: false,
            type: "string",
            updateAttribute: false
        })
    }
}

export function method()
{
    return (prototype: Component, key: string | symbol, desc: PropertyDescriptor) =>
    {
        const info = Components.Description.info(prototype);

        info.methods.push({
            key: key
        })
    }
}


@component("my-component")
export class MyComponent extends Component
{
    @prop() value = "";

    @method() getValue()
    {
        return this.value;
    }

    render()
    {
        return html`My value is ${this.value}!`;
    }
}