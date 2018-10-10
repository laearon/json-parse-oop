type Result = null | string | number | Array<any> | Object;

declare class Parse {
    static stringify(o: Result): string;
    value: Result;
    tokens: Array<Result>;
    constructor(s: string);
    valueOf(): Result;
    toString(): string;
}

export = Parse;
