
export class DebugRuleGroup
{
    private rules: string;
    private skip_count: number;

    public constructor(rules: string, skip_count: number)
    {
        this.rules = rules;
        this.skip_count = skip_count;
    }

    public getRules(): string { return this.rules; }
    public getSkipCount(): number { return this.skip_count; }
}

export class DebugRuleFilter
{
    private rule_groups: DebugRuleGroup[] = [];

    //
    // it is assumed that strings have been properly freezed
    //
    public constructor(program: string)
    {
        let group_headers: string[] = [];
        let group_id: number = 0;
        program = program.replace(/^\s*%@(.*)\.\n/gm, function(match, annotation_name)
        {
            let header: string = '#' + annotation_name + '-' + (++group_id) + '#';
            group_headers.push(header);
            return header;
        });

        for ( let header of group_headers )
        {
            let group_split: string[] = program.split(header);
            if ( group_split.length > 1 )
                this.rule_groups.push( new DebugRuleGroup(group_split[0], 0) );
            this.rule_groups.push( new DebugRuleGroup(group_split[1], 1) );
        }
    }

    public getRuleGroups(): DebugRuleGroup[] { return this.rule_groups; }

}