import { spawnSync, SpawnSyncReturns } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { freezeStrings, make_unique, restoreStrings } from './asp_utils';

export class AspGrounderError extends Error
{
    public constructor(message?: string) {super(message);}
}

export abstract class AspGrounder
{
    public static loadProgram(programPaths: string[]): string
    {
        try
        {
            let program: string = "";
            for ( let ppath of programPaths )
                program += readFileSync(ppath, 'utf-8') + "\n";
            return program;
        }
        catch (err) { throw new AspGrounderError('Loading ASP program error.'); }
    }
    public abstract ground(inputProgram: string): string;
}

abstract class ExternalAspGrounder extends AspGrounder
{
    public ground(inputProgram: string): string
    {
        const grounder_command: string = this.getGrounderCommand();
        const grounder_options: string = this.getGrounderOptions();
        let grounder_proc: SpawnSyncReturns<string>;
        try
        {
            grounder_proc = spawnSync( grounder_command, grounder_options.split(/\s+/),
                {encoding: 'utf-8', cwd: path.resolve(__dirname, "../../"), input: inputProgram} );
        }
        catch(err)
            { throw new AspGrounderError(err); }
        
        if ( !grounder_proc.stdout )
            throw new AspGrounderError('Invalid external grounder exec:\n\t' + grounder_proc.toString());

            if ( grounder_proc.stderr  && grounder_proc.stderr.match(/not\sfound|error/i))
            throw new AspGrounderError(grounder_proc.stderr);
        
        return grounder_proc.stdout;
    }

    protected abstract getGrounderCommand(): string;
    protected abstract getGrounderOptions(): string;
}

export class AspGrounderGringo extends ExternalAspGrounder
{
    private static GRINGO_COMMAND: string = 'gringo';
    private static GRINGO_OPTIONS: string = '-o smodels';

    protected getGrounderCommand(): string { return AspGrounderGringo.GRINGO_COMMAND; }
    protected getGrounderOptions(): string { return AspGrounderGringo.GRINGO_OPTIONS; }
}

export class AspGrounderIdlv extends ExternalAspGrounder
{
    private static IDLV_COMMAND: string = './bin/idlv_1.1.6_linux_x86-64';
    private static IDLV_OPTIONS: string = '--stdin';

    protected getGrounderCommand(): string { return AspGrounderIdlv.IDLV_COMMAND; }
    protected getGrounderOptions(): string { return AspGrounderIdlv.IDLV_OPTIONS; }

    public ground(inputProgram: string): string
    {
        if(process.platform == 'win32'){
            throw new Error( "Missing wasp exe for windows so no debuging can be supported after executing idlv");
            //this.sysComm = './bin/wasp-windows';
        }
        else if(process.platform == 'darwin'){
            throw new Error( "Missing wasp for mac so no debuging can be supported after executing idlv");
            //this.sysComm = './bin/wasp-mac';
        }
        const us_unique: string = make_unique('u', inputProgram, 'u');
        return super.ground(IntervalsExpander.expandIntervals(inputProgram.replace(new RegExp(/(^|\W)_(\w)/g), "$1 " + us_unique + "$2")))
            .replace(new RegExp(us_unique, "g"), '_')
            .replace(/\s+\n/g, "\n");
    }
}

export class TheoreticalAspGrounder extends AspGrounder
{
    private grounder: AspGrounder;
    private stringsMap: Map<string, string>;

    public constructor( grnd: AspGrounder )
        { super(); this.grounder = grnd; }
    
    public ground(inputProgram: string): string
    {
        let stringsMap: Map<string, string> = new Map<string, string>();
        inputProgram = freezeStrings(inputProgram, stringsMap);
        inputProgram = this.removeComments(inputProgram);
        inputProgram = this.rewriteFacts(inputProgram);
        inputProgram = restoreStrings(inputProgram, stringsMap);
        return this.nullifyFactRewritings( this.grounder.ground(inputProgram) );
    }

    protected removeComments(input_program: string): string
        { return input_program.replace(/%.*$/gm, ''); }
    
