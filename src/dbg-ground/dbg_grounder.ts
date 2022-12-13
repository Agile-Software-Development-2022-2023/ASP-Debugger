import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";
import { DebugAtom } from "./asp_core";
import { AspGrounder, AspGrounderError, AspGrounderFactory } from "./grounder";
import { addDebugAtomsChoiceRule, AdornedDebugProgramBuilder, DefaultAdornerPolicy } from "./adorner";
import { DebugRuleFilter, DebugRuleGroup } from "./dbg_filter";
import { ALL } from "dns";

const GRINGO_WRAPPER = './src/dbg-ground/gringo-wrapper/bin/gringo-wrapper';
const GRINGO_WRAPPER_OPTIONS = ['-go="-o smodels"']

export class DebugGrounderError extends AspGrounderError
{
    public constructor(message?: string) {super(message);}
}

export abstract class DebugGrounder
{
    protected encodings: string[];
    protected debugAtomsMap: Map<string, DebugAtom>;
    protected debug_predicate: string;
    public constructor(encoding_paths: string | string[])
    {
        if ( typeof encoding_paths === "string" ) this.encodings = [encoding_paths];
        else this.encodings = encoding_paths;
        this.debugAtomsMap = new Map<string, DebugAtom>();
        this.debug_predicate =  "_debug";
    }

    public getEncodings(): string[]
    { return this.encodings; }

    public abstract ground(): string;

    public getDebugAtomsMap(): Map<string, DebugAtom>
    { return this.debugAtomsMap; }
    public getDebugPredicate():string{return this.debug_predicate;};
    public static createDefault(encoding_paths: string | string[]): DebugGrounder
    { return new RewritingBasedDebugGrounder(encoding_paths); 
      //return new GringoWrapperDebugGrounder(encoding_paths); 
    }
}

class GringoWrapperDebugGrounder extends DebugGrounder
{
    public constructor(encoding_paths: string | string[])
    { super(encoding_paths); }

    public ground(): string
    {
        let gw_proc: SpawnSyncReturns<string>;
        try
        {
            let gw_args: string[] = [];
            let gw_output: SpawnSyncReturns<string>;
        
            GRINGO_WRAPPER_OPTIONS.forEach( function(opt: string) {gw_args.push(opt)} );
            this.encodings.forEach( function(enc: string) {gw_args.push(enc)} );
            
            gw_proc = spawnSync( GRINGO_WRAPPER, gw_args, {encoding: 'utf-8', cwd: path.resolve(__dirname, "../../")} );
        }
        catch(err)
            { throw new DebugGrounderError(err); }
        
        if ( !gw_proc.stdout )
            throw new DebugGrounderError('Invalid gringo-wrapper exec.');
        
        if ( gw_proc.stderr && gw_proc.stderr.match(/not\sfound|error/).length > 0 )
            throw new DebugGrounderError(gw_proc.stderr);

        return this.extractDebugAtomsMap(gw_proc.stdout);
    }

    private extractDebugAtomsMap( gw_output: string ): string
    {
        let ground_prog_rules: string[] = [];
        let b_minus_found: boolean = false;
        let b_minus_index: number;
        let ground_prog_done: boolean = false;
        this.debugAtomsMap.clear();

        let i: number = 0;
        for ( var line of gw_output.split(/\n/) )
        {
            let rule_fields: string[] = line.split(' ');
            let code: string = rule_fields[0];

            if ( code === 'B-' )
            {
                b_minus_found = true;
                b_minus_index = i;
            }
            if ( b_minus_found && code === '10' )
            {
                const debug_predname: string = rule_fields[1];
                const debug_predarity: number = Number.parseInt(rule_fields[2]);
                let variables: string[] = [];
                
                let i=0;
                for ( ; i<debug_predarity; ++i )
                    variables.push(rule_fields[3+i]);
                
                let nonground_rule: string = rule_fields.slice(3+i).join(' ');
                this.debugAtomsMap.set
                    (debug_predname, new DebugAtom(debug_predname, debug_predarity, variables, nonground_rule));
                
                ground_prog_done = true;
            }
            
            if ( !ground_prog_done ) ground_prog_rules.push(line);
            ++i;
        }

        return ground_prog_rules.slice(0, b_minus_index+4).join("\n");
    }
    
}

export class RewritingBasedDebugGrounder extends DebugGrounder
{
    public ground(): string
    {
        let input_program: string = AspGrounder.loadProgram(this.encodings);
        
        //
        // pre-ground rewriting.
        //
        let nongroundDebugProgBuilder: AdornedDebugProgramBuilder = new AdornedDebugProgramBuilder();
        
        input_program = nongroundDebugProgBuilder.cleanString(input_program);
        this.debug_predicate = nongroundDebugProgBuilder.make_unique_debug_prefix(input_program);
        let debugRuleFilter: DebugRuleFilter = new DebugRuleFilter(input_program);
        
        nongroundDebugProgBuilder.setDefaultPolicy(DefaultAdornerPolicy.ALL);

        for ( let ruleGroup of debugRuleFilter.getRuleGroups() )
        {
            //
            // set the new group o rules to adorn 
            //
            nongroundDebugProgBuilder.setCurrentRuleGroup(ruleGroup);
            
            //
            // remove comments from the rule group
            //
            nongroundDebugProgBuilder.removeComments();
            
            //
            // program adornment.
            //
            nongroundDebugProgBuilder.adornProgram();
            nongroundDebugProgBuilder.restorePlaceholderToString();
        }

        //
        // adorned program grounding.
        //
        let adorned:string = nongroundDebugProgBuilder.getAdornedProgram();
        let ground_prog: string = AspGrounderFactory.getInstance().getTheoretical().ground(adorned);
        
        //get Maps of Debug Atom after the calculatoin of the preprocessed ground program
        this.debugAtomsMap = nongroundDebugProgBuilder.getDebugAtomsMap();

        //
        // apply the post-ground rewriting.
        //
        // ground_prog will be properly rewrited to obtain the final debug program...
        let split:Array<string> =  ground_prog.split(/^0\n/gm); 
        split[0] = addDebugAtomsChoiceRule(split[0], split[1], nongroundDebugProgBuilder.getDebugPredicate());

        return split.join("0\n");
    }
}