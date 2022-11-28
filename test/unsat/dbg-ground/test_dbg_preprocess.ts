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
        let prog :string = "h1(X,Y,Z):-b1(X,Y,Z).\n"+"      %comment%comment&imcommenting\n"+"  %          \n"+":-{pred(X,Y)},t(X).\n"+"%this co!#mm()ent@ is removed from the program\n"+":-3{pred(X,Y,Z)},t(X).\n"+"%also this comments should be removed\n"+":-1<{pred(X,Y):t(Y)},t(costant).\n"+"         %comment that should be removed    \n";
        preproc.setLogicProgram(prog);
        let expected:string = "h1(X,Y,Z):-b1(X,Y,Z).\n:-{pred(X,Y)},t(X).\n:-3{pred(X,Y,Z)},t(X).\n:-1<{pred(X,Y):t(Y)},t(costant).\n"; 

        preproc.removeComments();
        assert.deepEqual(preproc.getLogicProgram(), expected);
    });

    it('checks that an ASP program already processed and without comments is adorned correctly', function(){
        let program:string = "{a;b;c}.\n"
        + "     { _d1234_56890__12Asd    ;   e   ;     f   }  .  { pred(_a);  pred1 (  b , d )  ; pred (    c )   } .\n"
        + "  1 { g; h   ; i } 3.\n"
        + "  1 { pred3  (  a,  b ,    c  )   ; h   ; i } 3.\n"
        + "1{h;i;pred(d)}2.\n"
        + "  12 { j; kssd12; l; m; pred3 (d, e, f) }  .\n"
        + "{n;pred1(c,d);o;p}3.";

        preproc.clearMap();
        preproc.setLogicProgram(program);

        let adorned:string = "{a;b;c} :- _debug1.\n"
        + "     { _d1234_56890__12Asd    ;   e   ;     f   }   :- _debug2.  { pred(_a);  pred1 (  b , d )  ; pred (    c )   }  :- _debug3.\n"
        + "  1 { g; h   ; i } 3 :- _debug4.\n"
        + "  1 { pred3  (  a,  b ,    c  )   ; h   ; i } 3 :- _debug5.\n"
        + "1{h;i;pred(d)}2 :- _debug6.\n"
        + "  12 { j; kssd12; l; m; pred3 (d, e, f) }   :- _debug7.\n"
        + "{n;pred1(c,d);o;p}3 :- _debug8.\n"
        + "_debug1.\n"
        + "_debug2.\n"
        + "_debug3.\n"
        + "_debug4.\n"
        + "_debug5.\n"
        + "_debug6.\n"
        + "_debug7.\n"
        + "_debug8.\n";
        let computed = preproc.getAdornedProgram();
        console.log(computed);
        assert.deepEqual(computed, adorned);
    })
    
});