interface TokenLocation {
    start: {
        line: number;
        column: number;
    };
    end?: {
        line: number;
        column: number;
    };
    filename?: string;
}
interface Token {
    type: string;
    val?: string | boolean | number;
    loc: TokenLocation;
    buffer?: boolean;
    mustEscape?: boolean;
    code?: string;
    key?: string | null;
    mode?: string;
    name?: string;
    args?: string | null;
    value?: string;
}
interface LexerOptions {
    filename?: string;
    interpolated?: boolean;
    startingLine?: number;
    startingColumn?: number;
    plugins?: LexerPlugin[];
}
interface LexerPlugin {
    [key: string]: ((lexer: Lexer, ...args: any[]) => any) | undefined;
}
interface ParseUntilResult {
    src: string;
    end: number;
    [key: string]: any;
}
interface AttributeValueResult {
    val?: string;
    mustEscape?: boolean;
    remainingSource: string;
}
declare function lex(str: string, options?: LexerOptions): Token[];
declare class Lexer {
    input: string;
    originalInput: string;
    filename?: string;
    interpolated: boolean;
    lineno: number;
    colno: number;
    plugins: LexerPlugin[];
    indentStack: number[];
    indentRe: RegExp | null;
    interpolationAllowed: boolean;
    whitespaceRe: RegExp;
    tokens: Token[];
    ended: boolean;
    constructor(str: string, options?: LexerOptions);
    error(code: string, message: string): never;
    assert(value: any, message: string): void;
    isExpression(exp: string): boolean;
    assertExpression(exp: string, noThrow?: boolean): boolean | undefined;
    assertNestingCorrect(exp: string): void;
    tok(type: string, val?: string): Token;
    tokEnd(tok: Token): Token;
    incrementLine(increment: number): void;
    incrementColumn(increment: number): void;
    consume(len: number): void;
    scan(regexp: RegExp, type?: string): Token | undefined;
    scanEndOfLine(regexp: RegExp, type: string): Token | undefined;
    bracketExpression(skip?: number): ParseUntilResult;
    scanIndentation(): RegExpExecArray | null;
    eos(): boolean | undefined;
    blank(): boolean | undefined;
    comment(): boolean | undefined;
    interpolation(): boolean | undefined;
    tag(): boolean | undefined;
    filter(opts?: {
        inInclude?: boolean;
    }): boolean | undefined;
    doctype(): boolean | undefined;
    id(): boolean | undefined;
    className(): boolean | undefined;
    endInterpolation(): boolean | undefined;
    addText(type: string, value: string, prefix?: string, escaped?: number): void;
    text(): boolean | undefined;
    textHtml(): boolean | undefined;
    dot(): boolean | undefined;
    extends(): boolean | undefined;
    prepend(): boolean | undefined;
    append(): boolean | undefined;
    block(): boolean | undefined;
    mixinBlock(): boolean | undefined;
    yield(): boolean | undefined;
    include(): boolean | undefined;
    path(): boolean | undefined;
    case(): boolean | undefined;
    when(): boolean | undefined;
    default(): boolean | undefined;
    call(): boolean | undefined;
    mixin(): boolean | undefined;
    conditional(): boolean | undefined;
    while(): boolean | undefined;
    each(): boolean | undefined;
    eachOf(): boolean | undefined;
    code(): boolean | undefined;
    blockCode(): boolean | undefined;
    attribute(str: string): string;
    attributeValue(str: string): AttributeValueResult;
    attrs(): boolean | undefined;
    attributesBlock(): boolean | undefined;
    indent(): boolean | undefined | Token;
    pipelessText(indents?: number): boolean | undefined;
    slash(): boolean | undefined;
    colon(): boolean | undefined;
    fail(): never;
    callLexerFunction(func: string, ...args: any[]): any;
    advance(): any;
    getTokens(): Token[];
}
declare const _default: typeof lex & {
    Lexer: typeof Lexer;
};
export = _default;
