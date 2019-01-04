export declare class SyntaxCompiler {
    symbols: Symbol[];
    constructor(builder?: (symbols: SymbolBuilder) => void);
    createSymbolBuilder(): SymbolBuilder;
    compile(source: string): string;
    compileAsync(source: string): Promise<string>;
    static getCompiler(syntax: Syntax): SyntaxCompiler;
    static compile(src: string, syntax: Syntax): string;
    static compileAsync(src: string, syntax: Syntax): Promise<string>;
}
export declare class SymbolBuilder {
    compiler: SyntaxCompiler;
    constructor(compiler: SyntaxCompiler);
    symbol(name: string, pattern: RegExp, composeInner?: ((token: Token) => string)): this;
    word(name: string, value: string): this;
    key(value: string | RegExp): SymbolBuilder;
}
export declare namespace SyntaxCompiling {
    function parse(src: string, symbols: Symbol[]): Token[];
    function compose(tokens: Token[]): string;
    namespace Parsing {
        function findTokens(symbols: Symbol[], src: string): Token[];
        function findTokensOfSymbol(symbol: Symbol, src: string): Token[];
        function findTextTokens(tokens: Token[], src: string): Token[];
        function textSymbol(): Symbol;
        function sort(tokens: Token[]): void;
        function removeOverlappingTokens(tokens: Token[]): Token[];
    }
    namespace Composing {
        function escape(html: string): string;
        function defaultCompose(token: Token): string;
    }
}
export interface Token {
    index: number;
    value: string;
    symbol: Symbol;
}
export interface Symbol {
    name: string;
    pattern: RegExp;
    importance: number;
    composeInner?: (token: Token) => string;
}
export declare type Syntax = "XML" | "HTML" | "JSON" | "JS" | "CSS" | "TXT" | "MD";
