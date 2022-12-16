import { describe, it } from "mocha";
import { readFileSync } from "fs";
import { MUSesCalculator } from "../../src/muses_facade"
import { DebugGrounder } from "../../src/dbg-ground/dbg_grounder";
import { DebugAtom } from "../../src/dbg-ground/asp_core";
import assert from "assert";


describe('rules_generator_output', function(){
    let input = readFileSync('./test/unsat/programs_unsat_rules.json');
    let problems = JSON.parse(input.toString());

    problems["test"].forEach(function(instance : string[]) {
        it('should test if both ground and non ground rules returned are correct', function(){
            let file_path : string = instance["problem_path"];
            let musFacade = new MUSesCalculator();
            let total_muses :number = musFacade.calculateMUSes([file_path], 0).length;
            let ground_rules : Map<string, string[]> = new Map<string, string[]>();
            let result : string = '';
            let non_ground_rules : Array<Set<string>> = musFacade.getNonGroundRulesForMUSes();

            let result1 : string = ''
            let non_ground_rules_json : string = instance["non_ground_rules"];
            //for all non ground rules returned by the mus calculator, check that they were
            //expected to be found
            for(let i = 0; i < non_ground_rules.length; i++){
                for(let rule of non_ground_rules[i]){
                    assert.equal(non_ground_rules_json.includes(rule), true); //result1 += rule;
                }
            }
            //check that all the expected ground rules are found in some mus
            let ground_rules_expected :string = instance["ground_rules"];
            for(let ground_rules_instances_for_non_ground of ground_rules.values()){
                for(let i = 0; i< ground_rules_instances_for_non_ground.length; i++){
                    assert.equal(ground_rules_expected.includes(ground_rules_instances_for_non_ground[i]), true);
                }
            }
        });
    });

});



