import { DefaultAdornerPolicy } from "./adorner";
import { DebugRuleAnnotation } from "./dbg_annotation";

export class DebugDirectiveError extends Error
{
    public constructor(message?: string) {super(message);}
}

export class DebugDirectives
{
    private static instance: DebugDirectives = null;
    private defaultAdornerPolicy: DefaultAdornerPolicy = DefaultAdornerPolicy.RULES_ONLY;
    private negateDefaultAdornerPolicy: boolean = false;

    public static getInstance(): DebugDirectives
    {
        if ( DebugDirectives.instance == null )
            DebugDirectives.instance = new DebugDirectives();
        return DebugDirectives.instance;
    }

    public parseDirectives( input_program: string ): string
    {
        this.reset();
        let __this: DebugDirectives = this;
        return input_program.replace(/^\s*%#(.*)$/gm,
        function(dir_match, dir_content)
        {
            let dir_content_match = dir_content.match(/^debug\s+default\s*=\s*(rules_only|facts_only|all|none)\s*\.\s*$/);
            if ( dir_content_match == null )
                throw new DebugDirectiveError('Directive "' + dir_match + '" not supported.');
            
            __this.reset();
            
            const policy: string = dir_content_match[1];
            if      ( policy === 'facts_only' ) __this.defaultAdornerPolicy = DefaultAdornerPolicy.FACTS_ONLY;
            else if ( policy === 'all' ) __this.defaultAdornerPolicy = DefaultAdornerPolicy.ALL;
            else if ( policy === 'none' )
            {
                __this.defaultAdornerPolicy = DefaultAdornerPolicy.ALL;
                __this.negateDefaultAdornerPolicy = true;
            }
            return '';
        });
    }

    public reset()
    {
        this.defaultAdornerPolicy = DefaultAdornerPolicy.RULES_ONLY;
        this.negateDefaultAdornerPolicy = false;
    }

    public getDefaultAdornerPolicy(): DefaultAdornerPolicy { return this.defaultAdornerPolicy; }
    public isNegateDefaultAdornerPolicy(): boolean { return this.negateDefaultAdornerPolicy; }

    public getStartingDebugRuleAnnotation(): DebugRuleAnnotation
    {
        if ( this.defaultAdornerPolicy == DefaultAdornerPolicy.ALL &&
            this.negateDefaultAdornerPolicy )
            return new DebugRuleAnnotation(true, true);
        return null;
    }

    private constructor() {}
}