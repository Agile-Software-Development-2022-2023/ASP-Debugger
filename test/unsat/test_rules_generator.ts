import { describe, it } from "mocha";
import {expect } from "chai";
import { readFileSync } from "fs";
import { RulesGenerator } from "../../src/rules_generator";
import { WaspCaller } from "../../src/unsat_wasp";
import { DebugGrounder, DebugAtom } from "../../src/dbg-ground/debug_grounder";
import assert from "assert";


describe('rules_generator_output', function(){
    let input = readFileSync('./test/unsat/programs_unsat_rules.json');
    let problems = JSON.parse(input.toString());
    let wasp_caller : WaspCaller = new WaspCaller();
    let my_debugger : DebugGrounder;
    let rules_generator : RulesGenerator = new RulesGenerator();
    console.log(problems);

    problems["test"].forEach(function(instance : string[]) {
        it('should test if both ground and non ground rules returned are correct', function(){
            let file_path : string = instance["problem_path"];
            my_debugger = DebugGrounder.createDefault(file_path);
            let groundP : string = my_debugger.ground();
            let  my_program : Map<string, DebugAtom> = my_debugger.getDebugAtomsMap();
            let muses : Array<string[]> = wasp_caller.get_muses(groundP, Array.from(my_program.keys()), 1);
            let ground_rules : Map<string, string[]> = rules_generator.get_ground_rules_from_debug(muses, my_program);
            let non_ground_rules : Set<string> = rules_generator.get_non_ground_rules_from_debug(muses, my_program);
            let result : string = '';
            for(let [key, value] of ground_rules){
                result += value.toString();
            }
            let result1 : string = ''
            for(let element of non_ground_rules){
                result1 += element;
            }

            assert.equal(instance["ground_rules"], result);
            assert.equal(instance["non_ground_rules"], result1);
        });
    });

});



