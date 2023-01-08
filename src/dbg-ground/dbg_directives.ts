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
    private missingSupportEnabled: boolean = true;

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
            if ( !__this.__parseDefaultPolicyDirective( dir_content ) &&
                 !__this.__parseMissingSupportDirective( dir_content ) )
                throw new DebugDirectiveError('Directive "' + dir_match + '" not supported.');
            return '';
        });
    }

    private __parseDefaultPolicyDirective( dir_content: string ): boolean
    {
        let dir_content_match = dir_content.match(/^debug\s+default\s*=\s*(rules_only|facts_only|all|none)\s*\.\s*$/);
        if ( dir_content_match == null )
            return false;
        
        this.reset();
        
        const policy: string = dir_content_match[1];
        if      ( policy === 'facts_only' ) this.defaultAdornerPolicy = DefaultAdornerPolicy.FACTS_ONLY;
        else if ( policy === 'all' ) this.defaultAdornerPolicy = DefaultAdornerPolicy.ALL;
        else if ( policy === 'none' )
        {
            this.defaultAdornerPolicy = DefaultAdornerPolicy.ALL;
            this.negateDefaultAdornerPolicy = true;
        }

        return true;
    }

    private __parseMissingSupportDirective( dir_content: string ): boolean
    {
        let dir_content_match = dir_content.match(/^debug\s+support\s*=\s*none\s*\.\s*$/);
        if ( dir_content_match == null )
            return false;
        
        this.reset();
        this.missingSupportEnabled = false;

        return true;
    }

    public reset()
    {
        this.defaultAdornerPolicy = DefaultAdornerPolicy.RULES_ONLY;
        this.negateDefaultAdornerPolicy = false;
        this.missingSupportEnabled = true;
    }

    public getDefaultAdornerPolicy(): DefaultAdornerPolicy { return this.defaultAdornerPolicy; }
    public isNegateDefaultAdornerPolicy(): boolean { return this.negateDefaultAdornerPolicy; }
    public isMissingSupportEnabled(): boolean { return this.missingSupportEnabled; }

    public getStartingDebugRuleAnnotation(): DebugRuleAnnotation
    {
        if ( this.defaultAdornerPolicy == DefaultAdornerPolicy.ALL &&
            this.negateDefaultAdornerPolicy )
            return new DebugRuleAnnotation(true, true);
        return null;
    }

    private constructor() {}
}