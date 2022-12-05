export declare class AspGrounderError extends Error {
    constructor(message?: string);
}
export declare abstract class AspGrounder {
    static loadProgram(programPaths: string[]): string;
    abstract ground(inputProgram: string): string;
}
export declare class AspGrounderGringo extends AspGrounder {
    private static GRINGO_COMMAND;
    private static GRINGO_OPTIONS;
    ground(inputProgram: string): string;
}
export declare class TheoreticalAspGrounder extends AspGrounder {
    private grounder;
    private stringsMap;
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
