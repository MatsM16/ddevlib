import { Template } from "./Template.js";
export var Components;
(function (Components) {
    class CElement extends HTMLElement {
        constructor(_const, _stylesheets) {
            super();
            this.__component = new _const(this, _stylesheets);
            this.render();
            const properties = Components.Information.properties(_const.prototype);
            const methods = Components.Information.methods(_const.prototype);
            const events = Components.Information.events(_const.prototype);
            for (const prop of properties)
                if (!(prop.name in this))
                    Object.defineProperty(this, prop.name, {
                        get: Components.GetSet.propGetter(this, this.__component, prop),
                        set: Components.GetSet.propSetter(this, this.__component, prop)
                    });
            //else console.warn("Property name ", prop.name, " is already taken")
            for (const method of methods)
                if (!(method.name in this))
                    Object.defineProperty(this, method.name, {
                        get: Components.GetSet.methodGetter(this, this.__component, method)
                    });
            //else console.warn("Method name ", method.name, " is already taken")
            Component.setupEvents(this.__component, events);
            for (const { attribute, name } of properties) {
                const v = this.getAttribute(attribute);
                //@ts-ignore
                if (v && name in this)
                    this[name] = v;
            }
            this.__properties = properties;
        }
        render() {
            Component.render(this.__component);
        }
        attributeChangedCallback(name, oldV, newV) {
            for (const prop of this.__properties) {
                if (prop.attribute === name && prop.name in this) {
                    //@ts-ignore
                    this[prop.name] = newV;
                    break;
                }
            }
        }
    }
    Components.CElement = CElement;
})(Components || (Components = {}));
(function (Components) {
    var GetSet;
    (function (GetSet) {
        function propGetter(element, component, info) {
            return () => {
                if (!(info.name in component))
                    throw new Error("Unknown property: " + String(info.name));
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
            };
        }
        GetSet.propGetter = propGetter;
        function propSetter(element, component, info) {
            return arg => {
                if (info.readonly)
                    throw new Error("Tried to set a readonly property: " + String(info.name));
                if (!(info.name in component))
                    throw new Error("Unknown property: " + String(info.name));
                if (info.type === "string")
                    arg = String(arg);
                else if (info.type === "boolean")
                    arg = Boolean(arg);
                else if (info.type === "number")
                    arg = Number(arg);
                else
                    throw new Error("Unknown property type: " + info.type);
                //@ts-ignore
                component[info.name] = arg;
                if (info.connection === "two-way")
                    element.setAttribute(info.attribute, String(arg));
                Component.render(component);
            };
        }
        GetSet.propSetter = propSetter;
        function methodGetter(element, component, info) {
            return () => {
                if (!(info.name in component))
                    throw new Error("Unknown property: " + String(info.name));
                //@ts-ignore
                const value = component[info.name];
                if (!(typeof value === "function"))
                    throw new Error(String(info.name) + " is not a function.");
                return value.bind(component);
            };
        }
        GetSet.methodGetter = methodGetter;
        function eventGetter(element, component, info) {
            return args => {
                if (!(info.function in component))
                    throw new Error("Unknown callback: " + String(info.function));
                //@ts-ignore
                const value = component[info.function];
                if (!(typeof value === "function"))
                    throw new Error(String(info.function) + " is not a function.");
                value.bind(component)(args);
            };
        }
        GetSet.eventGetter = eventGetter;
    })(GetSet = Components.GetSet || (Components.GetSet = {}));
})(Components || (Components = {}));
(function (Components) {
    var Information;
    (function (Information) {
        function defineProperty(component, property) {
            const properties = Information.propertyList.get(Object.getPrototypeOf(component));
            if (!properties)
                Information.propertyList.set(Object.getPrototypeOf(component), new Set([property]));
            else
                properties.add(property);
        }
        Information.defineProperty = defineProperty;
        function defineMethod(component, method) {
            const methods = Information.methodList.get(Object.getPrototypeOf(component));
            if (!methods)
                Information.methodList.set(Object.getPrototypeOf(component), new Set([method]));
            else
                methods.add(method);
        }
        Information.defineMethod = defineMethod;
        function defineEvent(component, event) {
            const events = Information.eventList.get(Object.getPrototypeOf(component));
            if (!events)
                Information.eventList.set(Object.getPrototypeOf(component), new Set([event]));
            else
                events.add(event);
        }
        Information.defineEvent = defineEvent;
        function properties(component) {
            const properties = Information.propertyList.get(Object.getPrototypeOf(component));
            return properties
                ? [...properties]
                : [];
        }
        Information.properties = properties;
        function methods(component) {
            const methods = Information.methodList.get(Object.getPrototypeOf(component));
            return methods
                ? [...methods]
                : [];
        }
        Information.methods = methods;
        function events(component) {
            const events = Information.eventList.get(Object.getPrototypeOf(component));
            return events
                ? [...events]
                : [];
        }
        Information.events = events;
        function stylesheet(path) {
            if (Information.stylesheetList.has(path))
                return new Promise(resolve => resolve(Information.stylesheetList.get(path)));
            return new Promise((resolve, reject) => fetch(path)
                .then(response => response.text())
                .then(style => {
                Information.stylesheetList.set(path, style);
                resolve(style);
            })
                .catch(reject));
        }
        Information.stylesheet = stylesheet;
        function stylesheets(paths) {
            const promises = [];
            for (const path of paths)
                promises.push(stylesheet(path));
            return Promise.all(promises);
        }
        Information.stylesheets = stylesheets;
        Information.propertyList = new Map();
        Information.methodList = new Map();
        Information.eventList = new Map();
        Information.stylesheetList = new Map();
    })(Information = Components.Information || (Components.Information = {}));
})(Components || (Components = {}));
export class Component {
    constructor(element, stylesheets) {
        this._element = element;
        this._root = element.attachShadow({ mode: "open" });
        if (stylesheets)
            stylesheets.then(sheets => {
                for (const sheet of sheets) {
                    const style = document.createElement("style");
                    style.innerHTML = sheet;
                    this._root.insertBefore(style, this._root.firstChild);
                }
            });
    }
    static render(component) {
        const renderHtml = (html) => {
            if (!component._renderer) {
                const build = Template.build(html.markup);
                component._root.appendChild(build.element);
                component._renderer = build.apply;
                if ('setup' in component && typeof component['setup'] === "function")
                    component['setup']();
            }
            component._renderer(html.args);
            component.event("render", { args: html.args });
        };
        const html = component.render();
        'markup' in html
            ? renderHtml(html)
            : html
                .then(renderHtml)
                .catch(console.warn);
    }
    static setupEvents(component, events) {
        const setup = (root, info) => root.addEventListener(info.event, Components.GetSet.eventGetter(component._element, component, info));
        for (const event of events)
            event.forRoot
                ? setup(component._root, event)
                : setup(component._element, event);
    }
    event(event, detail, info) {
        this._element.dispatchEvent(new CustomEvent(event, Object.assign({ detail }, info)));
    }
    attr(name, newValue) {
        if (newValue === null) {
            this._element.removeAttribute(name);
            return null;
        }
        else if (newValue === undefined) {
            return this._element.getAttribute(name);
        }
        else {
            this._element.setAttribute(name, newValue);
            return newValue;
        }
    }
    rerender() {
        Component.render(this);
    }
    query(selector) { return this._root.querySelector(selector); }
    queryAll(selector) { return this._root.querySelectorAll(selector); }
    get classList() { return this._element.classList; }
    get children() { return this._element.children; }
    get root() { return this._root; }
    get element() { return this._element; }
}
export function Tag(tag, stylesheets) {
    return (target) => {
        const attributes = [];
        for (const { attribute } of Components.Information.properties(target.prototype))
            attributes.push(attribute);
        const stylePromise = stylesheets
            ? Components.Information.stylesheets(stylesheets)
            : undefined;
        const element = class extends Components.CElement {
            static get observedAttributes() { return attributes; }
            constructor() {
                super(target, stylePromise);
            }
        };
        customElements.define(tag, element);
    };
}
export function Prop(settings) {
    return (target, key) => {
        const info = {
            attribute: String(key).replace(/\_/g, "-"),
            name: key,
            type: "string",
            readonly: false,
            connection: "one-way",
            onchange: undefined
        };
        if (settings) {
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
    };
}
export function Method(settings) {
    return (target, key, descriptor) => {
        descriptor.writable = false;
        descriptor.configurable = false;
        const info = {
            name: key
        };
        Components.Information.defineMethod(target, info);
    };
}
export function On(event) {
    return (target, key, descriptor) => {
        descriptor.writable = false;
        descriptor.configurable = false;
        const info = {
            function: key,
            event: event,
            forRoot: true
        };
        Components.Information.defineEvent(target, info);
    };
}
