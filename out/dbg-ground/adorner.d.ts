import { DebugAtom } from "./asp_core";
export declare class AdornedDebugProgramBuilder {
    private logic_program;
    private adornedProgram;
    private debugAtomsMap;
    private debug_predicate;
    private stringPlaceholder;
    constructor(input_program: string);
    getDebugPredicate(): string;
    setDebugPredicate(pred: string): void;
    getLogicProgram(): string;
    setLogicProgram(input_program: string): void;
    private replaceAll;
    removeComments(): void;
    getVariables(ruleBody: string): Array<string>;
    clearMap(): void;
    cleanString(): void;
    restorePlaceholderToString(): void;
    getAdornedProgram(): string;
    adornProgram(debugConstantPrefix?: string): void;
    getDebugAtomsMap(): Map<string, DebugAtom>;
}
export declare function addDebugAtomsChoiceRule(rules: string, atoms: string, predicate: string): string;
