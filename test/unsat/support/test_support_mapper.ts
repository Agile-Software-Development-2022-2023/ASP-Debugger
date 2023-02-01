import assert from "assert";
import { SupportRuleMapper } from "../../../src/support/support_mapper";

describe('Support rule mapper', function()
{
    [
        {input_rule: "p(X)\n :- q(X), not r(X)", expected_map: new Map<string, Set<string>>([
            [ 'p/1', new Set<string>(['p(X)\n :- q(X), not r(X).'])]
        ])},

        {input_rule: " _p_1(X)|  _p_2(X,\nY)\n |aa|aa \n:- q(X,Y), not r(X)", expected_map: new Map<string, Set<string>>([
            [ '_p_1/1', new Set<string>(['_p_1(X)|  _p_2(X,\nY)\n |aa|aa \n:- q(X,Y), not r(X).'])],
            [ '_p_2/2', new Set<string>(['_p_1(X)|  _p_2(X,\nY)\n |aa|aa \n:- q(X,Y), not r(X).'])],
            [ 'aa/0',   new Set<string>(['_p_1(X)|  _p_2(X,\nY)\n |aa|aa \n:- q(X,Y), not r(X).'])]
        ])},

        {input_rule: "a|b|c|d", expected_map: new Map<string, Set<string>>([])},

        {input_rule: "",    expected_map: new Map<string, Set<string>>()},
        {input_rule: "   ", expected_map: new Map<string, Set<string>>()}
    ]
    .forEach( function(test_case)
    {
        it('Maps a classic rule with the corresponding deducible atoms (predicates)', function()
        {
            let mapper: SupportRuleMapper = new SupportRuleMapper();
            mapper.mapRule( test_case.input_rule );
            mapper.mapRule( test_case.input_rule );  // to check duplicates are ignored
            
            assert.deepStrictEqual( mapper.getMap(), test_case.expected_map );
        });
    });

    
    [
        {input_rule: " { p(X) } :- q(X), not r(X)", expected_map: new Map<string, Set<string>>([
            [ 'p/1', new Set<string>(['{ p(X) } :- q(X), not r(X).'])]
        ])},

        {input_rule: " 2 \n<= {_p_1(X)\n:\nk(Y);  _p_2(X,Y) ;\naa;aa} <= 5 :- \nq(X,Y), not r(X)",
         expected_map: new Map<string, Set<string>>([
            [ '_p_1/1', new Set<string>(['2 \n<= {_p_1(X)\n:\nk(Y);  _p_2(X,Y) ;\naa;aa} <= 5 :- \nq(X,Y), not r(X).'])],
            [ '_p_2/2', new Set<string>(['2 \n<= {_p_1(X)\n:\nk(Y);  _p_2(X,Y) ;\naa;aa} <= 5 :- \nq(X,Y), not r(X).'])],
            [ 'aa/0',   new Set<string>(['2 \n<= {_p_1(X)\n:\nk(Y);  _p_2(X,Y) ;\naa;aa} <= 5 :- \nq(X,Y), not r(X).'])]
        ])},

        {input_rule: "\n\n   1 <=   {\na:b;c;d\n} <= 2", expected_map: new Map<string, Set<string>>([
            ['a/0', new Set<string>(['1 <=   {\na:b;c;d\n} <= 2.'])]
        ])},

        {input_rule: "{a;b;c;d;;;;}", expected_map: new Map<string, Set<string>>()},

        {input_rule: "",    expected_map: new Map<string, Set<string>>()},
        {input_rule: "   ", expected_map: new Map<string, Set<string>>()}
    ]
    .forEach( function(test_case)
    {
        it('Maps a choice rule with the corresponding deducible atoms (predicates)', function()
        {
            let mapper: SupportRuleMapper = new SupportRuleMapper();
            mapper.mapRule( test_case.input_rule );
            mapper.mapRule( test_case.input_rule );  // to check duplicates are ignored
            
            assert.deepStrictEqual( mapper.getMap(), test_case.expected_map );
        });
    });
});