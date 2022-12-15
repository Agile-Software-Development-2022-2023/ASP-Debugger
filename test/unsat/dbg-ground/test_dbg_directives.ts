import assert from "assert";
import { describe, it } from "mocha";
import { DefaultAdornerPolicy } from "../../../src/dbg-ground/adorner";
import { DebugDirectives, DebugDirectiveError } from "../../../src/dbg-ground/dbg_directives";

describe('Debug directives through ASP annotations', function()
{
    [
        {
        input_program: "",
        default_policy: DefaultAdornerPolicy.RULES_ONLY,
        negate_policy: false
        },

        {
        input_program: "%#debug default=rules_only.",
        default_policy: DefaultAdornerPolicy.RULES_ONLY,
        negate_policy: false
        },

        {
        input_program: "%#debug     default =   facts_only.",
        default_policy: DefaultAdornerPolicy.FACTS_ONLY,
        negate_policy: false
        },

        {
        input_program: "%#debug default=   all.",
        default_policy: DefaultAdornerPolicy.ALL,
        negate_policy: false
        },

        {
        input_program: "%#debug default=none  .   ",
        default_policy: DefaultAdornerPolicy.ALL,
        negate_policy: true
        }
    ]
    .forEach( function(test_case)
    {
        it('Properly parses debug directive from an input program', function()
        {
            ["", "\naa.\n\n", "aa.%#debug default=all.\npp.\n%#debug default=none.\n%#debug default=facts_only.\n"]
            .forEach ( function(prefix)
            {
            
            ["", "\naa.\n\n", "\np :- q.\n"]
            .forEach( function(suffix)
            {
                let __prefix: string = prefix;
                if ( test_case.input_program.match(/^\s*$/) != null )
                    __prefix = '';
                
                let dirs: DebugDirectives = DebugDirectives.getInstance();
                dirs.reset();

                dirs.parseDirectives( __prefix + test_case.input_program + suffix );
                assert.strictEqual(dirs.getDefaultAdornerPolicy(), test_case.default_policy);
                assert.strictEqual(dirs.isNegateDefaultAdornerPolicy(), test_case.negate_policy);
            });

            });
        });
    });

    [
        {
        input_program: "% #debug default=all.",  // no directive, only comment
        default_policy: DefaultAdornerPolicy.RULES_ONLY,
        negate_policy: false
        },

        {
        input_program: "% #debug default\n\n",  // no directive, only comment
        default_policy: DefaultAdornerPolicy.RULES_ONLY,
        negate_policy: false
        }
    ]
    .forEach( function(test_case)
    {
        it('Does not confuse comments with directives', function()
        {
            let dirs: DebugDirectives = DebugDirectives.getInstance();
            dirs.reset();

            dirs.parseDirectives( test_case.input_program );
            assert.strictEqual(dirs.getDefaultAdornerPolicy(), test_case.default_policy);
            assert.strictEqual(dirs.isNegateDefaultAdornerPolicy(), test_case.negate_policy);
        });
    });

    [
        "%#de_bug default==.\n",
        "a :- p.\n%#debug not_supported=nothing.\n",
        "\n%#debug default=all_only.\n",
        "%#debug default=all",
        "\n%#.\n"
    ]
    .forEach( function(input_program)
    {
        it('Raises an error in case of a not supported debug directive', function()
        {
            const parse_run = () => DebugDirectives.getInstance().parseDirectives(input_program);
            assert.throws(parse_run, DebugDirectiveError);
        });
    });
});