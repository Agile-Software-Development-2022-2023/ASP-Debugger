import { DebugAtom } from "./asp_core";
import { make_unique } from "./asp_utils";

// It permits to adorn the program and stores it. The adorned program can be obtained and used to calculate MUSes
export abstract class AdornerImplementation{
	protected debug_num : number;
    protected debugAtomsMap :Map<string, DebugAtom>;
    protected adornedProgram :string;
    protected debug_predicate :string;
    protected debug_rules:string;
    public constructor()
    {
		this.debug_num = 1;
		this.debugAtomsMap = new Map<string,DebugAtom>();
		this.adornedProgram = "";
		this.debug_predicate = "_debug";
        this.debug_rules = "";
    }
	
	// Retrieve all variables inside of a rule body
	// It returns an array of string including the variables name ordered by apparence 
	// But it ignores any aggregate		
    public getVariables(ruleBody:string): Array<string> {
		
        ruleBody = ruleBody.replace(new RegExp("#.+\{(.+)\}","g"), "");
		let variables = new Array<string>();		
		variables = ruleBody.match(new RegExp("(?<![a-z])_*[A-Z][a-z0-9]*","g"));
		if(variables === null)
			variables = [];
		return variables.filter((value, index, array) => array.indexOf(value) === index);
	}
	
	// Modify the adorned program 
	// adorn basic rules with the struct:
	// Ex: :-ruleBody(X, ..., Z), ..., ruleBodyN;
    //     head :- body.
	public abstract adornSimpleRules(rule:string):void;
	
	// adorn choice rules or disjuntive rules without body
	// Ex: {a;b}. , f(A)|f(B)|f(C).
    public abstract adornChoiceRules(rule:string):void;

	//adorn facts 
    public abstract adornFacts(rule:string):void;

	//adorn weak constraints
    public abstract adornWeak(rule:string):void;
	
	// copy weight [w@l] as it is in the program 
	public adornWeights(rule: string): void {
		this.adornedProgram = this.adornedProgram.concat(rule);
	}

	// Return the adorned program stored in the object
    public getAdornedProgram():string{
        return this.adornedProgram;
    }

	// Modify the adorned program stored
    public setAdornedProgram(adorned:string){
        this.adornedProgram = adorned;
    }

	// Copy the rule as it is in the adorned program and append "."
    protected copyRuleAsItIs(rule:string){
        this.adornedProgram = this.adornedProgram.concat(rule);
		// only add delimiting . if the rule is not empty
		//note that the weight and the level [w@l] of a weak is managed as follow.
		if (rule.trim().length > 0) {
			this.adornedProgram = this.adornedProgram.concat(".");
		}
    }

	// Reset all structures inside the object in order to build another adornment of another logic program
	// It reset also the debug atoms map, the predicate of debug atom and counter
    public reset(){        
		this.debugAtomsMap = new Map<string,DebugAtom>();
		this.adornedProgram = "";
		this.debug_num = 1;
        this.debug_rules = "";
		this.debug_predicate = "_debug"
    }

	// generate an unique debug prefix, in order to avoid collisions with atoms in the program
    public make_unique_debug_prefix(logic_program:string):string{
		this.debug_predicate = make_unique(this.debug_predicate, logic_program); 
		return this.debug_predicate;
	}

	//return the debug rules generated during the building
    public getDebugRules():string{
        return this.debug_rules;
    }

    public getDebugPredicate():string{
        return this.debug_predicate;
    }

    public setDebugPredicate(pred:string):void{
        this.debug_predicate = pred;
    }

    public getDebugAtomsMap(): Map<string,DebugAtom>{return this.debugAtomsMap;}


    // append debug rules generated so far and clean debug rules
	public appendDebugRules(){
        this.adornedProgram = this.adornedProgram.concat("\n"+this.debug_rules);
        this.debug_rules = "";
    }
}


// It adorns both rules and facts
export class AdornAllImplementation extends AdornerImplementation{

	public constructor(){
		super();
	}
	
