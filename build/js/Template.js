export var Template;
(function (Template) {
    function markup(template) {
        let markup = "";
        for (let i = 0; i < template.length; i++)
            markup += i < template.length - 1
                ? template[i] + `{{${i}}}`
                : template[i];
        return markup;
    }
    Template.markup = markup;
    function template(markup) {
        // Check if template is already created
        // Return created template
        const template = document.createElement("template");
        template.innerHTML = markup;
        // Add template to template db
        return template;
    }
    Template.template = template;
    function build(markup) {
        const template = Template.template(markup);
        const element = template.content.cloneNode(true);
        const variables = Template.Variables.all(element);
        const apply = (args) => {
            if (args.length !== variables.length)
                console.warn("Expected " + variables.length + " arguments, recieved " + args.length + "!");
            if (args.length < variables.length)
                throw new Error("Too few arguments provided!");
            for (const { set, id } of variables)
                if (set(args[id]))
                    throw new Error("Failed to set argument [" + id + "]: " + String(args[id]));
        };
        return {
            element,
            apply
        };
    }
    Template.build = build;
})(Template || (Template = {}));
(function (Template) {
    var Variables;
    (function (Variables) {
        function all(element, list) {
            if (!list)
                list = [];
            if (element.nodeType === Node.TEXT_NODE)
                list.push(...fromText(element));
            else if ('attributes' in element)
                for (const attribute of element.attributes)
                    list.push(...fromAttribute(attribute));
            for (const child of element.childNodes)
                all(child, list);
            return list;
        }
        Variables.all = all;
        function info(str) {
            let lastVariableIndex = 0;
            if (!str || str.trim() === "")
                return [];
            const findNext = () => {
                const start = str.indexOf("{{", lastVariableIndex);
                const end = str.indexOf("}}", start);
                if (start < 0 || end < 0)
                    return null;
                const before = str.substring(lastVariableIndex, start);
                const after = str.substring(end + 2);
                const length = end - start + 2;
                const id = Number(str.substring(start + 2, end));
                lastVariableIndex = end + 2;
                if (length === 2 || isNaN(id))
                    return null;
                return {
                    before,
                    after,
                    id,
                    length
                };
            };
            const variables = [];
            let variable = findNext();
            while (variable !== null) {
                variables.push(variable);
                variable = findNext();
            }
            return variables;
        }
        Variables.info = info;
        function fromText(text) {
            const next = text.nextSibling;
            const parent = text.parentNode;
            const value = text.textContent;
            const insert = (n) => parent
                ? parent.insertBefore(n, next)
                : undefined;
            const inf = info(value);
            const variables = [];
            inf.forEach((info, i) => {
                const before = document.createTextNode(info.before);
                const anchor = document.createComment("Variable: {{" + info.id + "}}");
                let lastVal = null;
                insert(before);
                insert(anchor);
                if (i === inf.length - 1)
                    insert(document.createTextNode(info.after));
                variables.push({
                    id: info.id,
                    set: (arg) => {
                        if (arg === lastVal || !anchor.parentNode)
                            return;
                        lastVal = arg;
                        text.remove();
                        while (before.nextSibling && before.nextSibling !== anchor)
                            anchor.parentNode.removeChild(before.nextSibling);
                        for (const node of compose(arg, true))
                            anchor.parentNode.insertBefore(node, anchor);
                    }
                });
            });
            return variables;
        }
        Variables.fromText = fromText;
        function fromAttribute(attr) {
            // Event callback
            if (attr.name.startsWith("@")) {
                const element = attr.ownerElement;
                if (!element) {
                    console.warn("Failed to handle event binding", attr);
                    return [];
                }
                const name = attr.name.substr(1);
                const id = Number(attr.value.slice(2, -2));
                let last = null;
                return [{
                        id,
                        set: arg => {
                            if (arg === last || typeof arg !== "function")
                                return;
                            if (last)
                                element.removeEventListener(name, last);
                            element.addEventListener(name, arg);
                            last = arg;
                        }
                    }];
            }
            // Attribute
            else {
                const template = attr.value;
                const values = {};
                const compileAttributeValue = () => {
                    let compiled = template;
                    for (const id in values)
                        compiled = compiled.replace("{{" + id + "}}", values[id]);
                    attr.value = compiled;
                };
                const variables = [];
                for (const inf of info(attr.value)) {
                    let last = null;
                    values[inf.id] = "";
                    variables.push({
                        id: inf.id,
                        set: arg => {
                            if (arg === last)
                                return;
                            last = arg;
                            const t = typeof arg;
                            if (t === "bigint" || t === "boolean" || t === "number" || t === "string")
                                values[inf.id] = String(arg);
                            else if (arg === null || arg === undefined)
                                values[inf.id] = "";
                            else if (Array.isArray(arg))
                                values[inf.id] = arg.join(" ");
                            else
                                console.warn("Failed to set attribute", attr, arg);
                            compileAttributeValue();
                        }
                    });
                }
                return variables;
            }
        }
        Variables.fromAttribute = fromAttribute;
        function compose(arg, canBeMarkup) {
            const t = typeof arg;
            if (t === "bigint" || t === "boolean" || t === "number" || t === "string" || t === "symbol")
                return [document.createTextNode(String(arg))];
            if (arg === null || arg === undefined || t === "undefined")
                return [];
            if (t === "function")
                return compose(arg());
            if (canBeMarkup && t === "object" && 'markup' in arg && 'args' in arg) {
                const build = Template.build(arg.markup);
                build.apply(arg.args);
                return [build.element];
            }
            if (canBeMarkup && Array.isArray(arg)) {
                const nodes = [];
                arg.forEach(a => nodes.push(...compose(a, true)));
                return nodes;
            }
            console.warn("Failed to compose argument:", arg);
            return [];
        }
        Variables.compose = compose;
    })(Variables = Template.Variables || (Template.Variables = {}));
})(Template || (Template = {}));
