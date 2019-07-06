import { HtmlResult } from "./Html.js";
import { Template } from "./Template.js";

export type ComponentConstructor= {new (element: Components.CElement, sheets?: Promise<string[]>): Component}

export namespace Components
{
    export type PropertyType = "number" | "string" | "boolean";
    export type PropertyConnetcion = "two-way" | "one-way";
    export type PropertyName = string | symbol;

    export type PropertyInfo = 
    {
        name: PropertyName;
        attribute: string;
        type: PropertyType;
        readonly: boolean;
        connection: PropertyConnetcion;
        onchange?: (value: any) => void;
    }

    export type MethodInfo = 
    {
        name: PropertyName;
    }

    export type EventInfo = 
    {
        event: string;
        function: PropertyName;
        forRoot: boolean;
    }

    export abstract class CElement extends HTMLElement
    {
        private __component: Component;
        private __properties: PropertyInfo[];

        constructor(_const: ComponentConstructor, _stylesheets?: Promise<string[]>)
        {
            super();
            this.__component = new _const(this, _stylesheets);

            this.render();

            const properties = Information.properties(_const.prototype)
            const methods    = Information.methods   (_const.prototype)
            const events     = Information.events    (_const.prototype)

            for (const prop of properties)
                if (!(prop.name in this))
                    Object.defineProperty(this, prop.name, {
                        get: GetSet.propGetter(this, this.__component, prop),
                        set: GetSet.propSetter(this, this.__component, prop)
                    })
                //else console.warn("Property name ", prop.name, " is already taken")

            for (const method of methods)
                if (!(method.name in this))
                    Object.defineProperty(this, method.name, {
                        get: GetSet.methodGetter(this, this.__component, method)
                    })
                //else console.warn("Method name ", method.name, " is already taken")
                    
            Component.setupEvents(this.__component, events);

            for (const {attribute, name} of properties)
            {
                const v = this.getAttribute(attribute);
                
                //@ts-ignore
                if (v && name in this) this[name] = v;
            }

            this.__properties = properties;
        }

        render()
        {
            Component.render(this.__component);
        }

        attributeChangedCallback(name: string, oldV: string, newV: string)
        {
            for (const prop of this.__properties)
            {
                if (prop.attribute === name && prop.name in this)
                {
                    //@ts-ignore
                    this[prop.name] = newV;
                    break;
                }
            }
        }
    }


}

export namespace Components.GetSet
{
    export function propGetter (element: CElement, component: Component, info: PropertyInfo): () => any
    {
        return () =>
        {
            if (!(info.name in component))
                throw new Error("Unknown property: " + String(info.name))

            //@ts-ignore
            const value = component[info.name];

            if (info.type === "string")
                return String(value);

            else if (info.type === "boolean")
                return Boolean(value);

            else if (info.type === "number")
                return Number(value);

            else
                throw new Error("Unknown property type: " + info.type);
        }
    }

    export function propSetter (element: CElement, component: Component, info: PropertyInfo): (arg: any) => void
    {
        return arg =>
        {
            if (info.readonly)
                throw new Error("Tried to set a readonly property: " + String(info.name));

            if (!(info.name in component))
                throw new Error("Unknown property: " + String(info.name))

            if (info.type === "string")
                arg = String(arg);

            else if (info.type === "boolean")
                arg = Boolean(arg);

            else if (info.type === "number")
                arg =  Number(arg);

            else
                throw new Error("Unknown property type: " + info.type);
            

            //@ts-ignore
            component[info.name] = arg;

            if (info.connection === "two-way")
                element.setAttribute(info.attribute, String(arg));

            Component.render(component);
        }
    }

    export function methodGetter (element: CElement, component: Component, info: MethodInfo): () => Function
    {
        return () =>
        {
            if (!(info.name in component))
                throw new Error("Unknown property: " + String(info.name))

            //@ts-ignore
            const value = (component[info.name] as Function);

            if (!(typeof value === "function"))
                throw new Error(String(info.name) + " is not a function.");

            return value.bind(component);
        }
    }

    export function eventGetter (element: CElement, component: Component, info: EventInfo): (args: Event) => void
    {
        return args =>
        {
            if (!(info.function in component))
                throw new Error("Unknown callback: " + String(info.function))

            //@ts-ignore
            const value = (component[info.function] as Function);

            if (!(typeof value === "function"))
                throw new Error(String(info.function) + " is not a function.");

            value.bind(component)(args);
        }
    }
}

export namespace Components.Information
{
    export function defineProperty(component: Component, property: PropertyInfo)
    {
        const properties = propertyList.get(Object.getPrototypeOf(component));
        
        if (!properties)
            propertyList.set(
                Object.getPrototypeOf(component), 
                new Set<PropertyInfo>([property]));
        else
            properties.add(property)
    }

    export function defineMethod(component: Component, method: MethodInfo)
    {
        const methods = methodList.get(Object.getPrototypeOf(component));
        
        if (!methods)
            methodList.set(
                Object.getPrototypeOf(component), 
                new Set<MethodInfo>([method]));
        else
            methods.add(method)
    }

    export function defineEvent(component: Component, event: EventInfo)
    {
        const events = eventList.get(Object.getPrototypeOf(component));
        
        if (!events)
            eventList.set(
                Object.getPrototypeOf(component), 
                new Set<EventInfo>([event]));
        else
            events.add(event)
    }
    
    export function properties(component: Component)
    {
        const properties = propertyList.get(Object.getPrototypeOf(component));

        return properties
            ? [...properties]
            : []
    }

    export function methods(component: Component)
    {
        const methods = methodList.get(Object.getPrototypeOf(component));

        return methods
            ? [...methods]
            : []
    }

