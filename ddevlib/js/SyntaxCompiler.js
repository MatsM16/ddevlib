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
        const tokens = SyntaxCompiling.parse(source, this.symbols);
        const compiled = SyntaxCompiling.compose(tokens);
        return compiled;
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
    static getCompiler(syntax) {
        syntax = syntax.toUpperCase();
        const compiler = new SyntaxCompiler();
        const builder = compiler.createSymbolBuilder();
        if (syntax === "HTML") {
            const css = SyntaxCompiler.getCompiler("CSS").compile;
            const js = SyntaxCompiler.getCompiler("JS").compile;
            builder
                .symbol("css", /(?<=<style[\w\W]*>)(.+)(?=<\/\s*style\s*>)/gs, token => css(token.value))
                .symbol("css", /(?<=<style[\w\W]*>)(.+)(?=<\/\s*style\s*>)/gs, token => css(token.value))
                .symbol("js", /(?<=<script[\w\W]*>)(.+)(?=<\/\s*script\s*>)/gs, token => js(token.value));
        }
        if (syntax === "XML" || syntax === "HTML") {
            builder
                .symbol("comment", /<!--.*?-->/gs)
                .symbol("comment", /<!--.*?-->/gs);
            if (syntax === "HTML")
                builder
                    .symbol("doctype", /<!DOCTYPE\s.+?>/gi);
            builder
                .symbol("tag open", /(?<=<)[-\w]+/g)
                .symbol("tag close", /(?<=<\/)[-\w]+/g)
                .symbol("string", /(?<==)"(.|\n)*?(?<!\\)"(?=[^<]*>)/g)
                .symbol("string", /(?<==)'(.|\n)*?(?<!\\)'(?=[^<]*>)/g)
                .symbol("property", /(?<=\s)[\w-]*(?=[^<]*>)/g)
                .symbol("keyword", /&(#|\w)(\w|\d|_)*?;/g);
        }
        if (syntax == "JS") {
            builder
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
        if (syntax === "JSON") {
            builder
                .symbol("property", /(?<=[,{[]\s*?)"(.|\n)*?(?<!\\)"(?=\s*?:)/gs)
                .symbol("string", /"(.|\n)*?(?<!\\)"/g)
                .symbol("number", /(?<=(\W|$))\d+\.?\d*([eE](\+|\-))?\d*(?=\W|$)/g)
                .word("boolean", "true")
                .word("boolean", "false")
                .word("null", "null");
        }
        if (syntax === "CSS") {
            builder
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
    static compile(src, syntax) {
        return this.getCompiler(syntax).compile(src);
    }
    static async compileAsync(src, syntax) {
        return this.getCompiler(syntax).compileAsync(src);
    }
}
export class SymbolBuilder {
    constructor(compiler) {
        this.compiler = compiler;
    }
    symbol(name, pattern, composeInner) {
        this.compiler.symbols.push({
            name: name,
            pattern: pattern,
            importance: this.compiler.symbols.length,
            composeInner: composeInner
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
export var SyntaxCompiling;
(function (SyntaxCompiling) {
    function parse(src, symbols) {
        return Parsing.findTokens(symbols, src);
    }
    SyntaxCompiling.parse = parse;
    function compose(tokens) {
        let html = "";
        for (const token of tokens) {
            const start = `<span class="token ${token.symbol.name}">`;
            const end = `</span>`;
            const text = token.symbol.composeInner ? token.symbol.composeInner(token) : Composing.defaultCompose(token);
            html += start + text + end;
        }
        return html;
    }
    SyntaxCompiling.compose = compose;
    let Parsing;
    (function (Parsing) {
        function findTokens(symbols, src) {
            let tokens = [];
            // Find regular tokens
            for (const symbol of symbols)
                tokens.push(...findTokensOfSymbol(symbol, src));
            sort(tokens);
            tokens = removeOverlappingTokens(tokens);
            // Find text tokens
            tokens.push(...findTextTokens(tokens, src));
            sort(tokens);
            return tokens;
        }
        Parsing.findTokens = findTokens;
        function findTokensOfSymbol(symbol, src) {
            let lastIndex = 0;
            let match;
            const pattern = symbol.pattern;
            const tokens = [];
            while ((match = pattern.exec(src)) !== null) {
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
        Parsing.findTokensOfSymbol = findTokensOfSymbol;
        function findTextTokens(tokens, src) {
            let lastEnd = 0;
            let tokenIndex = 0;
            const textBeforeToken = () => src.substring(lastEnd, tokens[tokenIndex].index);
            const nextToken = () => {
                lastEnd = tokens[tokenIndex].index + tokens[tokenIndex].value.length;
                tokenIndex++;
            };
            const tokenExists = () => tokenIndex >= 0 && tokenIndex < tokens.length;
            const addToken = (value) => leftovers.push({
                index: lastEnd,
                value: value,
                symbol: textSymbol()
            });
            const leftovers = [];
            while (tokenExists()) {
                addToken(textBeforeToken());
                nextToken();
            }
            addToken(src.substring(lastEnd));
            return leftovers;
        }
        Parsing.findTextTokens = findTextTokens;
        function textSymbol() {
            return {
                name: "text",
                pattern: /THIS_IS_NOT_A_USED_PATTERN/g,
                importance: 999999
            };
        }
        Parsing.textSymbol = textSymbol;
        function sort(tokens) {
            tokens.sort((a, b) => a.index - b.index);
        }
        Parsing.sort = sort;
        function removeOverlappingTokens(tokens) {
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
            // Remove overlapping tokens based on importance | ERROR PRESENT
            for (let i = tokens.length - 1; i >= 0; i--)
                for (const check of tokens)
                    if (tokens[i])
                        if (doNotIncludeToken(tokens[i], check))
                            tokens.splice(i, 1);
            return tokens;
        }
        Parsing.removeOverlappingTokens = removeOverlappingTokens;
    })(Parsing = SyntaxCompiling.Parsing || (SyntaxCompiling.Parsing = {}));
    let Composing;
    (function (Composing) {
        function escape(html) {
            return html
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
                .replace(/\s/g, "&nbsp;")
                .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        }
        Composing.escape = escape;
        function defaultCompose(token) {
            return escape(token.value);
        }
        Composing.defaultCompose = defaultCompose;
    })(Composing = SyntaxCompiling.Composing || (SyntaxCompiling.Composing = {}));
})(SyntaxCompiling || (SyntaxCompiling = {}));
//# sourceMappingURL=SyntaxCompiler.js.map