    protected rewriteFacts(input_program: string): string
    {
        //const df_predname: string = this.getDisjFactPredName(input_program);
        return input_program.replace(
            /(?<=^|\.|\])(\s*[a-z\-_][a-zA-Z0-9_]*\s*(\([\sa-zA-Z0-9_,\-#\(\)\.]*?\))?\s*)\./g,
            "$1 :- _df.") + "\n_df | -_df.";
    }    

    protected nullifyFactRewritings(ground_program: string): string
    {
        try
        {
            let sections: string[] = ground_program.split(/^0\n/gm);
            let rules:    string   = sections[0];
            let symbols:  string   = sections[1];
            
            //
            // rewrite symbol table
            //
            const posDisjFactRegexp  : RegExp = new RegExp('^(\\d+) _df\\n' , 'gm');
            const negDisjFactRegexp  : RegExp = new RegExp('^(\\d+) -_df\\n', 'gm');
            const pos_disj_atom_code: string = posDisjFactRegexp.exec(symbols)[1];
            const neg_disj_atom_code: string = negDisjFactRegexp.exec(symbols)[1];
            symbols = symbols.replace(posDisjFactRegexp, '');
            symbols = symbols.replace(negDisjFactRegexp, '');

            //
            // rewrite rules
            //
            const disjFactRuleRegexp  : RegExp = new RegExp('^1 (\\d+) 1 0 ' + pos_disj_atom_code + '$', 'gm');
            const constraintRuleRegexp: RegExp = 
                new RegExp('^1 1 2 0 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                                        + neg_disj_atom_code + ' ' + pos_disj_atom_code + ')\\n', 'gm');
            const disjuncRuleRegexp   : RegExp = 
                new RegExp('^8 2 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                                    + neg_disj_atom_code + ' ' + pos_disj_atom_code + ') 0 0\\n', 'gm');
            rules = rules.replace(disjFactRuleRegexp, '1 $1 0 0');
            rules = rules.replace(constraintRuleRegexp, '');
            rules = rules.replace(disjuncRuleRegexp, '');

            sections[0] = rules;
            sections[1] = symbols;

            return sections.join("0\n");
        }
        catch (err) { return ground_program; }
    }

    protected getDisjFactPredName(input_program: string): string
        { return make_unique('_df', input_program); }

}

export class AspGrounderFactory
{
    private static instance: AspGrounderFactory;

    public static getInstance(): AspGrounderFactory
    {
        if ( AspGrounderFactory.instance == null )
            AspGrounderFactory.instance = new AspGrounderFactory();
        return AspGrounderFactory.instance;
    }

    private constructor() {}

    public getDefault(): AspGrounder { return new AspGrounderIdlv(); }
    public getTheoretical(): TheoreticalAspGrounder { return new TheoreticalAspGrounder(this.getDefault()); }
}

export class IntervalsExpander
{
    public static expandIntervals(input_program: string): string
    {
        let ans: string = '';

        input_program = input_program.replace(/(\[.*?@.*?\])/g, "$1.");
        input_program.split(/(?<!\.)\.(?!\.)/).forEach( rule =>
        {
            if ( rule.match(/^\s*$/) != null || rule.match(/\[.*?@.*?\]/) != null ) { ans += rule; return;}
            if ( rule.match(/:~/) != null ) { ans += rule + '.'; return;}

            let intervalFromIndices:    number[] = [];
            let intervalToIndices:      number[] = [];
            let intervalCurrentIndices: number[] = [];
            let id: number = 0;
            
            rule = rule.replace(/((?:-\s*)?\d+)\s*\.\.\s*((?:-\s*)?\d+)/g, function(match, from, to)
            {
                from = Number.parseInt( from.replace(/\s/g, '') );
                to   = Number.parseInt( to  .replace(/\s/g, '') );

                intervalFromIndices.push(from);
                intervalToIndices.push(to);
                intervalCurrentIndices.push(from);

                return '#interval-' + (id++) + '#';
            });

            if ( intervalCurrentIndices.length === 0 )
            {
                ans += rule + '.';
                return;
            }
            
            intervalCurrentIndices[0]--;
            while ( IntervalsExpander.nextIntervalIndices(intervalFromIndices, intervalToIndices, intervalCurrentIndices) )
            {
                let ruleInstance: string = rule;
                for ( let i=0; i<intervalCurrentIndices.length; ++i )
                    ruleInstance = ruleInstance.replace('#interval-' + i + '#', intervalCurrentIndices[i].toString());
                ans += ruleInstance + '.';
            }
        });
        
        return ans;
    }

    private static nextIntervalIndices(intervalFromIndices: number[], intervalToIndices: number[], intervalCurrentIndices: number[]): boolean
    {
        let i: number = 0;
        while ( i < intervalFromIndices.length )
        {
            intervalCurrentIndices[i]++;
            if ( intervalCurrentIndices[i] <= intervalToIndices[i] )
                return true;
            
            intervalCurrentIndices[i] = intervalFromIndices[i];
            i++;
        }
        return false;
    }
}