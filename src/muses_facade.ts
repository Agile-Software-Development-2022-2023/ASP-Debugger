import { RulesGenerator } from "./rules_generator";
import { DebugGrounder} from "./dbg-ground/dbg_grounder";
import { WaspCaller } from "./unsat_wasp";
import { DebugAtom, Predicate } from "./dbg-ground/asp_core";

export class MUSesCalculator {

    private muses: string[][] = null;
    private program: Map<string, DebugAtom>;
    private generator: RulesGenerator;
    private waspCaller: WaspCaller;
    private debug_predicate :string;
    private support_predicate: string;
    private supportRuleMap: Map<string, Set<string>>;
    public constructor() {
        this.generator = new RulesGenerator();
        this.waspCaller = new WaspCaller();
        this.debug_predicate = "";
        this.support_predicate = "";
        this.supportRuleMap = new  Map<string, Set<string>>();
    }

    //Calculates and returns the musesNum number of muses for the program described in filepaths
    //Returns an error if the muses could not be calculated
    public calculateMUSes(filepaths: string[], musesNum: number): string[][] {
		const grounder = DebugGrounder.createDefault(filepaths);
		const groundProgram: string = grounder.ground();
        this.debug_predicate = grounder.getDebugPredicate();
        this.support_predicate = grounder.getSupportPredicate();
		this.program = grounder.getDebugAtomsMap();
        this.supportRuleMap = grounder.getSupportRuleMap();
		this.muses = this.waspCaller.get_muses(groundProgram, Array.from(this.program.keys()).concat(this.support_predicate), musesNum);
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

    /**
     * For each ground atom with a missing support (needed to make the input program coherent)
     * returns the set of non-ground rules that could deduce such atom but they do not.
     * In case no rule is found, an empty set is returned.
     */
    public getMissingSupportRulesFromMUS(musIndex: number): Map<string, Set<string>>
    {
        let missingSupportRulesMap: Map<string, Set<string>> = new Map<string, Set<string>>();
        if ( !this.muses || this.muses.length === 0 )
            return missingSupportRulesMap;
        
        for ( let atom of this.muses[musIndex] )
        {
            let supportPred: Predicate = Predicate.getFromAtom(atom);
            if ( supportPred == null || supportPred.getPredicateName() !== this.support_predicate || supportPred.getPredicateArity() != 1 )
                continue;
            
            let unsupportedAtom: string = atom.match(/\((.*)\)/)[1].trim();
            let unsupportedAtomPred: Predicate = Predicate.getFromAtom(unsupportedAtom);
            let unsupportedAtomPredString: string = unsupportedAtomPred.getPredString();
            missingSupportRulesMap.set( unsupportedAtom, this.supportRuleMap.has(unsupportedAtomPredString) 
                ? this.supportRuleMap.get(unsupportedAtomPredString) : new Set<string>() );
        }
        return missingSupportRulesMap;
    }

}