import { DebugAtom } from "./asp_core";
import { AspGrounderError } from "./grounder";
export declare class DebugGrounderError extends AspGrounderError {
    constructor(message?: string);
}
export declare abstract class DebugGrounder {
    protected encodings: string[];
    protected debugAtomsMap: Map<string, DebugAtom>;
    protected debug_predicate: string;
    constructor(encoding_paths: string | string[]);
    getEncodings(): string[];
    abstract ground(): string;
    abstract getAdornedProgram(): string;
    getDebugAtomsMap(): Map<string, DebugAtom>;
    getDebugPredicate(): string;
    static createDefault(encoding_paths: string | string[]): DebugGrounder;
}
export declare class RewritingBasedDebugGrounder extends DebugGrounder {
    private adornedProgram;
    ground(): string;
    getAdornedProgram(): string;
}
