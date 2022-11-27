import assert from "assert";
import { describe, it } from "mocha";
import { readFileSync } from 'fs';
import { AspGrounder, AspGrounderError, AspGrounderFactory, AspGrounderGringo, TheoreticalAspGrounder } from "../../../src/dbg-ground/grounder";
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";

const WASP_COMMAND = 'bin/wasp';
const TEST_CASES_PATH: string = 'test/unsat/dbg-ground/grounder_tests/';

interface GrounderTestCase
{
    input_program_files : string[];
    expected_ground_file: string;
}

let GROUND_TEST_CASES: GrounderTestCase[] =
    [
        { input_program_files: [TEST_CASES_PATH + 'ground_test.lp'], expected_ground_file: TEST_CASES_PATH + 'ground_test.smodels' },
        { input_program_files: [TEST_CASES_PATH + 'empty_test.lp'],  expected_ground_file: TEST_CASES_PATH + 'empty_test.smodels' }
    ];

function compute_answer_sets(ground_program: string): string
{
    let wasp_proc: SpawnSyncReturns<string>;
    try
    {
        wasp_proc = spawnSync( WASP_COMMAND, ['-n', '0'],
            {encoding: 'utf-8', cwd: path.resolve(__dirname, "../../../"), input: ground_program} );
    }
    catch(err) { throw new Error(err); }
    
    if ( !wasp_proc.stdout )
        throw new Error('Invalid wasp exec.');
    
    return wasp_proc.stdout;
}

function check_ground_program(actual_ground: string, expected_ground_file: string): boolean
{
    let expected_ground: string = readFileSync(expected_ground_file, 'utf-8');

    try
    {
        let actual_as: string   = compute_answer_sets(actual_ground);
        let expected_as: string = compute_answer_sets(expected_ground);
        
        return actual_as.split("\n").sort().join() === expected_as.split("\n").sort().join();
    }
    catch (err) { return false; }
}

describe('Basic ASP grounder usage', function()
{
    let GROUNDERS_UNDER_TEST: AspGrounder[] = [];

    before( function()
    {
        GROUNDERS_UNDER_TEST =
        [
            new AspGrounderGringo()/*,
            AspGrounderFactory.getInstance().getTheoretical()*/
        ]
    });

    GROUND_TEST_CASES.forEach( function(test_case: GrounderTestCase)
    {
        it('Properly instantiate a ground ASP program', function()
        {
            GROUNDERS_UNDER_TEST.forEach( function(grounder: AspGrounder) {
            let actual_ground: string = grounder.ground(AspGrounder.loadProgram(test_case.input_program_files));
            assert.ok(check_ground_program(actual_ground, test_case.expected_ground_file));
            });
        });
    });

    it('Properly instantiate a non-ground ASP program', function()
    {
        GROUNDERS_UNDER_TEST.forEach( function(grounder: AspGrounder) {
        let input_files = [TEST_CASES_PATH + 'col_test.lp', TEST_CASES_PATH + 'col_test.in'];
        let actual_ground: string = grounder.ground(AspGrounder.loadProgram(input_files));
        assert.ok(check_ground_program(actual_ground, TEST_CASES_PATH + 'col_test.smodels'));
        });
    });

    it('Throws an error in case of an invalid ASP program', function()
    {
        GROUNDERS_UNDER_TEST.forEach( function(grounder: AspGrounder) {
        const run_grounder = () => grounder.ground(AspGrounder.loadProgram([TEST_CASES_PATH + 'invalid_test.lp']));
        assert.throws(run_grounder, AspGrounderError);
        });
    });

    it('Throws an error in case of a not-existing ASP program', function()
    {
        GROUNDERS_UNDER_TEST.forEach( function(grounder: AspGrounder) {
        const run_grounder_single = () => grounder.ground(AspGrounder.loadProgram(['not/existing/program.lp']));
        const run_grounder_multi  = () => grounder.ground(AspGrounder.loadProgram(['not/existing/prog_a.lp', 'not/existing/prog_b.lp']));
        assert.throws(run_grounder_single, AspGrounderError);
        assert.throws(run_grounder_multi,  AspGrounderError);
        });
    });

});


class AspGrounderSpyStop extends Error{}
class AspGrounderSpy extends AspGrounderGringo
{
    private receivedInputProgram: string;
    private callReveiced: boolean = false;

    public ground(inputProgram: string): string
    {
        this.receivedInputProgram = inputProgram;
        this.callReveiced = true;
        throw new AspGrounderSpyStop();  // stop the grounding process.
    }

    public getReceivedInputProgram(): string { return this.receivedInputProgram; }
    public isCallReceived(): boolean { return this.callReveiced; }
}
class TheoreticalAspGrounderStub extends TheoreticalAspGrounder
{
    public removeCommentsActive: boolean = true;
    public rewriteFactsActive: boolean = true;

    protected removeComments(input_program: string): string
    {
        if ( this.removeCommentsActive ) return super.removeComments(input_program);
        return input_program;
    }
    protected rewriteFacts(input_program: string): string
    {
        if ( this.rewriteFactsActive ) return super.rewriteFacts(input_program);
        return input_program;
    }
}