	// Ex: f(5).
	// Result: f(5):- _debug1.
    public adornFacts(rule: string): void {
        let cleanedRule = rule.replace("\n", "").trim();
        if(cleanedRule.length == 0){
            return ;
        }
        // rule with the body should be adorned adding a the debug atoms with their globalVars
	    // Consider that the debug atom then should be put as the head of a rule with the body of the rules adorned
	    // This permits to derive the debug atom only if necessary, dependetly of the constants it includes
	    let debugPred= this.debug_predicate+this.debug_num;
	    // add also head variables => Note that all the variables in the head of a rule  should be containted in the body of the rule because of satisfiability
	    // variables = variables.concat(this.getVariables(splitted[0])).filter((value, index, array) => array.indexOf(value) === index);
	    this.debugAtomsMap.set(debugPred, new DebugAtom(debugPred,0 , new Array<string>(), rule.replace("\n", "").trim() + "."));
				
		this.adornedProgram = this.adornedProgram.concat(rule);
		this.adornedProgram = this.adornedProgram.concat(":-");
		this.adornedProgram = this.adornedProgram.concat(debugPred);
		this.adornedProgram = this.adornedProgram.concat(".");
				

		/*Construct a rule of the form debug(1,2,3):- pred1(1), pred2(2),pred3(3).
		where the original rule was head...:- pred1(1), pred2(2),pred3(3).*/ 
		this.debug_rules = this.debug_rules.concat(debugPred);
		//in order to start the new rule
		this.debug_rules = this.debug_rules.concat(".\n");			
		this.debug_num ++;
    }

	// Result : head :- body(Variables, _debug1(Variables).
	public adornSimpleRules(rule:string){
        // rule with the body should be adorned adding a the debug atoms with their globalVars
		// Consider that the debug atom then should be put as the head of a rule with the body of the rules adorned
		// This permits to derive the debug atom only if necessary, dependetly of the constants it includes
		let debugPred= this.debug_predicate+this.debug_num;
		let splitted: Array<string> = rule.split(":-");
		let variables:Array<string> = this.getVariables(splitted[1]);
		
		// add also head variables => Note that all the variables in the head of a rule  should be containted in the body of the rule because of satisfiability
		// variables = variables.concat(this.getVariables(splitted[0])).filter((value, index, array) => array.indexOf(value) === index);
		this.debugAtomsMap.set(debugPred, new DebugAtom(debugPred, variables.length , variables, rule.replace("\n", "").trim() + "."));
				
		if (variables.length > 0) {
			debugPred = debugPred.concat("(");
			debugPred = debugPred.concat(variables[0]);
			for (let i = 1; i < variables.length; ++i) {
				debugPred = debugPred.concat(", ");
				debugPred = debugPred.concat(variables[i]);
			}
			debugPred = debugPred.concat(")");
		}
				
		this.adornedProgram = this.adornedProgram.concat(rule);
		this.adornedProgram = this.adornedProgram.concat(", ");
		this.adornedProgram = this.adornedProgram.concat(debugPred);
		this.adornedProgram = this.adornedProgram.concat(".");
				

		/* Construct a rule of the form debug(1,2,3):- pred1(1), pred2(2),pred3(3).
		   where the original rule was head...:- pred1(1), pred2(2),pred3(3). */ 
		this.debug_rules = this.debug_rules.concat(debugPred);		
		if (variables.length > 0) {
			this.debug_rules = this.debug_rules.concat(" :- ");
			let body: string = splitted[1];
			//body = this.replaceAll(body, aggregateTerm1, "");
			//body = this.replaceAll(body, aggregateTerm2, "");
			//body= this.replaceAll(body, ASP_REGEX.AGGREGATE_PATTERN, "");		
			this.debug_rules = this.debug_rules.concat(body);
		}

		// in order to start the new rule
		this.debug_rules = this.debug_rules.concat(".\n");			
		this.debug_num ++;

    }

	// Result: {a(...);b(...)} :- _debug1(VARIABLES)
    public adornChoiceRules(rule:string){
        // disjunction or choice rule, thus add ' :- _debug#' to the rule
        let debugPred:string= this.debug_predicate+this.debug_num;
        this.adornedProgram = this.adornedProgram.concat(rule);
        this.adornedProgram = this.adornedProgram.concat(" :- ");
        this.adornedProgram = this.adornedProgram.concat(debugPred);
        this.adornedProgram = this.adornedProgram.concat(".");
        this.debugAtomsMap.set(debugPred, new DebugAtom(debugPred,0,[],rule.replace("\n", "").trim() + "."));

        this.debug_rules = this.debug_rules.concat(debugPred);
        this.debug_rules = this.debug_rules.concat(".\n");
        this.debug_num ++;
    }

	public adornWeak(rule: string): void {
		this.copyRuleAsItIs(rule);
	}

}


// It permits to adorn only rules and ignores the facts
export class RulesOnlyImplementation extends AdornAllImplementation{

    public constructor(){super();}

    public adornFacts(rule: string): void {
		super.copyRuleAsItIs(rule);
	}
}

//It permits to adorn only facts and ignores rules
export class FactsOnlyImplementation extends AdornAllImplementation{
    public adornChoiceRules(rule: string): void {
        this.copyRuleAsItIs(rule);
    }

    public adornSimpleRules(rule: string): void {
        this.copyRuleAsItIs(rule);
    }

}

