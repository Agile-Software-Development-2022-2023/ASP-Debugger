import { AspRule, DebugAtom } from "./asp_core";
import { ASP_REGEX } from "./Useful_regex";


export class NonGroundDebugProgramBuilder
{
    private logic_program: string;
    private nonground_rules: AspRule[];

    public constructor(input_program: string)
    {
        this.logic_program = input_program;
    }
    
    public getLogicProgram(): string { return this.logic_program; }
	public setLogicProgram(input_program: string){ this.logic_program = input_program;}
    public getNonGroundRules(): AspRule[] { return this.nonground_rules; }
    public getResult(): string { return this.nonground_rules.join("\n"); }

    /*	public String removeComments(String logicProgram) {
		return COMMENT_PATTERN.matcher(logicProgram).replaceAll("");
	}*/
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

    public getVariables(ruleBody:string): Array<string> {
		// remove any aggregates from the rule body		
        ruleBody = ruleBody.replace(new RegExp(ASP_REGEX.AGGREGATE_PATTERN,"g"), "");
		let variables = new Array<string>();	
		variables = ruleBody.match(new RegExp(ASP_REGEX.VARIABLE_PATTERN,"g"));
		if(variables === null)
			variables = [];
		//return am array of unique variables  
		return variables.filter((value, index, array) => array.indexOf(value) === index);
	}

/*
    public parseRules() {
        this.logic_program.split("(?<!\\.)\\.(?!\\.)").forEach(rule => {
			if (rule.includes(":-")) {
				// rule, identified by ':-', thus add ', _debug#' to the rule
				let splitted = rule.split(":-");
				let variables:Array<string> = this.getVariables(splitted[1]);
				this.nonground_rules.push(new AspRule(splitted[0], splitted[1], variables));
				//debugAtomRuleMap.put(debugConstantPrefix + debugConstantNum, new Rule(rule.replace("\n", "").trim() + ".", variables));
				
				/*if (variables.length > 0) {
					debugConstant.append("(");
					debugConstant.append(variables.get(0));
					for (int i = 1; i < variables.size(); i ++) {
						debugConstant.append(", ");
						debugConstant.append(variables.get(i));
					}
					debugConstant.append(")");
				}*/
				
				/*preprocessedProgram.append(rule);
				preprocessedProgram.append(", ");
				preprocessedProgram.append(debugConstant);
				preprocessedProgram.append(".");
				
				debugRules.append(debugConstant);
				
				if (variables.size() > 0) {
					debugRules.append(" :- ");
					String r = rule.split(":-")[1];
					r=aggregateTerm1.matcher(r).replaceAll("");
					r=aggregateTerm2.matcher(r).replaceAll("");
					r=AGGREGATE_PATTERN.matcher(r).replaceAll("");
				
					debugRules.append(r);
				}
				
				debugRules.append(".\n");
				
				debugConstantNum ++;
			} else if (rule.includes("|") || (rule.includes("{") && rule.includes("}"))) {
				// disjunction or choice rule, thus add ' :- _debug#' to the rule
				/*preprocessedProgram.append(rule);
				preprocessedProgram.append(" :- ");
				preprocessedProgram.append(debugConstantPrefix);
				preprocessedProgram.append(debugConstantNum);
				preprocessedProgram.append(".");
				debugAtomRuleMap.put(debugConstantPrefix + debugConstantNum, new Rule(rule.replace("\n", "").trim() + "."));
				
				debugRules.append(debugConstantPrefix);
				debugRules.append(debugConstantNum);
				debugRules.append(".\n");
				
				debugConstantNum ++;

				//it should not have variables, because it does not have a body.
				let variables:Array<string> = this.getVariables(rule);
				this.nonground_rules.push(new AspRule(rule, "", []));
			} /*else {
				// fact, thus do not alter it
				preprocessedProgram.append(rule);
				
				// only add delimiting . if the rule is not empty
				if (rule.trim().length() > 0) {
					preprocessedProgram.append(".");
				}
			}
		})

    }*/
    public adornRules(): Map<string, DebugAtom> { return null; }
}