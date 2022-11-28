import { AspRule, DebugAtom } from "./asp_core";
import { ASP_REGEX } from "./Useful_regex";


export class NonGroundDebugProgramBuilder
{
    private logic_program: string;
    private debugAtomsMap: Map<string,DebugAtom>;
	//private nonground_rules: AspRule[];

    public constructor(input_program: string)
    {
        this.logic_program = input_program;
		this.debugAtomsMap = new Map<string,DebugAtom>();
    }
    
    public getLogicProgram(): string { return this.logic_program; }
	public setLogicProgram(input_program: string){ this.logic_program = input_program;}

	private splitRules(program:string):Array<string>{
		let rules:Array<string> = [];
		let queue: Array<string> = [];
		let start:number = 0;
		for(let i : number = 0; i<program.length;++i){
			if(program[i] == '"' || program[i] == "'" || program[i] == "\\" ){
				if(queue[queue.length-1] != program[i])
					queue.push(program[i]);
				else 
					queue.pop();	
			}else if(program[i] == '.' && queue.length <= 0){
				rules.push(program.substring(start, i));
				start=i+1;

			}
		}
		return rules;
	}

	private splitByIf(rule:string):Array<string>{
		let queue: Array<string> = [];
		for(let i : number = 1; i<rule.length;++i){
			if(rule[i] == '"' || rule[i] == "'" || rule[i] == "\\" ){
				if(queue[queue.length-1] != rule[i])
					queue.push(rule[i]);
				else 
					queue.pop();	
			}else if(rule[i] == '-' && rule[i-1] == ":" && queue.length <= 0){
				return [rule.substring(0, i-1), rule.substring(i+1, rule.length)];
			}
		}
		return [rule,""];
	}

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
		let queue: Array<string> = [];
		let sanitizedRule:string = ruleBody;
		let start = 0 ;
		let end = 0;
		for(let i : number = 0; i<ruleBody.length;++i){
			if((ruleBody[i] == '"' || ruleBody[i] == "'" || ruleBody[i] == "\\" )){
				if(queue.length == 0)
					start = i;
				else if(queue.length == 1){
					end = i;
					sanitizedRule = sanitizedRule.replace(ruleBody.substring(start, end+1), "stringa");
				}
				if(queue[queue.length-1] != ruleBody[i])
					queue.push(ruleBody[i]);
				else 
					queue.pop();	
			}
		}

        sanitizedRule = sanitizedRule.replace(new RegExp(ASP_REGEX.AGGREGATE_PATTERN,"g"), "");
		let variables = new Array<string>();	
		variables = sanitizedRule.match(new RegExp(ASP_REGEX.VARIABLE_PATTERN,"g"));
		if(variables === null)
			variables = [];
		//return am array of unique variables  
		return variables.filter((value, index, array) => array.indexOf(value) === index);
	}
	public clearMap():void{
		this.debugAtomsMap = new Map<string,DebugAtom>();
	}

	private containsCouple(rule:string, couple:string = ":-"):boolean {
		let queue: Array<string> = [];
		for(let i : number = 1; i<rule.length;++i){
			if(rule[i] == '"' || rule[i] == "'" || rule[i] == "\\" ){
				if(queue[queue.length-1] != rule[i])
					queue.push(rule[i]);
				else 
					queue.pop();	
			}else if(rule[i] == couple[1] && rule[i-1] == couple[0] && queue.length <= 0){
				return true;
			}
		}
		return false;
	}

	private containsCharacterOutSideString(rule:string, del:string):boolean {
		let queue: Array<string> = [];
		for(let i : number = 0; i<rule.length;++i){
			if(rule[i] == '"' || rule[i] == "'" || rule[i] == "\\" ){
				if(queue[queue.length-1] != rule[i])
					queue.push(rule[i]);
				else 
					queue.pop();	
			}else if(rule[i] == del && queue.length <= 0){
				return true;
			}
		}
		return false;
	}

	public getAdornedProgram(debugConstantPrefix:string  = "_debug"): string {
		let debugConstantNum: number = 1;
		let adornedProgram:string = "";
		let aggregateTerm1 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+",");
		let aggregateTerm2 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+ "(?!,)");
		let debugRules : string = "";
		// split the program into rules. The regex matches only a single '.'
		//this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule=>{
		this.splitRules(this.logic_program).forEach(rule =>{	
			if (this.containsCouple(rule, ":-")) {
				// rule with the body should be adorned adding a the debug atoms with their globalVars
				//Consider that the debug atom then should be put as the head of a rule with the body of the rules adorned
				//This permits to derive the debug atom only if necessary, dependetly of the constants it includes
				let debugPred= debugConstantPrefix+debugConstantNum;
				
				let variables:Array<string> = this.getVariables(this.splitByIf(rule)[1]);

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
				
				adornedProgram = adornedProgram.concat(rule);
				adornedProgram = adornedProgram.concat(", ");
				adornedProgram = adornedProgram.concat(debugPred);
				adornedProgram = adornedProgram.concat(".");
				

				/*Construct a rule of the form debug(1,2,3):- pred1(1), pred2(2),pred3(3).
					where the original rule was head...:- pred1(1), pred2(2),pred3(3).*/ 
				debugRules = debugRules.concat(debugPred);
				
				if (variables.length > 0) {
					debugRules = debugRules.concat(" :- ");
					let body: string = this.splitByIf(rule)[1];
					body = this.replaceAll(body, aggregateTerm1, "");
					body= this.replaceAll(body, aggregateTerm2, "");
					body= this.replaceAll(body, ASP_REGEX.AGGREGATE_PATTERN, "");
				
					debugRules = debugRules.concat(body);
				}
				//in order to start the new rule
				debugRules = debugRules.concat(".\n");			
				debugConstantNum ++;

			//this includes rules without the body, such a rule should be adorned with the creation of the body including the debug atom
			} else if(this.containsCharacterOutSideString(rule, "|") || (this.containsCharacterOutSideString(rule,"{") && this.containsCharacterOutSideString(rule,"}"))) {
				// disjunction or choice rule, thus add ' :- _debug#' to the rule
				let debugPred:string= debugConstantPrefix+debugConstantNum;
				adornedProgram = adornedProgram.concat(rule);
				adornedProgram = adornedProgram.concat(" :- ");
				adornedProgram = adornedProgram.concat(debugPred);
				adornedProgram = adornedProgram.concat(".");
				this.debugAtomsMap.set(debugPred, new DebugAtom(debugPred,0,[],rule.replace("\n", "").trim() + "."));
				
				debugRules = debugRules.concat(debugPred);
				debugRules = debugRules.concat(".\n");
				debugConstantNum ++;
			
			//can be modified if i want to adorn facts too
			} else {
				// ignore if a fact, copy as it is
				adornedProgram = adornedProgram.concat(rule);
				
				// only add delimiting . if the rule is not empty
				if (rule.trim().length > 0) {
					adornedProgram = adornedProgram.concat(".");
				}
			}});
			if(debugRules.length>0){
				adornedProgram = adornedProgram.concat("\n"+debugRules);
			}
			return adornedProgram
	}
	public getDebugAtomsMap(): Map<string,DebugAtom>{return this.debugAtomsMap;}
    //public adornRules(): Map<string, DebugAtom> { return null; }
}