export namespace MarkupCompiler
{
    export class Job
    {
        symbols: Symbol[];
        source?: string;

        constructor (source?: string)
        {
            this.symbols = [];
            this.source = source;
        }

        buildSymbols(): Helpers.SymbolCollectionBuilder
        {
            return new Helpers.SymbolCollectionBuilder(this);
        }

        run(source?: string)
        {
            if (source === undefined)
                source = this.source;

            if (source === undefined)
                throw new Error("No source provided");

            let tokens;
            tokens = Helpers.findAllSymbols(this.symbols, source);
            tokens = Helpers.removeOverlappingTokens(tokens);
            tokens = Helpers.sortTokens(tokens);
            
            tokens.push(...Helpers.findTextAsTokens("text", tokens, source));
            
            tokens = Helpers.sortTokens(tokens);

            return Helpers.markup(tokens)
        }

        async runAsync(source?: string)
        {
            const ref = this;
            return new Promise<string>((resolve, reject) => {
                try {
                    const markup = ref.run(source);
                    resolve(markup);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }

    export function compile (lang: "XML" | "JS", source: string)
    {
        const job = new Job(source);

        if (lang === "XML")
        {
            job.buildSymbols()
                .symbol("tag open", /(?<=\<)\w.*?(?=(\>|\s.*?\>))/g)
                .symbol("tag close", /(?<=\<\/)\w.*?(?=>)/g)
                .symbol("property", /(?<=\s)\w.*?(?==)/g)
                .symbol("string", /(?<==).*?"(?=(\>|\s))/g);
        }

        if (lang == "JS")
        {
            job.buildSymbols()
                .word("boolean", "true")
                .word("boolean", "false")

                .key("in")
                .key("of")
                .key("do")
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
                .key("return")
                .key("static")
                .key("export")
                .key("import")
                .key("function")
                .key("constructor")

                .symbol("function", /(?<=\W)\w[^\W(]*?\s*?(?=\()/g)
                .symbol("property", /(?<=\.)\w[^\W(]*?(?!\()(?=\W)/g)
                .symbol("object", /(?<=class\s).*?(?=\s)/g)
                .symbol("object", /(?<!(\w|\.))\w*?(?<!this)(?=\s*?\.)/g)
                .symbol("string", /".*?[^(\\")]"/g)
                .symbol("string", /'.*?[^(\\')]'/g);
        }

        return job.run();
    }

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

    export namespace Helpers
    {
        export class SymbolCollectionBuilder
        {
            job: Job;
    
            constructor(job: Job)
            {
                this.job = job;
            }
    
            public symbol(name: string, pattern: RegExp): SymbolCollectionBuilder
            {
                this.job.symbols.push({
                    name: name,
                    pattern: pattern,
                    importance: this.job.symbols.length
                });
    
                return this;
            }
    
            public word(name: string, value: string): SymbolCollectionBuilder
            {
                const wordStart = /((?<=^)|(?<=\W))/g;
                const wordEnd = /(?=(\W|$))/g;
    
                const pattern = new RegExp(wordStart.source + value + wordEnd.source, "g");
                
                return this.symbol(name, pattern);
            }

            public key (value: string): SymbolCollectionBuilder
            {
                return this.word("keyword", value);
            }
        }

        export function escape (value: string)
        {
            return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\s/, "&nbsp;");
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
                    value: escape(match[0]),
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

            const addToken = (value: string) => leftovers.push({ index: lastEnd, value: escape(value), symbol: symbol });

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
            return `<span class="token ${token.symbol.name}">${token.value}</span>`;
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

document.body.innerHTML = (MarkupCompiler.compile("JS", 'constructor(job) { this.job = job }'));