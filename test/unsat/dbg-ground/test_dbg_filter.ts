import assert from "assert";
import { describe, it } from "mocha";
import { DebugRuleFilter, DebugRuleGroup } from "../../../src/dbg-ground/dbg_filter";

describe('Debug rule filter through ASP annotations', function()
{
    //
    // it is assumed that strings have been properly freezed
    //

    [
        {
        input_program:
        "a. p :- q.\n" + 
        "%@skip.\n" +
        "p :- q." +
        "q :- not b.",
        expected:
            [
            new DebugRuleGroup(
            "a. p :- q.\n", 0
            ),
            new DebugRuleGroup(
            "p :- q." +
            "q :- not b.", 1
            )
            ]
        }
    ]
    .forEach( function(test_case)
    {
        it('Annotated ruled are properly filtered', function()
        {
            let filter: DebugRuleFilter = new DebugRuleFilter(test_case.input_program);
            assert.deepEqual( filter.getRuleGroups(), test_case.expected );
        });
    });
});