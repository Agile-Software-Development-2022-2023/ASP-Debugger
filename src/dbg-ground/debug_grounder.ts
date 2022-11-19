import { spawnSync, SpawnSyncReturns } from "child_process";

const GRINGO_WRAPPER = './src/dbg-ground/gringo-wrapper/bin/gringo-wrapper';
const GRINGO_WRAPPER_OPTIONS = ['-go="-o smodels"']

export class DebugAtom
{
    private predicateName: string;
    private predicateArity: number;
    private variables: string[];
    private nonground_rule: string;

    public constructor(predName: string, predArity: number, 
        vars: string[], rl: string)
    {
        this.predicateName = predName;
        this.predicateArity = predArity;
        this.variables = vars;
        this.nonground_rule = rl;
    }

    public getPredicateName(): string  { return this.predicateName; }
    public getPredicateArity(): number { return this.predicateArity; }
    public getVariables(): string[]    { return this.variables; }
    public getNonGroundRule(): string  { return this.nonground_rule; }
}

export class DebugGrounderError extends Error
{
    public constructor(message?: string) {super(message);}
}

export abstract class DebugGrounder
{
    protected encodings: string[];
    protected debugAtomsMap: Map<string, DebugAtom>;

    public constructor(encoding_paths: string | string[])
    {
        if ( typeof encoding_paths === "string" ) this.encodings = [encoding_paths];
        else this.encodings = encoding_paths;
        this.debugAtomsMap = new Map<string, DebugAtom>;
    }

    public getEncodings(): string[]
    { return this.encodings; }

    public abstract ground(): string;

    public getDebugAtomsMap(): Map<string, DebugAtom>
    { return this.debugAtomsMap; }

    public static createDefault(encoding_paths: string | string[]): DebugGrounder
    { return new GringoWrapperDebugGrounder(encoding_paths); }
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
            
            gw_proc = spawnSync( GRINGO_WRAPPER, gw_args, {encoding: 'utf-8'});
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