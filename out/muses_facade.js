"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUSesCalculator = void 0;
const rules_generator_1 = require("./rules_generator");
const dbg_grounder_1 = require("./dbg-ground/dbg_grounder");
const unsat_wasp_1 = require("./unsat_wasp");
const asp_core_1 = require("./dbg-ground/asp_core");
class MUSesCalculator {
    constructor() {
        this.muses = null;
        this.generator = new rules_generator_1.RulesGenerator();
        this.waspCaller = new unsat_wasp_1.WaspCaller();
        this.debug_predicate = "";
        this.support_predicate = "";
        this.supportRuleMap = new Map();
    }
    //Calculates and returns the musesNum number of muses for the program described in filepaths
    //Returns an error if the muses could not be calculated
    calculateMUSes(filepaths, musesNum) {
        const grounder = dbg_grounder_1.DebugGrounder.createDefault(filepaths);
        const groundProgram = grounder.ground();
        this.debug_predicate = grounder.getDebugPredicate();
        this.support_predicate = grounder.getSupportPredicate();
        this.program = grounder.getDebugAtomsMap();
        this.supportRuleMap = grounder.getSupportRuleMap();
        this.muses = this.waspCaller.get_muses(groundProgram, Array.from(this.program.keys()).concat(this.support_predicate), musesNum);
        return this.muses;
    }
    getNonGroundRulesForMUSes() {
        if (!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the non ground rules");
        return this.generator.get_non_ground_rules_from_debug(this.muses, this.program, -1, this.debug_predicate);
    }
    getGroundRulesForMUS(musIndex) {
        if (!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the ground rules");
        return this.generator.get_ground_rules_from_debug(this.muses, this.program, musIndex, this.debug_predicate);
    }
    /**
     * For each ground atom with a missing support (needed to make the input program coherent)
     * returns the set of non-ground rules that could deduce such atom but they do not.
     * In case no rule is found, an empty set is returned.
     */
    getMissingSupportRulesFromMUS(musIndex) {
        let missingSupportRulesMap = new Map();
        if (!this.muses || this.muses.length === 0)
            return missingSupportRulesMap;
        for (let atom of this.muses[musIndex]) {
            let supportPred = asp_core_1.Predicate.getFromAtom(atom);
            if (supportPred == null || supportPred.getPredicateName() !== this.support_predicate || supportPred.getPredicateArity() != 1)
                continue;
            let unsupportedAtom = atom.match(/\((.*)\)/)[1].trim();
            let unsupportedAtomPred = asp_core_1.Predicate.getFromAtom(unsupportedAtom);
            missingSupportRulesMap.set(unsupportedAtom, this.supportRuleMap.get(unsupportedAtomPred.getPredString()));
        }
        return missingSupportRulesMap;
    }
}
exports.MUSesCalculator = MUSesCalculator;
//# sourceMappingURL=muses_facade.js.map