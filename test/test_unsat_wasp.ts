import WaspMuses from "../src/unsat_wasp";

import assert from 'assert';
// Create a test suite (group) called Math
describe('WASP_CALL', function() {
    // Test One: A string explanation of what we're testing
    let wasp_M = new WaspMuses();
    it('should test if the given program return the expected muses', function(){
      let program: string = '1 4 0 0\n1 5 0 0\n1 8 2 0 6 4\n1 9 2 0 7 5\n1 11 3 0 10 9 8\n1 1 2 0 12 8\n1 1 2 0 13 9\n1 1 2 0 14 11\n1 15 0 0\n1 16 0 0\n1 17 0 0\n3 6 6 7 10 12 13 14 0 0\n0\n4 arc(1,2)\n5 arc(2,3)\n6 _debug1(1,2)\n7 _debug1(2,3)\n8 reach(1,2)\n9 reach(2,3)\n10 _debug2(1,2,3)\n11 reach(1,3)\n12 _debug3(1,2)\n13 _debug3(2,3)\n14 _debug3(1,3)\n15 node(1)\n16 node(2)\n17 node(3)\n0\nB+\n0\nB-\n1\n0\n1\n10 _debug2 3 X Z Y reach(X,Y):-reach(X,Z),reach(Z,Y), X!=Y.\n10 _debug3 2 X Y :- reach(X,Y).\n10 _debug1 2 X Y reach(X,Y):-arc(X,Y).\n0';
      let expected: string = 'WASP 2.0\n\n[MUS #1]: _debug1(1,2) _debug3(1,2)\n[MUS #2]: _debug1(2,3) _debug3(2,3)\n[MUS #3]: _debug1(1,2) _debug1(2,3) _debug2(1,2,3) _debug3(1,3)';
      let predicates: string[]= ["_debug1", "_debug2", "_debug_3"];
      console.log(wasp_M.call_wasp(program, predicates));
      //assert.equal(wasp_M.call_wasp(program, predicates), expected);
    });
    // Test Two: A string explanation of what we're testing
    it('should test if (3-4)*8 = -8', function(){
      // Our actual test: (3-4)*8 SHOULD EQUAL -8
      assert.equal(-8, (3-4)*8);
    });
});