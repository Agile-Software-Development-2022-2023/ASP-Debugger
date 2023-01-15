import { AdornerImplementation } from "./AdornerImplementation";
import { DebugAtom } from "./asp_core";
export declare enum DefaultAdornerPolicy {
    RULES_ONLY = 0,
    FACTS_ONLY = 1,
    ALL = 2
}
export declare class AdornedDebugProgramBuilder {
    protected adornerImpl: AdornerImplementation;
    protected stringPlaceholder: Map<string, string>;
    protected logic_program: string;
    private supportRuleMapper;
    constructor(logic_program?: string, policy?: DefaultAdornerPolicy);
    setDefaultPolicy(policy: DefaultAdornerPolicy): void;
    getDebugPredicate(): string;
    setDebugPredicate(pred: string): void;
    getSupportRuleMap(): Map<string, Set<string>>;
    private replaceAll;
    removeComments(): void;
    getVariables(ruleBody: string): Array<string>;
    reset(): void;
    cleanString(): void;
    restorePlaceholderToString(): void;
    setLogicProgram(logic_program: string): void;
    getLogicProgram(): string;
    getAdornedProgram(): string;
    getUniqueDebugPrefix(): string;
    adornProgram(): void;
    getDebugAtomsMap(): Map<string, DebugAtom>;
}
export declare function addDebugAtomsChoiceRule(rules: string, atoms: string, debug_predicate: string, support_predicate: string): string;
