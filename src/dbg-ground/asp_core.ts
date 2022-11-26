export class AspRule
{
    private body: string;
    private head: string;
    private globvars: string[];

    public getRule(){
        return this.head.concat(":-"+this.body);
    }
    
    public getGlobVars(){
        return this.globvars;
    }

    public setBody(body: string){
        this.body = body;
    }

    public setHead(head: string){
        this.head = head;
    }

    public setGlobVars(globvars: string[]){
        this.globvars = globvars;
    }

    public getHead(){
        return this.head;
    }

    public getBody(){
        return this.body;
    }


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