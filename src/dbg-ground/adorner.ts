import { AspRule, DebugAtom } from "./asp_core";
import { freezeStrings, make_unique, restoreStrings } from "./asp_utils";
import { ASP_REGEX } from "./Useful_regex";


export class AdornedDebugProgramBuilder
{
    private logic_program: string;
	private adornedProgram: string;
    private debugAtomsMap: Map<string,DebugAtom>;
	private debug_predicate:string;
	//private nonground_rules: AspRule[];
	private stringPlaceholder: Map<string, string>;
    public constructor(input_program: string)
    {
        this.logic_program = input_program;
		this.debugAtomsMap = new Map<string,DebugAtom>();
		this.adornedProgram = "";
		this.stringPlaceholder = new Map<string, string>();
		this.debug_predicate = "_debug";
    }
    public getDebugPredicate():string{return this.debug_predicate; }
	public setDebugPredicate(pred : string):void{ this.debug_predicate=pred; }
    public getLogicProgram(): string { return this.logic_program; }
	public setLogicProgram(input_program: string){ this.logic_program = input_program;this.debug_predicate = "_debug";}


	private replaceAll(program:string, regex: RegExp, sub:string){
		let origin = program; 
        let replaced = program.replace(regex, sub);
		while(origin !== replaced){
			origin = replaced;
			replaced = replaced.replace(regex, sub);
		}
		return replaced;
	}

    public removeComments() {this.logic_program = this.replaceAll(this.logic_program, ASP_REGEX.COMMENT_PATTERN, "");}

	//it should ignore the strings
    public getVariables(ruleBody:string): Array<string> {
		// remove any aggregates from the rule body		
		//first remove strings
        ruleBody = ruleBody.replace(new RegExp("#.+\{(.+)\}","g"), "");
		//let variables1 = new Array<string>();
		let variables = new Array<string>();		
		//variables1 = ruleBody.match(new RegExp(ASP_REGEX.VARIABLE_PATTERN,"g"));
		variables = ruleBody.match(new RegExp("(?<![a-z])_*[A-Z][a-z0-9]*","g"));
		//if(variables1 === null)
			//variables1 = [];
		if(variables === null)
			variables = [];
		return variables.filter((value, index, array) => array.indexOf(value) === index);
	}
	public clearMap():void{
		this.debugAtomsMap = new Map<string,DebugAtom>();
	}

	public cleanString(){
		this.logic_program = freezeStrings(this.logic_program, this.stringPlaceholder);
	}

	public restorePlaceholderToString(){
		for(let [key, value] of this.debugAtomsMap){
			value.setNonGroundRule(restoreStrings(value.getNonGroundRule(), this.stringPlaceholder));
		}
		this.adornedProgram = restoreStrings(this.adornedProgram, this.stringPlaceholder);
	}

	public getAdornedProgram(){
		return this.adornedProgram;
	}

	public adornProgram(debugConstantPrefix:string  = "_debug"): void {
		debugConstantPrefix = make_unique(debugConstantPrefix, this.logic_program);
		this.debug_predicate = debugConstantPrefix;
		let debugConstantNum: number = 1;
		this.adornedProgram = "";
		//remove aggregate atoms that are not useful for debugging purposes.
		let aggregateTerm1 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+",");
		let aggregateTerm2 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+ "(?!,)");
		//manage weak constraints, it permit to deal with weak.
		this.logic_program = this.replaceAll(this.logic_program, new RegExp("\](?!\.)"), "\]\." );



		let debugRules : string = "";
		// split the program into rules. The regex matches only a single '.'
		//this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule=>{
		this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule =>{
			if (rule.includes(":-")) {
				// rule with the body should be adorned adding a the debug atoms with their globalVars
				//Consider that the debug atom then should be put as the head of a rule with the body of the rules adorned
				//This permits to derive the debug atom only if necessary, dependetly of the constants it includes
				let debugPred= debugConstantPrefix+debugConstantNum;
				let splitted: Array<string> = rule.split(":-");
				let variables:Array<string> = this.getVariables(splitted[1]);
				//add also head variables => Note that all the variables in the head of a rule  should be containted in the body of the rule because of satisfiability
				//variables = variables.concat(this.getVariables(splitted[0])).filter((value, index, array) => array.indexOf(value) === index);
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
				

				/*Construct a rule of the form debug(1,2,3):- pred1(1), pred2(2),pred3(3).
					where the original rule was head...:- pred1(1), pred2(2),pred3(3).*/ 
				debugRules = debugRules.concat(debugPred);
				
				if (variables.length > 0) {
					debugRules = debugRules.concat(" :- ");
					let body: string = splitted[1];
					//body = this.replaceAll(body, aggregateTerm1, "");
					//body = this.replaceAll(body, aggregateTerm2, "");
					//body= this.replaceAll(body, ASP_REGEX.AGGREGATE_PATTERN, "");		
					debugRules = debugRules.concat(body);
				}
				//in order to start the new rule
				debugRules = debugRules.concat(".\n");			
				debugConstantNum ++;

			//this includes rules without the body, such a rule should be adorned with the creation of the body including the debug atom
			} else if((rule.includes("|") || (rule.includes("{") && rule.includes("}"))) && !rule.includes(":~")) {
				// disjunction or choice rule, thus add ' :- _debug#' to the rule
				let debugPred:string= debugConstantPrefix+debugConstantNum;
				this.adornedProgram = this.adornedProgram.concat(rule);
				this.adornedProgram = this.adornedProgram.concat(" :- ");
				this.adornedProgram = this.adornedProgram.concat(debugPred);
				this.adornedProgram = this.adornedProgram.concat(".");
				this.debugAtomsMap.set(debugPred, new DebugAtom(debugPred,0,[],rule.replace("\n", "").trim() + "."));
				
				debugRules = debugRules.concat(debugPred);
				debugRules = debugRules.concat(".\n");
				debugConstantNum ++;
			
			//can be modified if i want to adorn facts too
			} 
			else {
				
				// ignore if a fact or [w@l], copy as it is
				this.adornedProgram = this.adornedProgram.concat(rule);
				
				// only add delimiting . if the rule is not empty
				//note that the weight and the level [w@l] of a weak is managed as follow.
				
				if (rule.trim().length > 0 && !rule.includes("@")) {
					this.adornedProgram = this.adornedProgram.concat(".");
				}
			}});
			if(debugRules.length>0){
				this.adornedProgram = this.adornedProgram.concat("\n"+debugRules);
			}
			//this.logic_program = this.adornedProgram;
	}
	public getDebugAtomsMap(): Map<string,DebugAtom>{return this.debugAtomsMap;}
    //public adornRules(): Map<string, DebugAtom> { return null; }
}

export function addDebugAtomsChoiceRule(rules: string, atoms: string, predicate: string): string {
	let placeholders: Map<string, string>  = new Map<string, string>();

	let id_of_debug: Array<string> = atoms.match(new RegExp(`^([0-9]+) ${predicate}.*\n`, "gm"));
	if ( id_of_debug == null )
		return '';
	
	for(let i :number = 0 ; i< id_of_debug.length;++i){
		id_of_debug[i] = id_of_debug[i].split(" ")[0];
	}
	let choice = "3 "+id_of_debug.length+" ";
	choice = choice.concat(id_of_debug.join(" ")) +" 0 0\n";

	rules = rules.concat(choice);

	//IMPORTANT
	//remove the rules and facts of debug atoms, because they will not be evaluated in the choice until they could be true in other ruless.
	rules = rules.replace(new RegExp("(^|\n)1 (" + id_of_debug.join('|') + ")( |\\d)+\n", "gm"), "$1");
	
	return rules;     
}