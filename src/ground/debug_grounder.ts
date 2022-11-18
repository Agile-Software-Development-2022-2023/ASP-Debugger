const GRINGO_WRAPPER = './src/ground/gringo-wrapper/bin/gringo-wrapper';
const GRINGO_WRAPPER_OPTIONS = '-go="-o smodels"'

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
		const exec_gw: any = require('child_process').execSync;
		const gw_output: string = 
            exec_gw( GRINGO_WRAPPER + ' ' + GRINGO_WRAPPER_OPTIONS + ' ' + this.encodings.join(' '), {encoding: 'utf-8'});
        return this.extractDebugAtomsMap(gw_output);
    }

    private extractDebugAtomsMap( gw_output: string ): string
    {
        let ground_prog_rules: string[] = [];
        let b_minus_found: boolean = false;
        let ground_prog_done: boolean = false;
        this.debugAtomsMap.clear();

        for ( var line of gw_output.split(/\n/) )
        {
            let rule_fields: string[] = line.split(' ');
            let code: string = rule_fields[0];

            if ( code === 'B-' )
                b_minus_found = true;
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
                
                if ( !ground_prog_done )
                {
                    ground_prog_rules.pop();
                    ground_prog_done = true;
                }
            }
            
            if ( !ground_prog_done ) ground_prog_rules.push(line);
        }

        return ground_prog_rules.join("\n");
    }
    
}