    export function events(component: Component)
    {
        const events = eventList.get(Object.getPrototypeOf(component));

        return events
            ? [...events]
            : []
    }

    export function stylesheet(path: string): Promise<string>
    {
        if (stylesheetList.has(path))
            return new Promise(resolve => resolve(stylesheetList.get(path) as string))

        return new Promise((resolve, reject) => 
            fetch(path)
                .then(response => response.text())
                .then(style => 
                    {
                        stylesheetList.set(path, style);
                        resolve(style);
                    })
                .catch(reject));
    }

    export function stylesheets(paths: string[]): Promise<string[]>
    {
        const promises = [];
        for (const path of paths)
            promises.push(stylesheet(path));
        return Promise.all(promises);
    }

    export const propertyList = new Map<Object, Set<PropertyInfo>>();
    export const methodList   = new Map<Object, Set<MethodInfo>>();
    export const eventList    = new Map<Object, Set<EventInfo>>();
    export const stylesheetList = new Map<string, string>();
}

export abstract class Component
{
    private _element: Components.CElement;
    private _root: ShadowRoot;
    private _renderer: ((...args: any[]) => void) | undefined;

    constructor(element: Components.CElement, stylesheets: Promise<string[]> | undefined)
    {
        this._element = element;
        this._root = element.attachShadow({mode:"open"})

        if (stylesheets) stylesheets.then(sheets =>
        {
            for (const sheet of sheets)
            {
                const style = document.createElement("style");
                style.innerHTML = sheet;
                this._root.insertBefore(style, this._root.firstChild);
            }
        })
    }

    abstract render(): HtmlResult | Promise<HtmlResult>

    static render(component: Component)
    {
        const renderHtml = (html: HtmlResult) =>
        {
            if (!component._renderer)
            {
                const build = Template.build(html.markup);
                component._root.appendChild(build.element);
                component._renderer = build.apply;

                if ('setup' in component && typeof component['setup'] === "function")
                    (component['setup'] as Function)();


            }

            component._renderer(html.args);

            component.event("render", { args: html.args });
        }
        
        const html = component.render();

        'markup' in html
            ? renderHtml(html)
            : html
                .then(renderHtml)
                .catch(console.warn)
    }

    static setupEvents(component: Component, events: Components.EventInfo[])
    {
        const setup = (root: Element | ShadowRoot, info: Components.EventInfo) => root.addEventListener(
            info.event, 
            Components.GetSet.eventGetter(
                component._element, 
                component, 
                info
            )
        );
                
        for (const event of events)
            event.forRoot
                ? setup(component._root, event)
                : setup(component._element, event)
    }

    protected event(event: string, detail?: any, info?: {boubles?: boolean; cancelable?: boolean})
    {
        this._element.dispatchEvent(
            new CustomEvent(event, {detail, ...info})
        );
    }

    protected attr (name: string, newValue?: string | null): string | null
    {
        if (newValue === null)
        {
            this._element.removeAttribute(name);
            return null;
        }
        else if (newValue === undefined)
        {
            return this._element.getAttribute(name);
        }
        else
        {
            this._element.setAttribute(name, newValue);
            return newValue;
        }
    }

    protected rerender()
    {
        Component.render(this);
    }

    protected query(selector: string) { return this._root.querySelector(selector) }
    protected queryAll(selector: string) { return this._root.querySelectorAll(selector) }

    protected get classList  () { return this._element.classList  }
    protected get children   () { return this._element.children   }
    protected get root       () { return this._root               }
    protected get element    () { return this._element            }
}

export function Tag(tag: string, stylesheets?: string[])
{
    return (target: ComponentConstructor) =>
    {
        const attributes: string[] = [];
        for (const {attribute} of Components.Information.properties(target.prototype as Component))
            attributes.push(attribute);

        const stylePromise = stylesheets
            ? Components.Information.stylesheets(stylesheets)
            : undefined;

        const element = class extends Components.CElement
        {
            static get observedAttributes() { return attributes }

            constructor()
            {
                super(target, stylePromise);
            }
        }

        customElements.define(tag, element);
    }
}

export function Prop(settings?: { attribute?: string; readonly?: boolean; type?: Components.PropertyType; connection?: Components.PropertyConnetcion; onchange?: (value: any) => void })
{
    return (target: Component, key: Components.PropertyName) =>
    {
        const info: Components.PropertyInfo = 
        {
            attribute: String(key).replace(/\_/g, "-"),
            name: key,
            type: "string",
            readonly: false,
            connection: "one-way",
            onchange: undefined
        }

        if (settings)
        {
            if (settings.attribute !== undefined)
                info.attribute = settings.attribute;

            if (settings.readonly !== undefined)
                info.readonly = settings.readonly;

            if (settings.type !== undefined)
                info.type = settings.type;

            if (settings.connection !== undefined)
                info.connection = settings.connection;

            if (settings.onchange !== undefined)
                info.onchange = settings.onchange;
        }

        Components.Information.defineProperty(target, info);
    }
}

export function Method(settings?: { })
{
    return (target: Component, key: Components.PropertyName, descriptor: PropertyDescriptor) =>
    {
        descriptor.writable = false;
        descriptor.configurable = false;

        const info: Components.MethodInfo = 
        {
            name: key
        }

        Components.Information.defineMethod(target, info);
    }
}

export function On(event: string)
{
    return (target: Component, key: Components.PropertyName, descriptor: PropertyDescriptor) =>
    {
        descriptor.writable = false;
        descriptor.configurable = false;

        const info: Components.EventInfo = 
        {
            function: key,
            event: event,
            forRoot: true
        }
        
        Components.Information.defineEvent(target, info);
    }
}