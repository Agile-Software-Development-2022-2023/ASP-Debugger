export declare class DebugAnnotationError extends Error {
    constructor(message?: string);
}
export declare class DebugRuleAnnotation {
    private skip;
    private nested;
    constructor(skip: boolean, nested?: boolean);
    static parseAnnotation(input_rule: string): DebugRuleAnnotation;
    skipRule(): boolean;
    isNested(): boolean;
}