describe('Theoretical ASP grounder rewritings [pre-grounding]', function()
{
    let theo_grounder: TheoreticalAspGrounderStub;
    let grounder_spy: AspGrounderSpy;
    
    before( function()
    {
        grounder_spy = new AspGrounderSpy();
        theo_grounder = new TheoreticalAspGrounderStub( grounder_spy );
    });


    //
    // test ignore comments
    //
    [
        { input_program: 'a. % p :- q.\n p :- q. % comment', expected: 'a. \n p :- q. '},
        { input_program: 'a.\n p :- q.', expected: 'a.\n p :- q.'},
        { input_program: '% this is a comment', expected: ''},
        { input_program: '\n\n % this is a comment\n a(X) :- b(X,Y). %%%%%\n b(1,2).', expected: '\n\n \n a(X) :- b(X,Y). \n b(1,2).'},
        { input_program: '%%     \n%%', expected: '\n'}
    ]
    .forEach( function(test_case)
    {
        it('Ignores comments in the input program', function()
        {
            theo_grounder.removeCommentsActive = true;
            theo_grounder.rewriteFactsActive = false;

            const run_grounder = () => theo_grounder.ground(test_case.input_program);
            assert.throws(run_grounder, AspGrounderSpyStop);
            
            assert.ok( grounder_spy.isCallReceived() );
            assert.ok( grounder_spy.getReceivedInputProgram() === test_case.expected );
        });
    });


    //
    // test facts rewriting
    //
    [
        {
        input_program:
        "a.\n" +
        "_b.\n" +
        "aBJi91ed.\n" +
        "d :- a.",
        expected:
        "a :- _df.\n" +
		"_b :- _df.\n" +
		"aBJi91ed :- _df.\n" +
		"d :- a.\n" +
		"_df | -_df."
        },

        {
        input_program:
        "  a.\n" +
        "_b      .\n" +
        "     aBJi91ed    .\n" +
        "d :- a.",
        expected:
        "  a :- _df.\n" +
        "_b       :- _df.\n" + 
		"     aBJi91ed     :- _df.\n" +
		"d :- a.\n" +
		"_df | -_df."
        },

        {
        input_program:
        "a.     b.   c.   \n" +
	    "   d. e.f.g.\n" +
		"x :- a",
        expected:
        "a :- _df.     b :- _df.   c :- _df.   \n" +
        "   d :- _df. e :- _df.f :- _df.g :- _df.\n" +
        "x :- a\n" +
        "_df | -_df."
        },

        {
        input_program:
        "pred(a).\n" +
		"pred(b,c).\n" +
		"_pRed1(b).\n" +
		"_pRed1(b,c,d).\n" +
		"a(X) :- pred(X).",
        expected:
        "pred(a) :- _df.\n" +
		"pred(b,c) :- _df.\n" +
		"_pRed1(b) :- _df.\n" +
		"_pRed1(b,c,d) :- _df.\n" +
		"a(X) :- pred(X).\n" +
		"_df | -_df."
        },

        {
        input_program:
        "  pred (a ).\n" +
		"pred(  b,c    )   .\n" +
		"   _pRed1   (b)  .\n" +
		" _pRed1(b ,  c,  d).\n" +
		"a(X) :- pred(X).",
        expected:
        "  pred (a ) :- _df.\n" +
		"pred(  b,c    )    :- _df.\n" +
		"   _pRed1   (b)   :- _df.\n" +
		" _pRed1(b ,  c,  d) :- _df.\n" +
		"a(X) :- pred(X).\n" +
		"_df | -_df."
        },

        {
        input_program:
        "  pred(a). pred(b).    pred(c).\n" +
		" pred(d).     pred1(e).pred2(f,g).\n" +
		"    pred2  (a,   b ).pred2(  b, d).   pred3(a,b,   c  ).\n" +
		"a(X) :- pred(X).",
        expected:
        "  pred(a) :- _df. pred(b) :- _df.    pred(c) :- _df.\n" +
		" pred(d) :- _df.     pred1(e) :- _df.pred2(f,g) :- _df.\n" +
		"    pred2  (a,   b ) :- _df.pred2(  b, d) :- _df.   pred3(a,b,   c  ) :- _df.\n" +
		"a(X) :- pred(X).\n" +
		"_df | -_df."
        },

        {
        input_program:
        "pred(1..10). pred2 ( 1 ..   5).pred3(  5     ..4).\n" +
		"pred4(0..2).\n" +
		" pred5 ( 1 ..   9, 10, a).\n" +
		"a(X) :- pred(X).",
        expected:
        "pred(1..10) :- _df. pred2 ( 1 ..   5) :- _df.pred3(  5     ..4) :- _df.\n" +
		"pred4(0..2) :- _df.\n" +
		" pred5 ( 1 ..   9, 10, a) :- _df.\n" +
		"a(X) :- pred(X).\n" +
		"_df | -_df."
        }
    ]
    .forEach( function(test_case)
    {
        it('Rewrites facts to make them disjunctive', function()
        {
            theo_grounder.removeCommentsActive = false;
            theo_grounder.rewriteFactsActive = true;

            const run_grounder = () => theo_grounder.ground(test_case.input_program);
            assert.throws(run_grounder, AspGrounderSpyStop);
            
            assert.ok( grounder_spy.isCallReceived() );
            assert.ok( grounder_spy.getReceivedInputProgram() === test_case.expected );
        });
    });

});

describe('Theoretical ASP grounder rewritings [post-grounding]', function()
{
    let theo_grounder: TheoreticalAspGrounder;
    
    before( function()
    {
        theo_grounder = new TheoreticalAspGrounder( new AspGrounderSpy() );
    });

});