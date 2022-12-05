export declare class AspRule {
    private body;
    private globvars;
    constructor(body: string, globvars?: string[]);
    getRule(): string;
    getGlobVars(): string[];
    setBody(body: string): void;
    setGlobVars(globvars: string[]): void;
    getBody(): string;
    isFact(): boolean;
}
export declare class DebugAtom {
    private predicateName;
    private predicateArity;
    private variables;
    private nonground_rule;
    constructor(predName: string, predArity: number, vars: string[], rl: string);
    equals(other: any): boolean;
    getPredicateName(): string;
    getPredicateArity(): number;
    getVariables(): string[];
    getNonGroundRule(): string;
}
