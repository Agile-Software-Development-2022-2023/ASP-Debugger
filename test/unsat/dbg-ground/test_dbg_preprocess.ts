import assert from "assert";
import { brotliDecompressSync } from "zlib";
import { NonGroundDebugProgramBuilder } from "../../../src/dbg-ground/pre_ground"

describe.only('Check Preprocessing phase works properly before grounding the program', function()
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

    it('checks that the comments of a program are successfully removed', function(){
        let prog :string = "h1(X,Y,Z):-b1(X,Y,Z).\n"+":-{pred(X,Y)},t(X).\n"+"%this co!#mm()ent@ is removed from the program\n"+":-3{pred(X,Y,Z)},t(X).\n"+"%also this comments should be removed\n"+":-1<{pred(X,Y):t(Y)},t(costant).\n"+"%comment that should be removed\n";
        preproc.setLogicProgram(prog);
        let expected:string = "h1(X,Y,Z):-b1(X,Y,Z).\n:-{pred(X,Y)},t(X).\n:-3{pred(X,Y,Z)},t(X).\n:-1<{pred(X,Y):t(Y)},t(costant).\n"; 

        preproc.removeComments();
        console.log(preproc.getLogicProgram());
        assert.deepEqual(preproc.getLogicProgram(), expected);
    });
    
});