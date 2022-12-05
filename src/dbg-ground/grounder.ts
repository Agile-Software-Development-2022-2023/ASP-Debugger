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
                program += readFileSync(ppath, 'utf-8');
            return program;
        }
        catch (err) { throw new AspGrounderError('Loading ASP program error.'); }
    }
    public abstract ground(inputProgram: string): string;
}

export class AspGrounderGringo extends AspGrounder
{
    private static GRINGO_COMMAND: string = 'gringo';
    private static GRINGO_OPTIONS: string = '-o smodels';

    public ground(inputProgram: string): string
    {
        let gringo_proc: SpawnSyncReturns<string>;
        try
        {
            gringo_proc = spawnSync( AspGrounderGringo.GRINGO_COMMAND, AspGrounderGringo.GRINGO_OPTIONS.split(/\s+/),
                {encoding: 'utf-8', cwd: path.resolve(__dirname, "../../"), input: inputProgram} );
        }
        catch(err)
            { throw new AspGrounderError(err); }
        
        if ( !gringo_proc.stdout )
            throw new AspGrounderError('Invalid gringo exec.');

        if ( gringo_proc.stderr && gringo_proc.stderr.match(/not\sfound|error/i).length > 0 )
            throw new AspGrounderError(gringo_proc.stderr);
        
        return gringo_proc.stdout;
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
            /((?<=((?<!\.)\.(?!\.)))|^)(([ a-zA-Z0-9(),_\-#]|(\.\.))*)(?=((?<!\.)\.(?!\.)))/gm,
            "$3 :- _df") + "\n_df | -_df.";
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

    public getDefault(): AspGrounder { return new AspGrounderGringo(); }
    public getTheoretical(): TheoreticalAspGrounder { return new TheoreticalAspGrounder(new AspGrounderGringo()); }
}
