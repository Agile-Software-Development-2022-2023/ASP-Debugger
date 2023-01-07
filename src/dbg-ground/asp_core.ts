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
    
    public equals(other) {
        return other.predicateArity == this.predicateArity && other.variables === this.variables && this.nonground_rule === other.nonground_rule && this.predicateName === other.predicateName;
     };

    public getPredicateName(): string  { return this.predicateName; }
    public getPredicateArity(): number { return this.predicateArity; }
    public getVariables(): string[]    { return this.variables; }
    public getNonGroundRule(): string  { return this.nonground_rule; }
    public setNonGroundRule(nonground_rule: string)   { this.nonground_rule = nonground_rule; }
}

export class Predicate
{
    private predicateName: string;
    private predicateArity: number;

    public constructor(predName: string, predArity: number = 0)
    {
        this.predicateName = predName;
        this.predicateArity = predArity;
    }
    
    public equals(other) {
        return this.predicateName === other.predicateName && other.predicateArity === this.predicateArity;
     };

    public getPredicateName(): string  { return this.predicateName; }
    public getPredicateArity(): number { return this.predicateArity; }

    public static getFromAtom( atom: string ): Predicate
    {
        let matches = atom.match(/\s*([a-z\-_][a-zA-Z0-9_]*)\s*(\(([\sa-zA-Z0-9_,\-#\(\)\.]*?)\))?\s*/);
        if ( matches == null ) return null;

        let predname: string = matches[1];
        let termslist: string = matches[3];

        if ( termslist == undefined ) return new Predicate(predname);
        
        termslist = termslist.replace(/\(.*\)/g, '');
        return new Predicate(predname, termslist.split(',').length);
    }
}