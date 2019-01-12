export namespace Form {
    export function value (form: string | HTMLElement, ...fields: string[]) {
        const obj: any = {};

        for (const [name, value] of _Helper.getFields(_Helper.form(form), fields)) 
            obj[name] = value.value;

        return obj;
    }

    export function json (form: string | HTMLElement, ...fields: string[]) {
        try {
            return JSON.stringify(value(form, ...fields));
        } catch (error) {
            console.warn("Failed to parse json");
            return "{}";
        }
    }

    export function clear (form: string | HTMLElement, ...fields: string[]) {
        for (const [name, value] of _Helper.getFields(_Helper.form(form), fields)) 
            _Helper.applyField(value.field, null);
    }

    export function apply (form: string | HTMLElement, data: any) {
        const fields = Object.getOwnPropertyNames(data);

        for (const [name, value] of _Helper.getFields(_Helper.form(form)))
            if (fields.includes(name))
                _Helper.applyField(value.field, data[name]);
    }

    export function on (form: string | HTMLElement, event: "click" | "input", callback: Function, ... elements: (HTMLElement | string)[]) {
        form = _Helper.form(form);

        if (elements.length === 0) {
            if (event === "click")
                form.addEventListener("click", callback as () => void);
            else if (event === "input")
                for (const [name, field] of _Helper.getFields(form))
                    field.field.addEventListener("input", callback as () => void);
        }
        else {
            const find = (original: HTMLElement | string) => {
                if (typeof original === "string")
                    original = document.getElementById(original) as HTMLElement;

                return original;
            }

            for (const element of elements)
                find(element).addEventListener(event, callback as () => void);
        }
    }
}

export namespace Form._Settings {
    export let nameBeforeId = true;
    export let defaultDate: "TODAY" | string | number = "TODAY"
}

export namespace Form._Helper {
    export function form (form: string | HTMLElement) {
        if (form instanceof HTMLElement)
            return form;
            
        if (typeof form === "string")
        {
            const formEl = document.getElementById(form);

            if (formEl !== null && formEl !== undefined)
                return formEl;
            
            throw new Error("Failed to locate form with id: " + form);
        }

        throw new Error(`Invalid form type provided`);
    }

    export function isInputElement (element: HTMLElement) {
        const inputTags = [
            "input",
            "textarea",
            "select"
        ]
        if (inputTags.includes(element.tagName.toLowerCase()))
            return true;

        if (element.contentEditable === "true")
            return true;

        return false;
    }

    export function getFieldElements (element: HTMLElement) {
        const fieldElements: HTMLElement[] = [];

        const getFields = (element: HTMLElement) => {
            for (const child of element.children) {

                if (isInputElement(child as HTMLElement))
                    fieldElements.push(child as HTMLElement);

                if (child.childElementCount > 0)
                    getFields(child as HTMLElement);
            }
        }

        getFields(element);
        return fieldElements;
    }

    export function nameOfField(field: HTMLElement) {
        let priority_1: string | null = field.getAttribute("name");
        let priority_2: string | null = field.id;

        if (!Form._Settings.nameBeforeId)
            [priority_1, priority_2] = [priority_2, priority_1];

        if (priority_1)
            return priority_1;

        if (priority_2)
            return priority_2;

        throw new Error("Faile to deduce name. Element has no name and no id");
    }

    export function valueOfField(field: HTMLElement) {
        const tag = field.tagName.toLowerCase();

        if (tag === "input")
            return valueOfInput(field as HTMLInputElement);
        
        if (tag === "textarea")
            return (field as HTMLTextAreaElement).value;
        
        if (tag === "select")
            return (field as HTMLSelectElement).value;

        if (field.contentEditable === "true")
            return field.innerText;

        throw Error("Invalid field type");
    }

    export function valueOfInput(field: HTMLInputElement) {
        const type = field.type.toLocaleLowerCase();
        
        if (type === "checkbox")
            return field.checked;

        if (type === "range" || type === "number")
            return field.valueAsNumber;

        if (type === "date" || type === "time")
            return field.valueAsDate;

        if (type === "file")
            return field.files;

        // Normal cases
        return field.value;
    }

    export function applyField(field: HTMLElement, value: any) {
        const tag = field.tagName;

        if (tag === "input")
            return applyInputField(field as HTMLInputElement, value);
        
        if (value === null)
            value = "";

        if (typeof value !== "string")
            throw new Error("Wrong value type");

        if (tag === "textarea")
            (field as HTMLTextAreaElement).value = value;
        
        if (tag === "select")
            (field as HTMLSelectElement).value = value;

        if (field.contentEditable === "true")
            field.innerText = value;

        throw Error("Invalid field type");
    }

    export function applyInputField(field: HTMLInputElement, value: any) {
        const type = field.type.toLocaleLowerCase();
        
        if (type === "checkbox" && typeof value === "boolean")
            field.checked = value;

        if ((type === "range" || type === "number") && (typeof value === "number" || value === null)) {
            if (value === null) {
                if (field.min)
                    value = Number(field.min);
                else
                    value = 0;
            }

            field.valueAsNumber = value;
        }

        if ((type === "date" || type === "time") && (typeof value === "number" ||typeof value === "string" || value instanceof Date || value === null)) {
            if (typeof value === "number" || typeof value === "string")
                field.valueAsDate = new Date(value);
            else if (value instanceof Date)
                field.valueAsDate = value;
            else {
                if (_Settings.defaultDate === "TODAY")
                    field.valueAsDate = new Date(Date.now());
                else
                    field.valueAsDate = new Date(_Settings.defaultDate);
            }
        }

        if (type === "file") {
            if (value === null || value === undefined)
                field.files = null;
            else
                throw new Error("Cannot change file input content!");
        }

        if (value === null)
            value = "";

        // Normal cases
        if (typeof value === "string")
            field.value = value;
        else
            throw new Error("Wrong value type");
    }

    export function getFields (form: HTMLElement, fieldNames?: string[]) {
        const fields = new Map<string, {field: HTMLElement, name: string, value: any}>();

        const tryCreate = (field: HTMLElement) => {
            try {
                return {
                    field: field,
                    name: nameOfField(field),
                    value: valueOfField(field)
                }
            } catch (error) {
                console.warn("Failed to parse field", field);
                return null
            }
        }

        const add = (field: {field: HTMLElement, name: string, value: any}) => {
            if (fields.has(field.name)) {
                if (field.field.tagName === "input" && 
                (field.field as HTMLInputElement).type === "radio" && 
                (field.field as HTMLInputElement).checked) {
                    fields.set(field.name, field);
                } else
                    console.warn("There are two fields with the same name (" + field.name + ") that are not radio buttons");
            } else {
                fields.set(field.name, field);
            }
        }

        const include = (obj: {field: HTMLElement, name: string, value: any} | null) => {
            if (obj === null || obj === undefined)
                return false;
            
            if (fieldNames === null || fieldNames === undefined || fieldNames.length === 0)
                return true;

            if (fieldNames.includes(obj.name))
                return true;

            return false;
        }

        for (const field of Form._Helper.getFieldElements(form)) {
            const obj = tryCreate(field);
            
            if (include(obj))
            //@ts-ignore
                add(obj);
        }

        return fields;
    }
}