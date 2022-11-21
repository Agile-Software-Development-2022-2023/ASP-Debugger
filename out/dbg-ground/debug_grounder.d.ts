export declare class DebugAtom {
    private predicateName;
    private predicateArity;
    private variables;
    private nonground_rule;
    constructor(predName: string, predArity: number, vars: string[], rl: string);
    getPredicateName(): string;
    getPredicateArity(): number;
    getVariables(): string[];
    getNonGroundRule(): string;
}
export declare class DebugGrounderError extends Error {
    constructor(message?: string);
}
export declare abstract class DebugGrounder {
    protected encodings: string[];
    protected debugAtomsMap: Map<string, DebugAtom>;
    constructor(encoding_paths: string | string[]);
    getEncodings(): string[];
    abstract ground(): string;
    getDebugAtomsMap(): Map<string, DebugAtom>;
    static createDefault(encoding_paths: string | string[]): DebugGrounder;
}
export declare class GringoWrapperDebugGrounder extends DebugGrounder {
    constructor(encoding_paths: string | string[]);
    ground(): string;
    private extractDebugAtomsMap;
}
