import { RulesGenerator } from "./rules_generator";
import { DebugGrounder} from "./dbg-ground/dbg_grounder";
import { WaspCaller } from "./unsat_wasp";
import { DebugAtom } from "./dbg-ground/asp_core";

export class MUSesCalculator {

    private muses: string[][] = null;
    private program: Map<string, DebugAtom>;
    private generator: RulesGenerator;
    private waspCaller: WaspCaller;
    private debug_predicate :string;
    public constructor() {
        this.generator = new RulesGenerator();
        this.waspCaller = new WaspCaller();
        this.debug_predicate = "";
    }

    //Calculates and returns the musesNum number of muses for the program described in filepaths
    //Returns an error if the muses could not be calculated
    public calculateMUSes(filepaths: string[], musesNum: number): string[][] {
		const grounder = DebugGrounder.createDefault(filepaths);
		const groundProgram: string = grounder.ground();
        this.debug_predicate = grounder.getDebugPredicate();
		this.program = grounder.getDebugAtomsMap();
		this.muses = this.waspCaller.get_muses(groundProgram, Array.from(this.program.keys()), musesNum);
        return this.muses;
    }

    public getNonGroundRulesForMUSes() {
        if(!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the non ground rules")
        return this.generator.get_non_ground_rules_from_debug(this.muses, this.program,-1,this.debug_predicate);
    }

    public getGroundRulesForMUS(musIndex: number) {
        if(!this.muses)
            throw new Error("calculateMUSes has to be called in order to get the ground rules")
        return this.generator.get_ground_rules_from_debug(this.muses, this.program, musIndex, this.debug_predicate);
    }

}