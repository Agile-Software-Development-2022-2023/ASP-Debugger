import assert from "assert";
import { describe, it } from "mocha";
import { readFileSync } from 'fs';
import { AspGrounder, AspGrounderError } from "../../../src/dbg-ground/grounder";
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
    let grounder: AspGrounder;
    before( function()
    {
        grounder = AspGrounder.getInstance();
    });

    GROUND_TEST_CASES.forEach( function(test_case: GrounderTestCase)
    {
        it('Properly instantiate a ground ASP program', function()
        {
            let actual_ground: string = grounder.ground(AspGrounder.loadProgram(test_case.input_program_files));
            assert.ok(check_ground_program(actual_ground, test_case.expected_ground_file));
        });
    });

    it('Properly instantiate a non-ground ASP program', function()
    {
        let input_files = [TEST_CASES_PATH + 'col_test.lp', TEST_CASES_PATH + 'col_test.in'];
        let actual_ground: string = grounder.ground(AspGrounder.loadProgram(input_files));
        assert.ok(check_ground_program(actual_ground, TEST_CASES_PATH + 'col_test.smodels'));
    });

    it('Throws an error in case of an invalid ASP program', function()
    {
        const run_grounder = () => grounder.ground(AspGrounder.loadProgram([TEST_CASES_PATH + 'invalid_test.lp']));
        assert.throws(run_grounder, AspGrounderError);
    });

    it('Throws an error in case of a not-existing ASP program', function()
    {
        const run_grounder_single = () => grounder.ground(AspGrounder.loadProgram(['not/existing/program.lp']));
        const run_grounder_multi  = () => grounder.ground(AspGrounder.loadProgram(['not/existing/prog_a.lp', 'not/existing/prog_b.lp']));
        assert.throws(run_grounder_single, AspGrounderError);
        assert.throws(run_grounder_multi,  AspGrounderError);
    });
});