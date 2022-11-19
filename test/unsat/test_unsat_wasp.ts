import WaspCaller from "../../src/unsat_wasp";
import  {readFileSync} from 'fs';
import assert from 'assert';
// Create a test suite for wasp call
describe('WASP_CALL', function() {
  
    let rawdata:Buffer = readFileSync('./test/unsat/programs_unsat_wasp.json');
    let values = JSON.parse(rawdata.toString());
    let wasp_M = new WaspCaller();
    
    // Test One: Test of compute muses
    values["test_success"].forEach(function(item: string[]) {
      it('should test if the given program return the expected muses', function(){
        assert.equal(wasp_M.compute_muses(item["program"], item["predicates"]), item["output"]);
      });
    });


    //Test Two: Test of parse muses
    values["result_atoms"].forEach(function(item: string[]) {
      it('should test if the given muses are divided in the correct way in string', function(){
      assert.deepEqual(wasp_M.parse_result(item["output"]),item["expected"]);
      });
    });

    //Test Three: Test of get_muses
    values["test_success"].forEach(function(item: string[]) {
      it('should test if given a program, get_muses is able to obtain an array of expected muses', function(){
          assert.deepEqual(wasp_M.get_muses(item["program"],item["predicates"]),item["expected"]);
        });
    });
    //Test Four: Test of error thrown
    values["test_fail"].forEach(function(item: string[]) {
      it('should test if given a wrong program, get_muses throws an error', function(){
          assert.throws(() => {wasp_M.get_muses(item["program"],item["predicates"])}, Error);
        });
    });

    //Test Five: Cannot launch wasp
    it('should throw an error when it cannot launch wasp', function(){
      let temp_wasp:WaspCaller = new WaspCaller("not a path to wasp");
      assert.throws(() => {temp_wasp.get_muses(values[0]["program"],values[0]["predicates"])}, Error);
    });
    
});