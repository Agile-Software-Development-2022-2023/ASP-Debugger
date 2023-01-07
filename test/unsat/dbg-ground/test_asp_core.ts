import assert from "assert";
import { Predicate } from "../../../src/dbg-ground/asp_core";

describe('ASP core', function()
{
    [
        {input_atom: " p  ", expected_pred: new Predicate('p', 0), expected_pred_str: 'p/0'},
        {input_atom: " __p(X,  f(Y) ) ", expected_pred: new Predicate('__p', 2), expected_pred_str: '__p/2'},
        {input_atom: " __pq(f(X,g(1,2)),  f(Y), 1, 2) ", expected_pred: new Predicate('__pq', 3), expected_pred_str: '__pq/3'},
        {input_atom: "   ", expected_pred: null, expected_pred_str: null},
        {input_atom: "  p((( ", expected_pred: new Predicate('p'), expected_pred_str: 'p/0'},
        {input_atom: ".123", expected_pred: null, expected_pred_str: null},
        {input_atom: "\n a\n(X)\n  ", expected_pred: new Predicate('a', 1), expected_pred_str: 'a/1'},
        {input_atom: "\n\n_path\n(X\n,\nY\n)\n\n", expected_pred: new Predicate('_path', 2), expected_pred_str: '_path/2'},
        {input_atom: "input_list\n(X\n,\nY,Z,K,J)\n\n", expected_pred: new Predicate('input_list', 5), expected_pred_str: 'input_list/5'}
    ]
    .forEach( function(test_case)
    {
        it('Creates a corresponding Predicate object from an input non-ground atom', function()
        {
            let actual_pred: Predicate = Predicate.getFromAtom( test_case.input_atom );
            if ( test_case.expected_pred == null || test_case.expected_pred_str == null )
                assert.strictEqual( actual_pred, null );
            else
            {
                assert.strictEqual( actual_pred.getPredicateName(),  test_case.expected_pred.getPredicateName() );
                assert.strictEqual( actual_pred.getPredicateArity(), test_case.expected_pred.getPredicateArity() );
                assert.strictEqual( actual_pred.getPredString(),     test_case.expected_pred_str );
            }
        });
    });
});