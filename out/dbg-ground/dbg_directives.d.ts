import { DefaultAdornerPolicy } from "./adorner";
import { DebugRuleAnnotation } from "./dbg_annotation";
export declare class DebugDirectiveError extends Error {
    constructor(message?: string);
}
export declare class DebugDirectives {
    private static instance;
    private defaultAdornerPolicy;
    private negateDefaultAdornerPolicy;
    static getInstance(): DebugDirectives;
    parseDirectives(input_program: string): string;
    reset(): void;
    getDefaultAdornerPolicy(): DefaultAdornerPolicy;
    isNegateDefaultAdornerPolicy(): boolean;
    getStartingDebugRuleAnnotation(): DebugRuleAnnotation;
    private constructor();
}
