export declare class MUSesCalculator {
    private muses;
    private program;
    private generator;
    private waspCaller;
    private debug_predicate;
    private support_predicate;
    private supportRuleMap;
    constructor();
    calculateMUSes(filepaths: string[], musesNum: number): string[][];
    getNonGroundRulesForMUSes(): Set<string>[];
    getGroundRulesForMUS(musIndex: number): Map<string, string[]>;
    /**
     * For each ground atom with a missing support (needed to make the input program coherent)
     * returns the set of non-ground rules that could deduce such atom but they do not.
     * In case no rule is found, an empty set is returned.
     */
    getMissingSupportRulesFromMUS(musIndex: number): Map<string, Set<string>>;
}
