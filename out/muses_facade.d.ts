export declare class MUSesCalculator {
    private muses;
    private program;
    private generator;
    private waspCaller;
    constructor();
    calculateMUSes(filepaths: string[], musesNum: number): string[][];
    getNonGroundRulesForMUSes(): Set<string>[];
    getGroundRulesForMUS(musIndex: number): Map<string, string[]>;
}
