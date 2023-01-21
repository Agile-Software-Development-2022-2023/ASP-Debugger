export declare class AspGrounderError extends Error {
    constructor(message?: string);
}
export declare abstract class AspGrounder {
    static loadProgram(programPaths: string[]): string;
    abstract ground(inputProgram: string): string;
}
declare abstract class ExternalAspGrounder extends AspGrounder {
    ground(inputProgram: string): string;
    protected abstract getGrounderCommand(): string;
    protected abstract getGrounderOptions(): string;
    protected abstract errorOnStdout(stdout: string): boolean;
}
export declare class AspGrounderGringo extends ExternalAspGrounder {
    private static GRINGO_COMMAND;
    private static GRINGO_OPTIONS;
    protected getGrounderCommand(): string;
    protected getGrounderOptions(): string;
    protected errorOnStdout(stdout: string): boolean;
}
export declare class AspGrounderIdlv extends ExternalAspGrounder {
    private idlv_command;
    private idlv_options;
    protected getGrounderCommand(): string;
    protected getGrounderOptions(): string;
    protected errorOnStdout(stdout: string): boolean;
    constructor();
    ground(inputProgram: string): string;
}
export declare class TheoreticalAspGrounder extends AspGrounder {
    private static DEFAULT_DISJ_FACT_PREDNAME;
    private static DEFAULT_DISJ_ATOM_PREDNAME;
    private grounder;
    private disjFactPredName;
    private disjAtomPredName;
    constructor(grnd: AspGrounder);
    ground(inputProgram: string): string;
    protected removeComments(input_program: string): string;
    protected rewriteFacts(input_program: string): string;
    protected nullifyFactRewritings(ground_program: string): string;
    protected getDisjFactPredName(input_program: string): string;
}
export declare class AspGrounderFactory {
    private static instance;
    static getInstance(): AspGrounderFactory;
    private constructor();
    getDefault(): AspGrounder;
    getTheoretical(): TheoreticalAspGrounder;
}
export declare class IntervalsExpander {
    static expandIntervals(input_program: string): string;
    private static nextIntervalIndices;
}
export {};
