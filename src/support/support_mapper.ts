import { Predicate } from "../dbg-ground/asp_core";

export class SupportRuleMapper
{
    private supportMap: Map<string, Set<string>> = new Map<string, Set<string>>();

    public mapSimpleRule( rule: string )
    {
        if ( rule.match(':-') == null )
            return;
        
        let head_atoms: string[] = rule.split(':-')[0].split('|');
        for ( let atom of head_atoms )
        {
            let atomPredicate: Predicate = Predicate.getFromAtom(atom);
            if ( atomPredicate == null ) continue;

            let atomPredicateStr: string = atomPredicate.getPredString();
            if ( !this.supportMap.has(atomPredicateStr) )
                this.supportMap.set(atomPredicateStr, new Set<string>());
            this.supportMap.get(atomPredicateStr).add(rule.trim());
        }
    }

    public getMap(): Map<string, Set<string>> { return this.supportMap; }
}