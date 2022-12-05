import { DebugAtom } from "./asp_core";
import { AspGrounderError } from "./grounder";
export declare class DebugGrounderError extends AspGrounderError {
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
export declare class RewritingBasedDebugGrounder extends DebugGrounder {
    ground(): string;
}
