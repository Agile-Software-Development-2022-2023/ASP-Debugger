import { DebugAtom } from "./asp_core";
export declare abstract class AdornerImplementation {
    protected debug_num: number;
    protected debugAtomsMap: Map<string, DebugAtom>;
    protected adornedProgram: string;
    protected debug_predicate: string;
    protected debug_rules: string;
    constructor();
    getVariables(ruleBody: string): Array<string>;
    abstract adornSimpleRules(rule: string): void;
    abstract adornChoiceRules(rule: string): void;
    abstract adornFacts(rule: string): void;
    abstract adornWeak(rule: string): void;
    adornWeights(rule: string): void;
    getAdornedProgram(): string;
    setAdornedProgram(adorned: string): void;
    copyRuleAsItIs(rule: string, concatDot?: boolean): void;
    reset(): void;
    make_unique_debug_prefix(logic_program: string): string;
    getDebugRules(): string;
    getDebugPredicate(): string;
    setDebugPredicate(pred: string): void;
    getDebugAtomsMap(): Map<string, DebugAtom>;
    appendDebugRules(): void;
}
export declare class AdornAllImplementation extends AdornerImplementation {
    constructor();
    adornFacts(rule: string): void;
    adornSimpleRules(rule: string): void;
    adornChoiceRules(rule: string): void;
    adornWeak(rule: string): void;
}
export declare class RulesOnlyImplementation extends AdornAllImplementation {
    constructor();
    adornFacts(rule: string): void;
}
export declare class FactsOnlyImplementation extends AdornAllImplementation {
    adornChoiceRules(rule: string): void;
    adornSimpleRules(rule: string): void;
}
