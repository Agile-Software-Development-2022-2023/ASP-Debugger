import assert from "assert";
import { SupportRuleMapper } from "../../../src/support/support_mapper";

describe('Support rule mapper', function()
{
    [
        {input_rule: "p(X) :- q(X), not r(X)", expected_map: new Map<string, Set<string>>([
            [ 'p/1', new Set<string>(['p(X) :- q(X), not r(X)'])]
        ])},

        {input_rule: " _p_1(X)|  _p_2(X,Y) |aa|aa :- q(X,Y), not r(X)", expected_map: new Map<string, Set<string>>([
            [ '_p_1/1', new Set<string>(['_p_1(X)|  _p_2(X,Y) |aa|aa :- q(X,Y), not r(X)'])],
            [ '_p_2/2', new Set<string>(['_p_1(X)|  _p_2(X,Y) |aa|aa :- q(X,Y), not r(X)'])],
            [ 'aa/0',   new Set<string>(['_p_1(X)|  _p_2(X,Y) |aa|aa :- q(X,Y), not r(X)'])]
        ])},

        {input_rule: "a|b|c|d", expected_map: new Map<string, Set<string>>([])},

        {input_rule: "",    expected_map: new Map<string, Set<string>>()},
        {input_rule: "   ", expected_map: new Map<string, Set<string>>()}
    ]
    .forEach( function(test_case)
    {
        it('Maps a simple rule with the corresponding deducible atoms (predicates)', function()
        {
            let mapper: SupportRuleMapper = new SupportRuleMapper();
            mapper.mapSimpleRule( test_case.input_rule );
            mapper.mapSimpleRule( test_case.input_rule );  // to check duplicates are ignored
            
            let actual_map: Map<string, Set<string>> = mapper.getMap();

            assert.strictEqual(actual_map.size, test_case.expected_map.size);

            for ( var [key, val] of actual_map )
            {
                let expected_val: Set<string>|undefined = test_case.expected_map.get(key);
                assert.deepStrictEqual(val, expected_val);
            }
        });
    });
});