export class SyntaxCompiler {
    constructor(builder) {
        this.symbols = [];
        if (builder)
            builder(this.createSymbolBuilder());
        // Bind to this
        this.compile = this.compile.bind(this);
        this.compileAsync = this.compileAsync.bind(this);
        this.createSymbolBuilder = this.createSymbolBuilder.bind(this);
    }
    createSymbolBuilder() { return new SymbolBuilder(this); }
    compile(source) {
        return new SyntaxCompilerJob(source, this.symbols).compile();
    }
    async compileAsync(source) {
        return new Promise((resolve, reject) => {
            try {
                const compiled = this.compile(source);
                resolve(compiled);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static compiler(language) {
        language = language.toUpperCase();
        const compiler = new SyntaxCompiler();
        if (language === "XML") {
            compiler.createSymbolBuilder()
                .symbol("comment", /<!--.*?-->/gs)
                .symbol("doctype", /<!DOCTYPE\s.+?>/gi)
                .symbol("tag open", /(?<=<)[-\w]+/g)
                .symbol("tag close", /(?<=<\/)[-\w]+/g)
                .symbol("string", /(?<==)"(.|\n)*?(?<!\\)"(?=[^<]*>)/g)
                .symbol("string", /(?<==)'(.|\n)*?(?<!\\)'(?=[^<]*>)/g)
                .symbol("property", /(?<=\s)[\w-]*(?=[^<]*>)/g)
                .symbol("keyword", /&(#|\w)(\w|\d|_)*?;/g);
        }
        if (language == "JS") {
            compiler.createSymbolBuilder()
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
                .symbol("function", /[a-zA-Z_][^\W(]*?\s*?(?=\()/g)
                .symbol("function", /[a-zA-Z_][^\W(]*?(?=\W*=\s*[(\w])/gm);
        }
        if (language === "JSON") {
            compiler.createSymbolBuilder()
                .symbol("property", /(?<=[,{[]\s*?)"(.|\n)*?(?<!\\)"(?=\s*?:)/gs)
                .symbol("string", /"(.|\n)*?(?<!\\)"/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*([eE](\+|\-))?\d*(?=\W|$)/g)
                .word("boolean", "true")
                .word("boolean", "false")
                .word("null", "null");
        }
        if (language === "CSS") {
            compiler.createSymbolBuilder()
                .symbol("comment", /\/\*.*?\*\//gs)
                .symbol("object id", /#[\w-]+(?=[^\};]*{)/gm)
                .symbol("object class", /\.[\w-]+(?=[^\};]*{)/gm)
                .symbol("object element", /(?<=[\s\n$])[\w-]+(?=[^\}]*{)/gm)
                .symbol("keyword", /[\w-]+(?=\s*:\s*[^{]*})/gm)
                .symbol("function", /(?<=\W)[a-zA-Z_][^\W(]*?\s*?(?=\()/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*\w*(?=\W|$)/g)
                .symbol("string", /--[\w-]*(?=\s*[\),])/gm);
        }
        return compiler.compile;
    }
    static compilerAsync(language) {
        return async (source) => new Promise((resolve, reject) => resolve(SyntaxCompiler.compiler(language)));
    }
}
export class SymbolBuilder {
    constructor(compiler) {
        this.compiler = compiler;
    }
    symbol(name, pattern, composeFunction) {
        const comp = composeFunction ? composeFunction : (token) => `<span class="token ${token.symbol.name}">${SyntaxCompilerJob.escape(token.value)}</span>`;
        this.compiler.symbols.push({
            name: name,
            pattern: pattern,
            importance: this.compiler.symbols.length,
            compose: comp
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
export class SyntaxCompilerJob {
    constructor(source, symbols) {
        this.tokens = [];
        this.symbols = symbols;
        this.source = source;
    }
    compile() {
        for (const symbol of this.symbols)
            this.tokens.push(...SyntaxCompilerJob._findSymbol(this.source, symbol));
        this._sort();
        this.tokens = SyntaxCompilerJob._removeOverlappingTokens(this.tokens);
        this.tokens.push(...SyntaxCompilerJob._findTextTokens(this.source, this.tokens));
        this._sort();
        return SyntaxCompilerJob._compose(this.tokens);
    }
    _sort() {
        this.tokens.sort((a, b) => a.index - b.index);
    }
    static _findTextTokens(source, tokens) {
        let lastEnd = 0;
        let tokenIndex = 0;
        const textBeforeToken = () => source.substring(lastEnd, tokens[tokenIndex].index);
        const nextToken = () => {
            lastEnd = tokens[tokenIndex].index + tokens[tokenIndex].value.length;
            tokenIndex++;
        };
        const tokenExists = () => tokenIndex >= 0 && tokenIndex < tokens.length;
        const addToken = (value) => leftovers.push({
            index: lastEnd,
            value: value,
            symbol: SyntaxCompilerJob.defaultTextSymbol()
        });
        const leftovers = [];
        while (tokenExists()) {
            addToken(textBeforeToken());
            nextToken();
        }
        addToken(source.substring(lastEnd));
        return leftovers;
    }
    static _findSymbol(source, symbol) {
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
    static _removeOverlappingTokens(tokens) {
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
        // Remove overlapping tokens based on importance
        for (let i = tokens.length - 1; i >= 0; i--)
            for (const check of tokens)
                if (doNotIncludeToken(tokens[i], check))
                    tokens.splice(i, 1);
        return tokens;
    }
    static _compose(tokens) {
        let html = "";
        for (const token of tokens)
            html += token.symbol.compose(token);
        return html;
    }
    static defaultCompose(token) {
        return `<span class="token ${token.symbol.name}">${SyntaxCompilerJob.escape(token.value)}</span>`;
    }
    static defaultTextSymbol() {
        return {
            name: "text",
            pattern: /THIS_IS_NOT_A_USED_PATTERN/g,
            importance: 999999,
            compose: this.defaultCompose
        };
    }
    static escape(html) {
        return html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")
            .replace(/\s/g, "&nbsp;")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
}
//# sourceMappingURL=SyntaxCompiler.js.map