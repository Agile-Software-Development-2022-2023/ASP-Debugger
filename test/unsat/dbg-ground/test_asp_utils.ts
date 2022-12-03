import assert from "assert";
import { freezeStrings, make_unique, restoreStrings } from "../../../src/dbg-ground/asp_utils";

describe('ASP utility functions', function()
{
    [
        {asp_program: "q.\np(X) :- q(X), r(X,Y).", pred_name: 'q', expected: '_q'},
        {asp_program: ":- __q(X). [1@2]\np(X) :- q(X), r(X,\"___qq\").", pred_name: 'q', expected: '____q'},
        {asp_program: ":- __q(X). [1@2]\np(X) :- q(X), r(X,\"___qq\").", pred_name: 'f', expected: 'f'},
        {asp_program: '', pred_name: 'f', expected: 'f'}
    ]
    .forEach( function(test_case)
    {
        it('Makes a predicate name unique w.r.t. a program', function()
        {
            assert.strictEqual( make_unique(test_case.pred_name, test_case.asp_program), test_case.expected );
        });
    });


    [
        {
        asp_program:
        "pred_1(\"p(1,2). q(X) :- p(X,_).\").\n" +
        "pred_2(\"p(1,2). 'q(1).'  ''q(2).'' :- p(X,_).\")." +
        "pred_3(\"%p(1,2). q(X) :- p(X,_).\").\n" +
        "pred(b,\"%%p.q\").\n" +
        "_pRed1(b, \"\").\n" +
        "p._pRed1(\"\",c,f(\"p   q.   \",2)).\n" +
        "a(X) :- pred(X, \"p(1,2).\n p(1,2)\").",
        expected_program:
        "pred_1(#str-1#).\n" +
        "pred_2(#str-2#)." +
        "pred_3(#str-3#).\n" +
        "pred(b,#str-4#).\n" +
        "_pRed1(b, #str-5#).\n" +
        "p._pRed1(#str-6#,c,f(#str-7#,2)).\n" +
        "a(X) :- pred(X, #str-8#).",
        expected_string_map:
        new Map<string, string>( [
            ['#str-1#', "\"p(1,2). q(X) :- p(X,_).\""],
            ['#str-2#', "\"p(1,2). 'q(1).'  ''q(2).'' :- p(X,_).\""],
            ['#str-3#', "\"%p(1,2). q(X) :- p(X,_).\""],
            ['#str-4#', "\"%%p.q\""],
            ['#str-5#', "\"\""],
            ['#str-6#', "\"\""],
            ['#str-7#', "\"p   q.   \""],
            ['#str-8#', "\"p(1,2).\n p(1,2)\""]
        ] )
        },

        {
        asp_program:
        "pred(1..10). pred2 ( 1 ..   5).pred3(  5     ..4).\n" +
		"pred4(0..2).\n" +
		" pred5 ( 1 ..   9, 10, a).\n" +
		"a(X) :- pred(X).",
        expected_program:
        "pred(1..10). pred2 ( 1 ..   5).pred3(  5     ..4).\n" +
		"pred4(0..2).\n" +
		" pred5 ( 1 ..   9, 10, a).\n" +
		"a(X) :- pred(X).",
        expected_string_map: new Map<string, string>()
        },

        {
        asp_program: '',
        expected_program: '',
        expected_string_map: new Map<string, string>()
        }
    ]
    .forEach( function(test_case)
    {
        it('Freezes and restores strings in a program', function()
        {
            let string_map: Map<string, string> = new Map<string, string>();
            assert.strictEqual( freezeStrings(test_case.asp_program, string_map), test_case.expected_program );
            assert.deepStrictEqual( string_map, test_case.expected_string_map );
            assert.strictEqual( restoreStrings(test_case.expected_program, string_map), test_case.asp_program );
        });
    });
});