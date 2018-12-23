export class MarkupCompiler {
    constructor() {
        this.symbols = [];
    }
    buildSymbols() {
        return new MarkupCompiling.SymbolBuilder(this);
    }
    compile(source) {
        if (source === undefined || source === null)
            throw new Error("No source provided");
        let tokens;
        tokens = MarkupCompiling.Helpers.findAllSymbols(this.symbols, source);
        tokens = MarkupCompiling.Helpers.removeOverlappingTokens(tokens);
        tokens = MarkupCompiling.Helpers.sortTokens(tokens);
        tokens.push(...MarkupCompiling.Helpers.findTextAsTokens("text", tokens, source));
        tokens = MarkupCompiling.Helpers.sortTokens(tokens);
        return MarkupCompiling.Helpers.markup(tokens);
    }
    async compileAsync(source) {
        const ref = this;
        return new Promise((resolve, reject) => {
            try {
                const markup = ref.compile(source);
                resolve(markup);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static compiler(lang) {
        const compiler = new MarkupCompiler();
        if (lang === "XML") {
            compiler.buildSymbols()
                .symbol("comment", /<!--.*?-->/gs)
                .symbol("doctype", /<!DOCTYPE\s.+?>/gi)
                .symbol("tag open", /(?<=<)[-\w]+/g)
                .symbol("tag close", /(?<=<\/)[-\w]+/g)
                .symbol("string", /(?<==)"(.|\n)*?(?<!\\)"(?=[^<]*>)/g)
                .symbol("string", /(?<==)'(.|\n)*?(?<!\\)'(?=[^<]*>)/g)
                .symbol("property", /(?<=\s)[\w-]*(?=[^<]*>)/g)
                .symbol("keyword", /&(#|\w)(\w|\d|_)*?;/g);
        }
        if (lang == "JS") {
            compiler.buildSymbols()
                .symbol("comment", /\/\/.*?(?=\n|$)/g)
                .symbol("comment", /\/\*.*?\*\//gs)
                .symbol("string", /"(.|\n)*?(?<!\\)"/g)
                .symbol("string", /'(.|\n)*?(?<!\\)'/g)
                .symbol("string", /`(.|\n)*?(?<!\\)`/g)
                .symbol("object", /(?<=(class|new)\s*?)[a-zA-Z_]\w*/g)
                .symbol("object", /(?<!(\w|\.))[a-zA-Z_]+?(?<!this)(?=\s*?\.)/g)
                .symbol("property", /(?<=\.)[a-zA-Z_][^\W(]*?(?!\()(?=\W)/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*([eE](\+|\-))?\d*(?=\W|$)/g)
                .symbol("number", /(?<=\W|$)0x[a-fA-F0-9]+(?=\W|$)/g)
                .word("boolean", "true")
                .word("boolean", "false")
                .word("null", "null")
                .word("null", "undefined")
                .key("in")
                .key("of")
                .key("do")
                .key("if")
                .key("let")
                .key("var")
                .key("for")
                .key("new")
                .key("get")
                .key("set")
                .key("this")
                .key("with")
                .key("else")
                .key("class")
                .key("const")
                .key("await")
                .key("async")
                .key("while")
                .key("super")
                .key("return")
                .key("static")
                .key("export")
                .key("import")
                .key("typeof")
                .key("extends")
                .key("includes")
                .key("function")
                .key("instanceof")
                .key("constructor")
                .symbol("function", /(?<=\W)[a-zA-Z_][^\W(]*?\s*?(?=\()/g);
        }
        if (lang === "JSON") {
            compiler.buildSymbols()
                .symbol("property", /(?<=[,{[]\s*?)"(.|\n)*?(?<!\\)"(?=\s*?:)/gs)
                .symbol("string", /"(.|\n)*?(?<!\\)"/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*([eE](\+|\-))?\d*(?=\W|$)/g)
                .word("boolean", "true")
                .word("boolean", "false")
                .word("null", "null");
        }
        if (lang === "TEXT") {
            const composeColor = (token) => `<span class="token color" style="background-color: ${token.value};">${token.value}</span>`;
            compiler.buildSymbols()
                .symbol("color", /\#[a-fA-F0-9]{8}/g, composeColor)
                .symbol("color", /\#[a-fA-F0-9]{6}/g, composeColor)
                .symbol("color", /\#[a-fA-F0-9]{3}/g, composeColor);
        }
        if (lang === "CSS") {
            compiler.buildSymbols()
                .symbol("comment", /\/\*.*?\*\//gs)
                .symbol("object id", /#[\w-]+(?=[^\};]*{)/gm)
                .symbol("object class", /\.[\w-]+(?=[^\};]*{)/gm)
                .symbol("object element", /(?<=[\s\n$])[\w-]+(?=[^\}]*{)/gm)
                .symbol("keyword", /[\w-]+(?=\s*:\s*[^{]*})/gm)
                .symbol("function", /(?<=\W)[a-zA-Z_][^\W(]*?\s*?(?=\()/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*\w*(?=\W|$)/g)
                .symbol("string", /--[\w-]*(?=\s*[\),])/gm);
        }
        return compiler;
    }
    static compile(lang, source) {
        return MarkupCompiler.compiler(lang).compile(source);
    }
    static compileAsync(lang, source) {
        return MarkupCompiler.compiler(lang).compileAsync(source);
    }
}
export var MarkupCompiling;
(function (MarkupCompiling) {
    class SymbolBuilder {
        constructor(job) {
            this.compiler = job;
        }
        symbol(name, pattern, composer) {
            this.compiler.symbols.push({
                name: name,
                pattern: pattern,
                importance: this.compiler.symbols.length,
                compose: composer ? composer : MarkupCompiling.Composers.composeToken // custom or default composer
            });
            return this;
        }
        word(name, value) {
            const wordStart = /((?<=^)|(?<=\W)|(?<=\n))/gs;
            const wordEnd = /(?=(\W|$))/g;
            const pattern = new RegExp(wordStart.source + value + wordEnd.source, "g");
            return this.symbol(name, pattern);
        }
        key(value) {
            if (typeof value === "string")
                return this.word("keyword", value);
            else
                return this.symbol("keyword", value);
        }
    }
    MarkupCompiling.SymbolBuilder = SymbolBuilder;
    let Composers;
    (function (Composers) {
        function composeToken(token) {
            return `<span class="token ${token.symbol.name}">${MarkupCompiling.Helpers.escape(token.value)}</span>`;
        }
        Composers.composeToken = composeToken;
        Composers.textSymbol = {
            name: "text",
            pattern: /THIS_IS_NOT_A_USED_PATTERN/g,
            importance: 999999,
            compose: composeToken
        };
    })(Composers = MarkupCompiling.Composers || (MarkupCompiling.Composers = {}));
    let Helpers;
    (function (Helpers) {
        function escape(value) {
            return value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
                .replace(/\s/g, "&nbsp;")
                .replace(/\t/g, "TAB");
        }
        Helpers.escape = escape;
        function findSymbol(symbol, source) {
            let lastIndex = 0;
            let match;
            const pattern = symbol.pattern;
            const tokens = [];
            while ((match = pattern.exec(source)) !== null) {
                const isRepeating = pattern.lastIndex === match.index || pattern.lastIndex === lastIndex;
                if (isRepeating)
                    pattern.lastIndex++;
                else
                    lastIndex = pattern.lastIndex;
                tokens.push({
                    index: match.index,
                    value: (match[0]),
                    symbol: symbol
                });
            }
            return tokens;
        }
        Helpers.findSymbol = findSymbol;
        function findAllSymbols(symbols, source) {
            const tokens = [];
            for (const symbol of symbols)
                tokens.push(...findSymbol(symbol, source));
            return tokens;
        }
        Helpers.findAllSymbols = findAllSymbols;
        function sortTokens(tokens) {
            return tokens.sort((a, b) => a.index - b.index);
        }
        Helpers.sortTokens = sortTokens;
        function removeOverlappingTokens(tokens) {
            const handled = [];
            const isOverlapping = (token, check) => {
                if (check === token)
                    return false;
                const tokenStart = token.index;
                const checkStart = check.index;
                const tokenEnd = token.index + token.value.length;
                const checkEnd = check.index + check.value.length;
                const partialEndOverlapp = checkEnd >= tokenStart && checkEnd <= tokenEnd; // |     [   ===]===  |  End after token start, but before token end 
                const partialStartOverlapp = checkStart >= tokenStart && checkStart <= tokenEnd; // |  ===[===   ]     |  Start after token start, but before token end 
                const fullInsideOverlap = checkStart >= tokenStart && checkEnd <= tokenEnd; // |     [  === ]     |  Start after token start, but end before token end 
                const fullOutsideOverlapp = checkStart <= tokenStart && checkEnd >= tokenEnd; // |  ===[===]===     |  Start before token start, but end after token end 
                if (partialStartOverlapp || partialEndOverlapp || fullInsideOverlap || fullOutsideOverlapp)
                    return true;
                else
                    return false;
            };
            const isLessImportant = (token, check) => {
                // First symbol has importance 0 (Most important)
                return token.symbol.importance > check.symbol.importance;
            };
            const doNotIncludeToken = (token, check) => {
                return isOverlapping(token, check) && isLessImportant(token, check);
            };
            // TODO: Find better way to remove overlapping tokens (Tokens are checked twice, once as token and once as check)
            for (const token of tokens) {
                let include = true;
                for (const check of tokens) {
                    if (doNotIncludeToken(token, check)) {
                        include = false;
                        break;
                    }
                }
                if (include)
                    handled.push(token);
            }
            return handled;
        }
        Helpers.removeOverlappingTokens = removeOverlappingTokens;
        function findTextAsTokens(name, sortedTokens, source) {
            let lastEnd = 0;
            let tokenIndex = 0;
            const textBeforeToken = () => source.substring(lastEnd, sortedTokens[tokenIndex].index);
            const nextToken = () => {
                lastEnd = sortedTokens[tokenIndex].index + sortedTokens[tokenIndex].value.length;
                tokenIndex++;
            };
            const tokenExists = () => tokenIndex >= 0 && tokenIndex < sortedTokens.length;
            const addToken = (value) => leftovers.push({
                index: lastEnd,
                value: value,
                symbol: MarkupCompiling.Composers.textSymbol
            });
            const leftovers = [];
            while (tokenExists()) {
                addToken(textBeforeToken());
                nextToken();
            }
            addToken(source.substring(lastEnd));
            return leftovers;
        }
        Helpers.findTextAsTokens = findTextAsTokens;
        function markup(sortedTokens) {
            let html = "";
            for (const token of sortedTokens)
                html += token.symbol.compose(token);
            return html;
        }
        Helpers.markup = markup;
    })(Helpers = MarkupCompiling.Helpers || (MarkupCompiling.Helpers = {}));
})(MarkupCompiling || (MarkupCompiling = {}));
//# sourceMappingURL=MarkupCompiler.js.map