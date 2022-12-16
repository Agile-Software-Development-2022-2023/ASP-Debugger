import { DefaultAdornerPolicy } from "./adorner";
import { DebugDirectives } from "./dbg_directives";

export class DebugAnnotationError extends Error
{
    public constructor(message?: string) {super(message);}
}

export class DebugRuleAnnotation
{
    private skip: boolean;
    private nested: boolean;

    public constructor( skip: boolean, nested: boolean = false )
    { this.skip = skip; this.nested = nested; }

    public static parseAnnotation( input_rule: string ): DebugRuleAnnotation
    {
        let annotationMatch = input_rule.match(/^\s*%@\s*(skip|correct|check)\s*\.\s*$/)
        if ( annotationMatch == null )
        {
            annotationMatch = input_rule.match(/^\s*%@/);
            if ( annotationMatch != null )
                throw new DebugAnnotationError('Annotation "' + annotationMatch[0] + '" not supported.');
            
            let directives: DebugDirectives = DebugDirectives.getInstance();
            return directives.getDefaultAdornerPolicy() == DefaultAdornerPolicy.ALL &&
                   directives.isNegateDefaultAdornerPolicy()
                   ? new DebugRuleAnnotation( true, true )
                   : null;
        }
        return new DebugRuleAnnotation( annotationMatch[1] != 'check' );
    }

    public skipRule(): boolean { return this.skip; }
    public isNested(): boolean { return this.nested; }
}