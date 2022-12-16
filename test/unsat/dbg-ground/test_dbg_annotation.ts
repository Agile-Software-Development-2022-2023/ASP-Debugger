import assert from "assert";
import { describe, it } from "mocha";
import { DebugAnnotationError, DebugRuleAnnotation } from "../../../src/dbg-ground/dbg_annotation";

describe('Customize rules to debug through ASP annotations', function()
{
    [
        { annotation: "%@skip.", skip: true},
        { annotation: "%@ skip. ", skip: true},
        { annotation: "%@correct.", skip: true},
        { annotation: "   %@ correct  . ", skip: true},
        { annotation: "%@check.", skip: false},
        { annotation: " %@   check  .", skip: false}
    ]
    .forEach( function(annotationRule)
    {
        it('Properly parses debug annotations from an input program', function()
        {
            assert.strictEqual( 
                DebugRuleAnnotation.parseAnnotation(annotationRule.annotation).skipRule(),
                annotationRule.skip );
        });
    });

    [
        "%@a_name.\n",
        "%@correct not_supported.",
        "%@skip",
        "%@check",
        "%@."
    ]
    .forEach( function(annotation)
    {
        it('Raises an error in case of a not supported debug annotation', function()
        {
            const parse_run = () => DebugRuleAnnotation.parseAnnotation(annotation);
            assert.throws(parse_run, DebugAnnotationError);
        });
    });

    [
        // no annotation, only comment
        "% @skip.", "  %   @check.", "% @annotation not supported."
    ]
    .forEach( function(comment)
    {
        it('Does not confuse comments with annotations', function()
        {
            assert.strictEqual(DebugRuleAnnotation.parseAnnotation(comment), null);
        });
    });
});