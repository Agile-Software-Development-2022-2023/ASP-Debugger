"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unsat_wasp_1 = require("../../src/unsat_wasp");
const fs_1 = require("fs");
const assert_1 = __importDefault(require("assert"));
// Create a test suite for wasp call
describe('WASP_CALL', function () {
    let rawdata = fs_1.readFileSync('./test/unsat/programs_unsat_wasp.json');
    let values = JSON.parse(rawdata.toString());
    let wasp_M = new unsat_wasp_1.WaspCaller();
    // Test One: Test of compute muses
    values["test_success"].forEach(function (item) {
        it('should test if the given program return the expected muses', function () {
            assert_1.default.equal(wasp_M.compute_muses(item["program"], item["predicates"]), item["output"]);
        });
    });
    //Test Two: Test of parse muses
    values["result_atoms"].forEach(function (item) {
        it('should test if the given muses are divided in the correct way in string', function () {
            assert_1.default.deepEqual(wasp_M.parse_result(item["output"]), item["expected"]);
        });
    });
    //Test Three: Test of get_muses
    values["test_success"].forEach(function (item) {
        it('should test if given a program, get_muses is able to obtain an array of expected muses', function () {
            assert_1.default.deepEqual(wasp_M.get_muses(item["program"], item["predicates"]), item["expected"]);
        });
    });
    //Test Four: Test of error thrown
    values["test_fail"].forEach(function (item) {
        it('should test if given a wrong program, get_muses throws an error', function () {
            assert_1.default.throws(() => { wasp_M.get_muses(item["program"], item["predicates"]); }, Error);
        });
    });
    //Test Five: Cannot launch wasp
    it('should throw an error when it cannot launch wasp', function () {
        let temp_wasp = new unsat_wasp_1.WaspCaller("not a path to wasp");
        assert_1.default.throws(() => { temp_wasp.get_muses(values[0]["program"], values[0]["predicates"]); }, Error);
    });
});
//# sourceMappingURL=test_unsat_wasp.js.map