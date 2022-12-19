export declare class MUSesCalculator {
    private muses;
    private program;
    private generator;
    private waspCaller;
    private debug_predicate;
    constructor();
    calculateMUSes(filepaths: string[], musesNum: number): string[][];
    getNonGroundRulesForMUSes(): Set<string>[];
    getGroundRulesForMUS(musIndex: number): Map<string, string[]>;
}
