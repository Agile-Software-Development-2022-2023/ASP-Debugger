import { spawnSync, SpawnSyncReturns } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

export class AspGrounderError extends Error
{
    public constructor(message?: string) {super(message);}
}

export abstract class AspGrounder
{
    private static instance: AspGrounder = null;
    public static getInstance(): AspGrounder
    {
        if ( this.instance == null )
            this.instance = new AspGrounderGringo();
        return this.instance;
    }
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

class AspGrounderGringo extends AspGrounder
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