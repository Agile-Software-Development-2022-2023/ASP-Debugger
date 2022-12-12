import { describe, it } from "mocha";
import { MUSesCalculator } from "../../src/muses_facade"
import assert from "assert";

const BACKING_TEST_CASES = 
[
    'test/unsat/backing_tests/knight_tour.lp',
    'test/unsat/backing_tests/labyrinth.lp'
]

describe('Backing', function()
{

    BACKING_TEST_CASES.forEach( function(test_case : string) {
    it('Supports the ' + test_case + ' encoding.', function()
    {        
        let musFacade = new MUSesCalculator();
        const run_debugger = () => musFacade.calculateMUSes([test_case], 1);
        assert.doesNotThrow(run_debugger, Error);
    });
    });

});