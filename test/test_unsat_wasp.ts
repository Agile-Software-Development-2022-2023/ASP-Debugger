import WaspCaller from "../src/unsat_wasp";

import assert from 'assert';
// Create a test suite (group) called Math
describe('WASP_CALL', function() {
    // Test One: Test of compute muses
    let wasp_M = new WaspCaller();
    it('should test if the given program return the expected muses', function(){
      let program: string = '1 4 0 0\n1 5 0 0\n1 8 2 0 6 4\n1 9 2 0 7 5\n1 11 3 0 10 9 8\n1 1 2 0 12 8\n1 1 2 0 13 9\n1 1 2 0 14 11\n1 15 0 0\n1 16 0 0\n1 17 0 0\n3 6 6 7 10 12 13 14 0 0\n0\n4 arc(1,2)\n5 arc(2,3)\n6 _debug1(1,2)\n7 _debug1(2,3)\n8 reach(1,2)\n9 reach(2,3)\n10 _debug2(1,2,3)\n11 reach(1,3)\n12 _debug3(1,2)\n13 _debug3(2,3)\n14 _debug3(1,3)\n15 node(1)\n16 node(2)\n17 node(3)\n0\nB+\n0\nB-\n1\n0\n1\n10 _debug2 3 X Z Y reach(X,Y):-reach(X,Z),reach(Z,Y), X!=Y.\n10 _debug3 2 X Y :- reach(X,Y).\n10 _debug1 2 X Y reach(X,Y):-arc(X,Y).\n0';
      let expected: string = 'WASP 2.0\n\n[MUS #1]: _debug1(1,2) _debug3(1,2)\n[MUS #2]: _debug1(2,3) _debug3(2,3)\n[MUS #3]: _debug1(1,2) _debug1(2,3) _debug2(1,2,3) _debug3(1,3)\n';
      let predicates: string[]= ["_debug1", "_debug2", "_debug3"];
      assert.equal(wasp_M.compute_muses(program, predicates), expected);
    });
 /*   [
      ["_debug1(1,2)","_debug1(1,3)" "_debug3(1,2)"],
      ["_debug1(2,3)", "_debug3(2,3)"]

    ]
*/
    //Test Two: Test of parse muses
    it('should test if the given muses are divided in the correct way in string', function(){
      let result: string = 'WASP 2.0\n\n[MUS #1]: _debug1("test \'spaces\' in string works",2) _debug3(1,2)\n[MUS #2]: _debug1(2,3) _debug3(2,3)\n[MUS #3]: _debug1(1,2) _debug1(2,3) _debug2(1,2,3) _debug3(1,3)\n';
      let expected: string[][] = [['_debug1("test \'spaces\' in string works",2)', '_debug3(1,2)'],['_debug1(2,3)', '_debug3(2,3)'],['_debug1(1,2)', '_debug1(2,3)', '_debug2(1,2,3)', '_debug3(1,3)']];
      assert.deepEqual(wasp_M.parse_result(result),expected);
      //assert.equal(wasp_M.compute_muses(program, predicates), expected);
    });

    //Test Three: Test of get_muses
    it('should test if given a program, get_muses is able to obtain an array of expected muses', function(){
      let program: string = '1 4 0 0\n1 5 0 0\n1 6 0 0\n1 7 0 0\n8 2 10 11 4 0 8 4 5 6\n8 2 12 13 4 0 9 4 5 7\n1 1 3 0 14 11 13\n1 1 3 0 15 13 11\n1 1 3 0 16 11 13\n1 1 3 0 17 13 11\n1 1 3 1 11 18 6\n1 1 3 1 13 19 7\n3 8 8 9 14 15 16 17 18 19 0 0\n0\n4 column(1)\n5 row(1)\n6 queen(1)\n7 queen(2)\n8 _debug1(1,1,1)\n9 _debug1(2,1,1)\n10 notQ(1,1,1)\n11 q(1,1,1)\n12 notQ(2,1,1)\n13 q(2,1,1)\n14 _debug4(2,1,1,1,1)\n15 _debug4(1,1,1,2,1)\n16 _debug3(2,1,1,1,1)\n17 _debug3(1,1,1,2,1)\n18 _debug2(1)\n19 _debug2(2)\n0\nB+\n0\nB-\n1\n0\n1\n10 _debug4 5 X R C X1 C1 :-q(X,R,C), q(X1,R,C1),X!=X1.\n10 _debug2 1 X :-#count{R,C: q(X,R,C)} != 1, queen(X).\n10 _debug3 5 X R C X1 R1 :-q(X,R,C), q(X1,R1,C),X!=X1.\n10 _debug1 3 X R C q(X,R,C)|notQ(X,R,C):-queen(X), row(R),column(C).\n0\n';
      let expected: string[][] = [['_debug4(2,1,1,1,1)','_debug2(1)','_debug2(2)'],['_debug4(1,1,1,2,1)', '_debug2(1)', '_debug2(2)'],['_debug3(2,1,1,1,1)', '_debug2(1)','_debug2(2)'],['_debug3(1,1,1,2,1)','_debug2(1)','_debug2(2)']];
      let predicates: string[]= ["_debug1", "_debug2", "_debug3","_debug4"];
      assert.deepEqual(wasp_M.get_muses(program,predicates),expected);
      //assert.equal(wasp_M.compute_muses(program, predicates), expected);
    });

    ""
    
});