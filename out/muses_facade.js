"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUSesCalculator = void 0;
const rules_generator_1 = require("./rules_generator");
const dbg_grounder_1 = require("./dbg-ground/dbg_grounder");
const unsat_wasp_1 = require("./unsat_wasp");
class MUSesCalculator {
    constructor() {
        this.muses = null;
        this.generator = new rules_generator_1.RulesGenerator();
        this.waspCaller = new unsat_wasp_1.WaspCaller();
    }
    //Calculates and returns the musesNum number of muses for the program described in filepaths
    //Returns an error if the muses could not be calculated
    calculateMUSes(filepaths, musesNum) {
        const grounder = dbg_grounder_1.DebugGrounder.createDefault(filepaths);
        const groundProgram = grounder.ground();
        this.program = grounder.getDebugAtomsMap();
        this.muses = this.waspCaller.get_muses(groundProgram, Array.from(this.program.keys()), musesNum);
        return this.muses;
    }
    getNonGroundRulesForMUSes() {
        if (!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the non ground rules");
        return this.generator.get_non_ground_rules_from_debug(this.muses, this.program);
    }
    getGroundRulesForMUS(musIndex) {
        if (!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the ground rules");
        return this.generator.get_ground_rules_from_debug(this.muses, this.program, musIndex);
    }
}
exports.MUSesCalculator = MUSesCalculator;
//# sourceMappingURL=muses_facade.js.map