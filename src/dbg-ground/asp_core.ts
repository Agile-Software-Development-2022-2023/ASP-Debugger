export class AspRule
{
    private body: string;
    private globvars: string[];

    public constructor(body:string, globvars:string[] = []){
        this.body = body;
        this.globvars = globvars;
    }

    public getRule(){
        return this.body;    
    }
    
    public getGlobVars(){
        return this.globvars;
    }

    public setBody(body: string){
        this.body = body;
    }

    public setGlobVars(globvars: string[]){
        this.globvars = globvars;
    }

    public getBody(){
        return this.body;
    }
    public isFact():boolean{ return this.body.length == 0; }

}

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