import assert from "assert";
import { MUSesCalculator } from "../../../src/muses_facade"

describe('MUSes calculator for missing support', function()
{
    [
        {
        input_program: 'test/unsat/support_tests/missing_support_1.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['a(1)', new Set(['a(X) :- b(X)'])]
        ])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_2.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['a(1)', new Set(['a(X) :- b(X)', 'a(X) | _a(X,Y) :- b(X), b(Y)'])]
        ])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_3.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['_support(1)', new Set(
                ['_support(X) :- b(X)', 
                 '_support(X) | _a(X,Y) :- b(X), b(Y)',
                 '1 <= \n{ _support(X) } \n<= 2 :- b(X), b(Y)',
                 '{ _support(X): \nb(X), b(Y); _support(3) }'])]
        ])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_4.lp',
        expected_missing_support: new Map<string, Set<string>>()        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_5.lp',
        expected_missing_support: new Map<string, Set<string>>()        
        },

        {
        input_program: 'test/unsat/support_tests/empty.lp',
        expected_missing_support: new Map<string, Set<string>>()        
        }
    ]
    .forEach( function(test_case)
    {
        it('Returns the set of non-ground rules that could deduce a not supported atom but they do not.', function()
        {
            let musesCalculator: MUSesCalculator = new MUSesCalculator();
            musesCalculator.calculateMUSes( [test_case.input_program], 1 );
            assert.deepStrictEqual( musesCalculator.getMissingSupportRulesFromMUS(0), test_case.expected_missing_support );
        });
    });


    [
        'test/unsat/support_tests/missing_support_disable_1.lp',
        'test/unsat/support_tests/missing_support_disable_2.lp',
        'test/unsat/support_tests/missing_support_disable_3.lp',
        'test/unsat/support_tests/missing_support_disable_4.lp'
    ]
    .forEach( function(test_case)
    {
        it('Returns an empty set of non-ground rules when missing support is disabled.', function()
        {
            let musesCalculator: MUSesCalculator = new MUSesCalculator();
            musesCalculator.calculateMUSes( [test_case], 1 );
            assert.deepStrictEqual( musesCalculator.getMissingSupportRulesFromMUS(0), new Map<string, Set<string>>() );
        });
    });
});