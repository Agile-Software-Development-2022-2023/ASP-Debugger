import { Predicate } from "../dbg-ground/asp_core";

export class SupportRuleMapper
{
    private supportMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    
    public mapRule( rule: string )
    {
        if (  rule.includes(':~') ) return;
        if ( !rule.includes(':-') )
        {
            this.tryMapChoice(rule, rule, false);
            return;
        }
        
        let head_body = rule.split(':-');
        if ( head_body[1].trim().length === 0 )
        {
            this.tryMapChoice(head_body[0], rule, false);
            return;
        }

        if ( head_body[0].includes('|') || head_body[0].match(/[{}]/) == null )
        {
            let head_atoms: string[] = head_body[0].split('|');
            for ( let atom of head_atoms )
                this.addSupport( atom, rule );
        }
        else this.tryMapChoice( head_body[0], rule );
    }

    private tryMapChoice( head: string, rule: string, hasBody: boolean = true )
    {
        if ( head.includes('|') ) return;
        
        let choiceMatch = head.match(/{((.|\n)*)}/);
        if ( choiceMatch == null ) return;

        let choiceElems: string[] = choiceMatch[1].split(';');
        for ( let elem of choiceElems )
        {
            let elemAtoms: string[] = elem.split(':');
            if ( elemAtoms.length < 2 && !hasBody ) continue;

            this.addSupport( elemAtoms[0], rule );
        }
    }

    private addSupport( atom: string, rule: string )
    {
        let atomPredicate: Predicate = Predicate.getFromAtom(atom);
        if ( atomPredicate == null ) return;

        let atomPredicateStr: string = atomPredicate.getPredString();
        if ( !this.supportMap.has(atomPredicateStr) )
            this.supportMap.set(atomPredicateStr, new Set<string>());
        this.supportMap.get(atomPredicateStr).add(rule.trim() + '.');
    }

    public getMap(): Map<string, Set<string>> { return this.supportMap; }
}