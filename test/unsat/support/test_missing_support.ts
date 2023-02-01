import assert from "assert";
import { MUSesCalculator } from "../../../src/muses_facade"

describe('MUSes calculator for missing support', function()
{
    [
        {
        input_program: 'test/unsat/support_tests/missing_support_1.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['a(1)', new Set(['a(X) :- b(X).'])]
        ]),
        expected_buggy_rules: new Set<string>([':- not a(1), k(X).'])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_2.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['a(1)', new Set(['a(X) :- b(X).', 'a(X) | _a(X,Y) :- b(X), b(Y).'])]
        ]),
        expected_buggy_rules: new Set<string>([':- not a(1).'])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_3.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['_support(1)', new Set(
                ['_support(X) :- b(X).', 
                 '_support(X) | _a(X,Y) :- b(X), b(Y).',
                 '0 <= \n{ _support(X) } \n<= 2 :- b(X), b(Y).',
                 '{ _support(X): \nb(X), b(Y); _support(3) }.'])]
        ]),
        expected_buggy_rules: new Set<string>([':- not _support(1).'])            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_4.lp',
        expected_missing_support: new Map<string, Set<string>>(),
        expected_buggy_rules: new Set<string>([':- b(2).'])            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_5.lp',
        expected_missing_support: new Map<string, Set<string>>(),
        expected_buggy_rules: new Set<string>()            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_6.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['d(1)', new Set(['d(X) :- f(X,Y), a(Y).'])]
        ]),
        expected_buggy_rules: new Set<string>([':- c(1), not d(1).'])            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_7.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['f',    new Set()],
            ['p(1)', new Set(['p(1) :- f.'])],
            ['q(1)', new Set(['q(1) :- f.'])]
        ]),
        expected_buggy_rules: new Set<string>([':- not p(1), not q(1).'])            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_8.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['q(1)', new Set(['q(1) :- k(1,2).'])]
        ]),
        expected_buggy_rules: new Set<string>()            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_9.lp',
        expected_missing_support: new Map<string, Set<string>>(),
        expected_buggy_rules: new Set<string>(['q(1) :- k(1,2).', '2 <= {p(X)} <= 3 :- q(X).'])        
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_10.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['p(11)',   new Set(['p(X) :- k(_,X).'])]
        ]),
        expected_buggy_rules: new Set<string>(['p(X) :- k(_,X).', ':- p(1), not p(11).'])            
        },

        {
        input_program: 'test/unsat/support_tests/missing_support_11.lp',
        expected_missing_support: new Map<string, Set<string>>([
            ['k(2,1)', new Set()]
        ]),
        expected_buggy_rules: new Set<string>([':- not k(2,1).'])          
        },

        {
        input_program: 'test/unsat/support_tests/empty.lp',
        expected_missing_support: new Map<string, Set<string>>(),
        expected_buggy_rules: new Set<string>()            
        }
    ]
    .forEach( function(test_case)
    {
        it('Returns the set of non-ground rules that could deduce a not supported atom but they do not.', function()
        {
            let musesCalculator: MUSesCalculator = new MUSesCalculator();
            musesCalculator.calculateMUSes( [test_case.input_program], 2 );

            const musesCount: number = musesCalculator.getMusesCount();
            assert.ok( musesCount <= 1 );

            let nonGroundRules: Set<string> = musesCount === 1 ? musesCalculator.getNonGroundRulesForMUSes()[0] : new Set<string>();
            assert.deepStrictEqual( musesCalculator.getMissingSupportRulesFromMUS(0), test_case.expected_missing_support );
            assert.deepStrictEqual( nonGroundRules, test_case.expected_buggy_rules );
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

    [
        'test/unsat/support_tests/error.lp'
    ]
    .forEach( function(test_case)
    {
        it('Throws an error in case of a not valid input program.', function()
        {
            let musesCalculator: MUSesCalculator = new MUSesCalculator();
            const run_musescalc = () => musesCalculator.calculateMUSes( [test_case], 1 );
            assert.throws(run_musescalc, Error);
            assert.deepStrictEqual( musesCalculator.getMissingSupportRulesFromMUS(0), new Map<string, Set<string>>() );
        });
    });
});