
export class MarkupCompiler
{
    symbols: MarkupCompiling.Symbol[];

    constructor ()
    {
        this.symbols = [];
    }

    buildSymbols(): MarkupCompiling.SymbolBuilder
    {
        return new MarkupCompiling.SymbolBuilder(this);
    }

    compile(source: string)
    {
        if (source === undefined || source === null)
            throw new Error("No source provided");

        let tokens;
        tokens = MarkupCompiling.Helpers.findAllSymbols(this.symbols, source);
        tokens = MarkupCompiling.Helpers.removeOverlappingTokens(tokens);
        tokens = MarkupCompiling.Helpers.sortTokens(tokens);
        
        tokens.push(...MarkupCompiling.Helpers.findTextAsTokens("text", tokens, source));
        
        tokens = MarkupCompiling.Helpers.sortTokens(tokens);

        return MarkupCompiling.Helpers.markup(tokens)
    }

    async compileAsync(source: string)
    {
        const ref = this;
        return new Promise<string>((resolve, reject) => {
            try {
                const markup = ref.compile(source);
                resolve(markup);
            } catch (error) {
                reject(error);
            }
        });
    }

    static compiler(lang: CompilerLanguage)
    {
        const compiler = new MarkupCompiler();

        if (lang === "XML")
        {
            compiler.buildSymbols()
                .symbol("tag open", /(?<=\<)\w.*?(?=(\>|\s.*?\>))/g)
                .symbol("tag close", /(?<=\<\/)\w.*?(?=>)/g)
                .symbol("property", /(?<=\s)\w(\w|\d|-|_)*?(?==)/g)
                .symbol("string", /(?<==)".*?"(?=(\>|\s))/g);
        }

        if (lang == "JS")
        {
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

        if (lang === "TEXT")
        {

        }

        return compiler;
    }

    static compile(lang: CompilerLanguage, source: string)
    {
        return MarkupCompiler.compiler(lang).compile(source);
    }

    static compileAsync(lang: CompilerLanguage, source: string)
    {
        return MarkupCompiler.compiler(lang).compileAsync(source);
    }
}

export type CompilerLanguage = "XML" | "JS" | "TEXT" | "CS" | "C++" | "TS" | "CSS" | "HTML"

export namespace MarkupCompiling
{
    export interface Token
    {
        index: number,
        value: string,
        symbol: Symbol
    }

    export interface Symbol
    {
        name: string,
        pattern: RegExp,
        importance: number,
    }

    export class SymbolBuilder
    {
        compiler: MarkupCompiler;

        constructor(job: MarkupCompiler)
        {
            this.compiler = job;
        }

        public symbol(name: string, pattern: RegExp): SymbolBuilder
        {
            this.compiler.symbols.push({
                name: name,
                pattern: pattern,
                importance: this.compiler.symbols.length
            });

            return this;
        }

        public word(name: string, value: string): SymbolBuilder
        {
            const wordStart = /((?<=^)|(?<=\W))/g;
            const wordEnd = /(?=(\W|$))/g;

            const pattern = new RegExp(wordStart.source + value + wordEnd.source, "g");
            
            return this.symbol(name, pattern);
        }

        public key (value: string | RegExp): SymbolBuilder
        {
            if (typeof value === "string")
                return this.word("keyword", value);
            else
                return this.symbol("keyword", value);
        }
    }

    export namespace Helpers
    {
        export function escape (value: string)
        {
            return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")
            .replace(/\s/g, "&nbsp;");
        }

        export function findSymbol (symbol: Symbol, source: string): Token[]
        {
            let lastIndex = 0;
            let match;
            
            const pattern = symbol.pattern;
            const tokens: Token[] = [];
    
            while ((match = pattern.exec(source)) !== null)
            {
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

        export function findAllSymbols (symbols: Symbol[], source: string)
        {
            const tokens: Token[] = [];
            for (const symbol of symbols)
                tokens.push(...findSymbol(symbol, source));

            
            return tokens;
        }

        export function sortTokens (tokens: Token[])
        {
            return tokens.sort((a, b) => a.index - b.index);
        }

        export function removeOverlappingTokens (tokens: Token[])
        {
            const handled = [];

            const isOverlapping = (token: Token, check: Token) =>
            {
                if (check === token)
                    return false;

                const tokenStart = token.index;
                const checkStart = check.index;
                
                const tokenEnd = token.index + token.value.length;
                const checkEnd = check.index + check.value.length;

                const partialEndOverlapp   = checkEnd   >= tokenStart && checkEnd   <= tokenEnd; // |     [   ===]===  |  End after token start, but before token end 
                const partialStartOverlapp = checkStart >= tokenStart && checkStart <= tokenEnd; // |  ===[===   ]     |  Start after token start, but before token end 
                const fullInsideOverlap    = checkStart >= tokenStart && checkEnd   <= tokenEnd; // |     [  === ]     |  Start after token start, but end before token end 
                const fullOutsideOverlapp  = checkStart <= tokenStart && checkEnd   >= tokenEnd; // |  ===[===]===     |  Start before token start, but end after token end 

                if (partialStartOverlapp || partialEndOverlapp || fullInsideOverlap || fullOutsideOverlapp)
                    return true;
                else
                    return false;
            }

            const isLessImportant = (token: Token, check: Token) =>
            {
                // First symbol has importance 0 (Most important)
                return token.symbol.importance > check.symbol.importance;
            }

            const doNotIncludeToken = (token: Token, check: Token) =>
            {
                return isOverlapping(token, check) && isLessImportant(token, check);
            }

            // TODO: Find better way to remove overlapping tokens (Tokens are checked twice, once as token and once as check)
            for (const token of tokens)
            {
                let include = true;

                for (const check of tokens)
                {
                    if (doNotIncludeToken(token, check))
                    {
                        include = false;
                        break;
                    }
                }

                if (include)
                    handled.push(token);
            }

            return handled;
        }

        export function findTextAsTokens(name: string, sortedTokens: Token[], source: string)
        {
            let lastEnd = 0;
            let tokenIndex = 0;

            const textBeforeToken = () => source.substring(lastEnd, sortedTokens[tokenIndex].index);
            const nextToken = () => 
            {
                lastEnd = sortedTokens[tokenIndex].index + sortedTokens[tokenIndex].value.length;
                tokenIndex++;
            }
            const tokenExists = () => tokenIndex >= 0 && tokenIndex < sortedTokens.length;

            const symbol: Symbol = {
                name: name,
                pattern: /THIS_IS_NOT_A_USED_PATTERN/g,
                importance: 999999
            }

            const addToken = (value: string) => leftovers.push({ index: lastEnd, value: (value), symbol: symbol });

            const leftovers: Token[] = [];
            while(tokenExists())
            {
                addToken(textBeforeToken());
                nextToken();
            }
            addToken(source.substring(lastEnd));

            return leftovers;
        }

        export function tokenMarkup(token: Token)
        {
            return `<span class="token ${token.symbol.name}">${escape(token.value)}</span>`;
        }

        export function markup(sortedTokens: Token[])
        {
            let html = "";
            for (const token of sortedTokens)
                html += tokenMarkup(token);
            return html;
        }
    }
}