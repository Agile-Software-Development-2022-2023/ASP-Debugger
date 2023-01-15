import { AdornAllImplementation, AdornerImplementation, FactsOnlyImplementation, RulesOnlyImplementation } from "./AdornerImplementation";
import { DebugAtom, Predicate } from "./asp_core";
import { freezeStrings, restoreStrings } from "./asp_utils";
import { DebugRuleAnnotation } from "./dbg_annotation";
import { ASP_REGEX } from "./Useful_regex";
import { DebugDirectives } from "./dbg_directives";
import { SupportRuleMapper } from "../support/support_mapper";

export enum DefaultAdornerPolicy
{
	RULES_ONLY,
	FACTS_ONLY,
	ALL
}

export class AdornedDebugProgramBuilder
{
	protected adornerImpl: AdornerImplementation;
	protected stringPlaceholder: Map<string, string>;
	protected logic_program: string;
	private   supportRuleMapper: SupportRuleMapper;

    public constructor(logic_program: string = '', policy: DefaultAdornerPolicy = DefaultAdornerPolicy.RULES_ONLY)
    {
		this.stringPlaceholder = new Map<string, string>();
		this.logic_program = logic_program;
		this.supportRuleMapper = new SupportRuleMapper();
		this.setDefaultPolicy(policy);
    }

	public setDefaultPolicy(policy: DefaultAdornerPolicy)
	{
		switch(policy){
			case DefaultAdornerPolicy.RULES_ONLY:
				this.adornerImpl = new RulesOnlyImplementation();
				break;
			case DefaultAdornerPolicy.ALL:
				this.adornerImpl = new AdornAllImplementation();
				break;
			case DefaultAdornerPolicy.FACTS_ONLY:
				this.adornerImpl = new FactsOnlyImplementation();
				break;
			default:
				this.adornerImpl = new RulesOnlyImplementation();
		}	
	}

    public getDebugPredicate():string{return this.adornerImpl.getDebugPredicate(); }
	public setDebugPredicate(pred : string):void{ this.adornerImpl.setDebugPredicate(pred); }
	public getSupportRuleMap(): Map<string, Set<string>> { return this.supportRuleMapper.getMap(); }
    //public getLogicProgram(): string { return logic_program; }
	//public setLogicProgram(input_program: string){ logic_program = input_program;this.debug_predicate = "_debug";}

	private replaceAll(program:string, regex: RegExp, sub:string):string{
		let origin = program; 
        let replaced = program.replace(regex, sub);
		while(origin !== replaced){
			origin = replaced;
			replaced = replaced.replace(regex, sub);
		}
		return replaced;
	}

    public removeComments()
	{this.logic_program = this.replaceAll(this.logic_program, ASP_REGEX.COMMENT_PATTERN, "");}

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
	public reset():void{
		this.adornerImpl.reset();
		this.stringPlaceholder.clear();
		this.logic_program = '';
	}

	public cleanString() {
		this.logic_program = freezeStrings(this.logic_program, this.stringPlaceholder);
	}

	public restorePlaceholderToString(){

		for(let [key, value] of this.adornerImpl.getDebugAtomsMap()){
			value.setNonGroundRule(restoreStrings(value.getNonGroundRule(), this.stringPlaceholder));
		}
		this.adornerImpl.setAdornedProgram(restoreStrings(this.adornerImpl.getAdornedProgram(), this.stringPlaceholder));
	}

	public setLogicProgram(logic_program: string){
		this.logic_program = logic_program;
	}
	public getLogicProgram(){
		return this.logic_program;
	}
	public getAdornedProgram(){
		return this.adornerImpl.getAdornedProgram();
	}
	public getUniqueDebugPrefix():string{
		return this.adornerImpl.make_unique_debug_prefix(this.logic_program);
	}


	public adornProgram(): void {
		//remove aggregate atoms that are not useful for debugging purposes.
		let aggregateTerm1 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+",");
		let aggregateTerm2 : RegExp = new RegExp(ASP_REGEX.AGGREGATE_PATTERN+ "(?!,)");
		//manage weak constraints, it permit to deal with weak.
		this.logic_program = this.replaceAll(this.logic_program, new RegExp("\](?!\.)"), "\]\." );

		let skipCurrentRule: boolean = false;
		let lastDebugRuleAnnotation: DebugRuleAnnotation = DebugDirectives.getInstance().getStartingDebugRuleAnnotation();
		let debugRuleAnnotation: DebugRuleAnnotation = null;


		// split the program into rules. The regex matches only a single '.'
		//logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule=>{
		this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule =>{
			
			if ( rule.match(/^\s*\[.*?@.*?\]\s*$/) != null )
			{
				this.adornerImpl.adornWeights(rule);
				return;
			}

			debugRuleAnnotation = DebugRuleAnnotation.parseAnnotation(rule.trim() + '.');
			skipCurrentRule = (lastDebugRuleAnnotation != null && lastDebugRuleAnnotation.skipRule());
			lastDebugRuleAnnotation = debugRuleAnnotation;
			if ( skipCurrentRule || (debugRuleAnnotation != null && !debugRuleAnnotation.isNested()) )
			{
				//if (debugRuleAnnotation == null || debugRuleAnnotation.isNested())
					this.adornerImpl.copyRuleAsItIs(rule);
				return;
			}

			this.supportRuleMapper.mapRule(rule);
			
			if (rule.includes(":-")) {
				this.adornerImpl.adornSimpleRules(rule);

			//this includes rules without the body, such a rule should be adorned with the creation of the body including the debug atom
			} else if((rule.includes("|") || (rule.includes("{") && rule.includes("}"))) && !rule.includes(":~")) {
				this.adornerImpl.adornChoiceRules(rule);
			
			//can be modified if i want to adorn facts too
			} 
			else {
				if(rule.includes(":~"))
					this.adornerImpl.adornWeak(rule);
				else 
					this.adornerImpl.adornFacts(rule);
			}});
			//final append
			if(this.adornerImpl.getDebugRules().length>0){
				this.adornerImpl.appendDebugRules();
			}
			//logic_program = this.adornedProgram;
	}
	public getDebugAtomsMap(): Map<string,DebugAtom>{return this.adornerImpl.getDebugAtomsMap();}
    //public adornRules(): Map<string, DebugAtom> { return null; }
}

export function addDebugAtomsChoiceRule(rules: string, atoms: string, debug_predicate: string, support_predicate: string): string {
	let placeholders: Map<string, string>  = new Map<string, string>();

	let id_of_debug: Array<string> = atoms.match(new RegExp(`^([0-9]+) (${debug_predicate}|${support_predicate}).*\n`, "gm"));
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