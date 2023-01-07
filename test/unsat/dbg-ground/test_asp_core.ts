import assert from "assert";
import { Predicate } from "../../../src/dbg-ground/asp_core";

describe('ASP core', function()
{
    [
        {input_atom: " p  ", expected_pred: new Predicate('p', 0)},
        {input_atom: " __p(X,  f(Y) ) ", expected_pred: new Predicate('__p', 2)},
        {input_atom: " __pq(f(X,g(1,2)),  f(Y), 1, 2) ", expected_pred: new Predicate('__pq', 3)},
        {input_atom: "   ", expected_pred: null},
        {input_atom: "  p((( ", expected_pred: new Predicate('p')},
        {input_atom: ".123", expected_pred: null}
    ]
    .forEach( function(test_case)
    {
        it('Creates a corresponding Predicate object from an input non-ground atom', function()
        {
            let actual_pred: Predicate = Predicate.getFromAtom( test_case.input_atom );
            if ( test_case.expected_pred == null )
                assert.strictEqual( actual_pred, null );
            else
            {
                assert.strictEqual( actual_pred.getPredicateName(),  test_case.expected_pred.getPredicateName() );
                assert.strictEqual( actual_pred.getPredicateArity(), test_case.expected_pred.getPredicateArity() );
            }
        });
    });
});