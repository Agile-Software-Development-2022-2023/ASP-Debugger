import assert from "assert";
import { brotliDecompressSync } from "zlib";
import { NonGroundDebugProgramBuilder } from "../../../src/dbg-ground/pre_ground"

describe('Check Preprocessing phase works properly before grounding the program', function()
{
    let preproc: NonGroundDebugProgramBuilder = new NonGroundDebugProgramBuilder("") ;
    it('checks that the method getVariables retrieve actually retrieve all the variables in a function', function()
    {
        let bodies: Array<string> = ["pred(A,B,C,D), #count{X: pred1(X)}", "test(Z,A), test(Z,B), test(Z,C)", "test, proof, proof"];
        let expected: Array<Array<string>> = [["A", "B", "C", "D"], ["Z","A", "B", "C"], []];
        for(let i = 0; i< bodies.length; i++){
            assert.deepEqual(preproc.getVariables(bodies[i]), expected[i]);
        }
    });
    
});