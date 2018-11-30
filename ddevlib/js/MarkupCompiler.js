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
                .symbol("tag open", /(?<=\<)\w.*?(?=(\>|\s.*?\>))/g)
                .symbol("tag close", /(?<=\<\/)\w.*?(?=>)/g)
                .symbol("property", /(?<=\s)\w(\w|\d|-|_)*?(?==)/g)
                .symbol("string", /(?<==)".*?"(?=(\>|\s))/g);
        }
        if (lang == "JS") {
            compiler.buildSymbols()
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
                .symbol("function", /(?<=\W)\w[^\W(]*?\s*?(?=\()/g)
                .symbol("property", /(?<=\.)\w[^\W(]*?(?!\()(?=\W)/g)
                .symbol("object", /(?<=class\s).*?(?=\s)/g)
                .symbol("object", /(?<!(\w|\.))\w*?(?<!this)(?=\s*?\.)/g)
                .symbol("string", /".*?[^(\\")]"/g)
                .symbol("string", /'.*?[^(\\')]'/g);
        }
        if (lang === "TEXT") {
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
        symbol(name, pattern) {
            this.compiler.symbols.push({
                name: name,
                pattern: pattern,
                importance: this.compiler.symbols.length
            });
            return this;
        }
        word(name, value) {
            const wordStart = /((?<=^)|(?<=\W))/g;
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
    let Helpers;
    (function (Helpers) {
        function escape(value) {
            return value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
                .replace(/\s/g, "&nbsp;");
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
            const symbol = {
                name: name,
                pattern: /THIS_IS_NOT_A_USED_PATTERN/g,
                importance: 999999
            };
            const addToken = (value) => leftovers.push({ index: lastEnd, value: (value), symbol: symbol });
            const leftovers = [];
            while (tokenExists()) {
                addToken(textBeforeToken());
                nextToken();
            }
            addToken(source.substring(lastEnd));
            return leftovers;
        }
        Helpers.findTextAsTokens = findTextAsTokens;
        function tokenMarkup(token) {
            return `<span class="token ${token.symbol.name}">${escape(token.value)}</span>`;
        }
        Helpers.tokenMarkup = tokenMarkup;
        function markup(sortedTokens) {
            let html = "";
            for (const token of sortedTokens)
                html += tokenMarkup(token);
            return html;
        }
        Helpers.markup = markup;
    })(Helpers = MarkupCompiling.Helpers || (MarkupCompiling.Helpers = {}));
})(MarkupCompiling || (MarkupCompiling = {}));
//# sourceMappingURL=MarkupCompiler.js.map