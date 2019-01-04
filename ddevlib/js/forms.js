export var Form;
(function (Form) {
    function value(form, ...fields) {
        const obj = {};
        for (const [name, value] of Form._Helper.getFields(Form._Helper.form(form), fields))
            obj[name] = value.value;
        return obj;
    }
    Form.value = value;
    function json(form, ...fields) {
        try {
            return JSON.stringify(value(form, ...fields));
        }
        catch (error) {
            console.warn("Failed to parse json");
            return "{}";
        }
    }
    Form.json = json;
    function clear(form, ...fields) {
        for (const [name, value] of Form._Helper.getFields(Form._Helper.form(form), fields))
            Form._Helper.applyField(value.field, null);
    }
    Form.clear = clear;
    function apply(form, data) {
        const fields = Object.getOwnPropertyNames(data);
        for (const [name, value] of Form._Helper.getFields(Form._Helper.form(form)))
            if (fields.includes(name))
                Form._Helper.applyField(value.field, data[name]);
    }
    Form.apply = apply;
    function on(form, event, callback, ...elements) {
        form = Form._Helper.form(form);
        if (elements.length === 0) {
            if (event === "click")
                form.addEventListener("click", callback);
            else if (event === "input")
                for (const [name, field] of Form._Helper.getFields(form))
                    field.field.addEventListener("input", callback);
        }
        else {
            const find = (original) => {
                if (typeof original === "string")
                    original = document.getElementById(original);
                return original;
            };
            for (const element of elements)
                find(element).addEventListener(event, callback);
        }
    }
    Form.on = on;
})(Form || (Form = {}));
(function (Form) {
    var _Settings;
    (function (_Settings) {
        _Settings.nameBeforeId = true;
        _Settings.defaultDate = "TODAY";
    })(_Settings = Form._Settings || (Form._Settings = {}));
})(Form || (Form = {}));
(function (Form) {
    var _Helper;
    (function (_Helper) {
        function form(form) {
            if (form instanceof HTMLElement)
                return form;
            if (typeof form === "string") {
                const formEl = document.getElementById(form);
                if (formEl !== null && formEl !== undefined)
                    return formEl;
                throw new Error("Failed to locate form with id: " + form);
            }
            throw new Error(`Invalid form type provided`);
        }
        _Helper.form = form;
        function isInputElement(element) {
            const inputTags = [
                "input",
                "textarea",
                "select"
            ];
            if (inputTags.includes(element.tagName.toLowerCase()))
                return true;
            if (element.contentEditable === "true")
                return true;
            return false;
        }
        _Helper.isInputElement = isInputElement;
        function getFieldElements(element) {
            const fieldElements = [];
            const getFields = (element) => {
                for (const child of element.children) {
                    if (isInputElement(child))
                        fieldElements.push(child);
                    if (child.childElementCount > 0)
                        getFields(child);
                }
            };
            getFields(element);
            return fieldElements;
        }
        _Helper.getFieldElements = getFieldElements;
        function nameOfField(field) {
            let priority_1 = field.getAttribute("name");
            let priority_2 = field.id;
            if (!Form._Settings.nameBeforeId)
                [priority_1, priority_2] = [priority_2, priority_1];
            if (priority_1)
                return priority_1;
            if (priority_2)
                return priority_2;
            throw new Error("Faile to deduce name. Element has no name and no id");
        }
        _Helper.nameOfField = nameOfField;
        function valueOfField(field) {
            const tag = field.tagName.toLowerCase();
            if (tag === "input")
                return valueOfInput(field);
            if (tag === "textarea")
                return field.value;
            if (tag === "select")
                return field.value;
            if (field.contentEditable === "true")
                return field.innerText;
            throw Error("Invalid field type");
        }
        _Helper.valueOfField = valueOfField;
        function valueOfInput(field) {
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
        _Helper.valueOfInput = valueOfInput;
        function applyField(field, value) {
            const tag = field.tagName;
            if (tag === "input")
                return applyInputField(field, value);
            if (value === null)
                value = "";
            if (typeof value !== "string")
                throw new Error("Wrong value type");
            if (tag === "textarea")
                field.value = value;
            if (tag === "select")
                field.value = value;
            if (field.contentEditable === "true")
                field.innerText = value;
            throw Error("Invalid field type");
        }
        _Helper.applyField = applyField;
        function applyInputField(field, value) {
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
            if ((type === "date" || type === "time") && (typeof value === "number" || typeof value === "string" || value instanceof Date || value === null)) {
                if (typeof value === "number" || typeof value === "string")
                    field.valueAsDate = new Date(value);
                else if (value instanceof Date)
                    field.valueAsDate = value;
                else {
                    if (Form._Settings.defaultDate === "TODAY")
                        field.valueAsDate = new Date(Date.now());
                    else
                        field.valueAsDate = new Date(Form._Settings.defaultDate);
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
        _Helper.applyInputField = applyInputField;
        function getFields(form, fieldNames) {
            const fields = new Map();
            const tryCreate = (field) => {
                try {
                    return {
                        field: field,
                        name: nameOfField(field),
                        value: valueOfField(field)
                    };
                }
                catch (error) {
                    console.warn("Failed to parse field", field);
                    return null;
                }
            };
            const add = (field) => {
                if (fields.has(field.name)) {
                    if (field.field.tagName === "input" &&
                        field.field.type === "radio" &&
                        field.field.checked) {
                        fields.set(field.name, field);
                    }
                    else
                        console.warn("There are two fields with the same name (" + field.name + ") that are not radio buttons");
                }
                else {
                    fields.set(field.name, field);
                }
            };
            const include = (obj) => {
                if (obj === null || obj === undefined)
                    return false;
                if (fieldNames === null || fieldNames === undefined || fieldNames.length === 0)
                    return true;
                if (fieldNames.includes(obj.name))
                    return true;
                return false;
            };
            for (const field of Form._Helper.getFieldElements(form)) {
                const obj = tryCreate(field);
                if (include(obj))
                    //@ts-ignore
                    add(obj);
            }
            return fields;
        }
        _Helper.getFields = getFields;
    })(_Helper = Form._Helper || (Form._Helper = {}));
})(Form || (Form = {}));
//# sourceMappingURL=Forms.js.map