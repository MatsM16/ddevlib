import { Binary } from "./Binary.js";

export type FormFieldData = 
{
    name: string;
    get: () => any;
    clear: () => void;
    set: (v: any) => void;

    onchange: (v: EventListener) => void;
}

export class Form
{
    static fromRoot(root: HTMLElement)
    {
        const fields = Forms.Creation.fields(root);
        const form = new Form()

        form._fields = fields;

        return form;
    }

    private _fields: FormFieldData[];

    private constructor()
    {
        this._fields = [];
    }

    get(...fields: string[])
    {
        const obj: any = {};

        for (const {name, get} of this._fields)
            if (fields.length === 0 || fields.includes(name))
                obj[name] = get();

        return obj;
    }

    set(value: Record<string, any>)
    {
        for (const key in value)
            for (const {name, set} of this._fields)
                if (key === name)
                    set(value[key]);
    }

    toJson(...fields: string[])
    {
        return JSON.stringify(this.get(...fields));
    }

    getWithFileData(...fields: string[]): Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            const data = this.get(...fields);

            const promsises: Promise<any>[] = [];

            for (const key in data)
            {
                if (data[key] instanceof FileList)
                {
                    promsises.push(new Promise<any>((_res, _rej) =>
                    {
                        const files = [];
                        for (const file of data[key] as FileList)
                            files.push(Binary.read(file, "dataURL"));
                        
                        Promise.all(files)
                            .then(dataURLs => {data[key] = dataURLs; _res()})
                            .catch(_rej)
                    }));
                }
            }
            
            Promise.all(promsises)
                    .then(() => resolve(data))
                    .catch(reject);
        })
    }

    toJsonWithFileData(...fields: string[]): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            this.getWithFileData(...fields)
                .then(data => resolve(JSON.stringify(data)))
                .catch(reject)
        })
    }

    clear()
    {
        for (const {clear} of this._fields)
            clear();
    }

    onchange(cb: EventListener)
    {
        for (const {onchange} of this._fields)
            onchange(cb);
    }

    addForm(name: string, form: Form)
    {
        this._fields.push({
            name,
            get: () => form.get(),
            set: v => form.set(v),
            clear: () => form.clear(),
            onchange: cb => form.onchange(cb)
        })
    }
}

export namespace Forms.Creation
{
    export function fields (root: HTMLElement, fieldList?: FormFieldData[])
    {
        if (!fieldList)
            fieldList = radioInputs(root); // Set here to ensure it's only called once

        const formField = field(root);

        if (formField)
            fieldList.push(formField)
        else
        {
            for (const child of root.children)
                fields(child as HTMLElement, fieldList);
        }

        return fieldList;
    }

    export function field(el: HTMLElement): FormFieldData | null
    {
        switch (el.tagName.toLowerCase())
        {
            case "input": 
                return input(el as HTMLInputElement);

            case "select": 
                return select(el as HTMLSelectElement);

            case "textarea": 
                return textarea(el as HTMLTextAreaElement);
        }

        if (el.hasAttribute("contenteditable") && 
            el.getAttribute("contenteditable") !== "false")
        {
            return contenteditable(el);
        }

        return null;
    }

    export function nameof(input: HTMLElement)
    {
        const getAtt = (name: string) => input.getAttribute(name) || "";

        if (getAtt("data-name"))
            return getAtt("data-name")
        
        if (input.id)
            return input.id;

        if (getAtt("name"))
            return getAtt("name");

        if (getAtt("title"))
            return getAtt("title");

        throw new Error("Unable to get name");
    }

    export function radioInputs(root: HTMLElement): FormFieldData[]
    {
        const fields: FormFieldData[] = [];
        const radios = root.querySelectorAll("input[type='radio']") as NodeListOf<HTMLInputElement>;
        const groups: Record<string, HTMLInputElement[]> = {};

        for (const radio of radios)
        {
            const name = radio.name;

            if (!(name in groups))
                groups[name] = [];

            groups[name].push(radio);
        }

        for (const name in groups)
        {
            const rbs = groups[name];

            const get = () =>
            {
                let v = rbs[0].value;
                for (const rb of rbs)
                    if (rb.checked)
                        v = rb.value;
                return v;
            }

            const set = (v: any) =>
            {
                for (const rb of rbs)
                    rb.checked = rb.value === v;
            }

            const clear = () =>
            {
                for (const rb of rbs)
                    rb.checked = rb.hasAttribute("checked") && rb.getAttribute("checked") !== "false";
            }

            const onchange = (cb: EventListener) =>
            {
                for (const rb of rbs)
                    rb.onchange = cb;
            }

            fields.push({ name, get, set, clear, onchange });
        }

        return fields;
    }

    export function input(input: HTMLInputElement): FormFieldData | null
    {
        const type = input.type.toLowerCase();
        const name = nameof(input);

        // Handled elsewhere
        if (type === "radio") return null;

        if (type === "checkbox") return {
            name,
            clear: () => input.checked = input.hasAttribute("checked") && input.getAttribute("checked") !== "false",
            get: () => input.checked,
            set: v => input.checked = Boolean(v),
            onchange: c => input.onchange = c
        }

        if (type === "date" || 
            type === "time" || 
            type === "datetime" || 
            type === "datetime-local" || 
            type === "week" ||
            type === "month") return {
                name,
                clear: () => input.valueAsDate = new Date(),
                get: () => input.valueAsDate,
                set: v => input.valueAsDate = new Date(v),
                onchange: c => input.onchange = c
        }

        if (type === "file") return {
            name,
            clear: () => input.files = new FileList(),
            get: () => input.files,
            set: v => {},
            onchange: c => input.onchange = c
        }

        if (type === "number" || type === "range") return {
            name,
            clear: () => input.valueAsNumber = isNaN(Number(input.getAttribute("min"))) ? 0 : Number(input.getAttribute("min")),
            get: () => input.valueAsNumber,
            set: v => input.valueAsNumber = Number(v),
            onchange: c => input.oninput = c
        }
        
        else return {
            name,
            clear: () => input.value = "",
            get: () => input.value,
            set: v => input.value = String(v),
            onchange: c => input.oninput = c
        }
    }

    export function select(input: HTMLSelectElement): FormFieldData
    {
        return {
            name: nameof(input),
            clear: () => input.selectedIndex = 0,
            get:   () => input.value,
            set:   v  => input.value = String(v),
            onchange: c => input.onchange = c
        }
    }

    export function textarea(input: HTMLTextAreaElement): FormFieldData
    {
        return {
            name: nameof(input),
            clear: () => input.value = "",
            get: () => input.value,
            set: v => input.value = String(v),
            onchange: c => input.oninput = c
        }
    }

    export function contenteditable(input: HTMLElement): FormFieldData
    {
        return {
            name: nameof(input),
            clear: () => input.innerText = "",
            get: () => input.innerText,
            set: v => input.innerText = String(v),
            onchange: c => input.oninput = c
        }
    }
}