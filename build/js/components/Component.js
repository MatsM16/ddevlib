var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from "../Html.js";
export var Components;
(function (Components) {
    var Description;
    (function (Description) {
        Description._descriptions = new Map();
        function info(prototype) {
            const found = Description._descriptions.get(prototype);
            if (found)
                return found;
            //@ts-ignore
            const info = {
                tagname: undefined,
                constructor: undefined,
                methods: [],
                properties: [],
                selfEvents: []
            };
            //@ts-ignore
            Description._descriptions.set(prototype, info);
            //@ts-ignore
            return info;
        }
        Description.info = info;
        function attributeNames(prototype) {
            return [];
        }
        Description.attributeNames = attributeNames;
    })(Description = Components.Description || (Components.Description = {}));
})(Components || (Components = {}));
(function (Components) {
    function handleProperty(component, element, property) {
    }
    Components.handleProperty = handleProperty;
})(Components || (Components = {}));
export class ComponentElement extends HTMLElement {
    static customElement(constructor) {
        return class extends ComponentElement {
            static get attributes() { return Components.Description.attributeNames(constructor.prototype); }
            constructor() {
                super(constructor);
            }
        };
    }
    constructor(constructor) {
        super();
        //
        // Handle pre init setup
        //
        this.__shadow = this.attachShadow({ mode: "open" });
        this.__info = Components.Description.info(constructor.prototype);
        //
        // Construct the component interface
        //
        this.__component = new constructor(this);
        //
        // Link
        for (const { key } of this.__info.properties) {
        }
    }
}
export class Component {
    get tag() { return this._element.tagName; }
    constructor(element) {
        this._element = element;
    }
}
export function component(tagname) {
    return (constructor) => {
        const info = Components.Description.info(constructor.prototype);
        info.tagname = tagname;
        info.constructor = constructor;
        const element = ComponentElement.customElement(constructor);
        customElements.define(tagname, element);
    };
}
export function prop() {
    return (prototype, key) => {
        const info = Components.Description.info(prototype);
        info.properties.push({
            attribute: String(key),
            initFromAttribute: true,
            key: key,
            readonly: false,
            type: "string",
            updateAttribute: false
        });
    };
}
export function method() {
    return (prototype, key, desc) => {
        const info = Components.Description.info(prototype);
        info.methods.push({
            key: key
        });
    };
}
let MyComponent = class MyComponent extends Component {
    constructor() {
        super(...arguments);
        this.value = "";
    }
    getValue() {
        return this.value;
    }
    render() {
        return html `My value is ${this.value}!`;
    }
};
__decorate([
    prop()
], MyComponent.prototype, "value", void 0);
__decorate([
    method()
], MyComponent.prototype, "getValue", null);
MyComponent = __decorate([
    component("my-component")
], MyComponent);
export { MyComponent };
