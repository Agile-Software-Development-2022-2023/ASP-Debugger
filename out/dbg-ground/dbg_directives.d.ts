import { DefaultAdornerPolicy } from "./adorner";
import { DebugRuleAnnotation } from "./dbg_annotation";
export declare class DebugDirectiveError extends Error {
    constructor(message?: string);
}
export declare class DebugDirectives {
    private static instance;
    private defaultAdornerPolicy;
    private negateDefaultAdornerPolicy;
    private missingSupportEnabled;
    static getInstance(): DebugDirectives;
    parseDirectives(input_program: string): string;
    private __parseDefaultPolicyDirective;
    private __parseMissingSupportDirective;
    private __resetDefaultPolicyDirective;
    private __resetMissingSupport;
    reset(): void;
    getDefaultAdornerPolicy(): DefaultAdornerPolicy;
    isNegateDefaultAdornerPolicy(): boolean;
    isMissingSupportEnabled(): boolean;
    getStartingDebugRuleAnnotation(): DebugRuleAnnotation;
    private constructor();
}
