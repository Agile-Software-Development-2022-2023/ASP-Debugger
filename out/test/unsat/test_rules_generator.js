"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const fs_1 = require("fs");
const rules_generator_1 = require("../../src/rules_generator");
const unsat_wasp_1 = require("../../src/unsat_wasp");
const debug_grounder_1 = require("../../src/dbg-ground/debug_grounder");
const assert_1 = __importDefault(require("assert"));
mocha_1.describe('rules_generator_output', function () {
    let input = fs_1.readFileSync('./test/unsat/programs_unsat_rules.json');
    let problems = JSON.parse(input.toString());
    let wasp_caller = new unsat_wasp_1.WaspCaller();
    let my_debugger;
    let rules_generator = new rules_generator_1.RulesGenerator();
    console.log(problems);
    problems["test"].forEach(function (instance) {
        mocha_1.it('should test if both ground and non ground rules returned are correct', function () {
            let file_path = instance["problem_path"];
            my_debugger = debug_grounder_1.DebugGrounder.createDefault(file_path);
            let groundP = my_debugger.ground();
            let my_program = my_debugger.getDebugAtomsMap();
            let muses = wasp_caller.get_muses(groundP, Array.from(my_program.keys()), 1);
            let ground_rules = rules_generator.get_ground_rules_from_debug(muses, my_program);
            let non_ground_rules = rules_generator.get_non_ground_rules_from_debug(muses, my_program);
            let result = '';
            for (let [key, value] of ground_rules) {
                result += value.toString();
            }
            let result1 = '';
            for (let element of non_ground_rules) {
                result1 += element;
            }
            assert_1.default.equal(instance["ground_rules"], result);
            assert_1.default.equal(instance["non_ground_rules"], result1);
        });
    });
});
//# sourceMappingURL=test_rules_generator.js.map