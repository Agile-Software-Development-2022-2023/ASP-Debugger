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
            let number_of_muses : number = instance["number_of_muses"];
            let mus_index_for_ground_rules : number = instance["mus_index_for_ground_rules"]
            
            let musFacade = new MUSesCalculator();
            musFacade.calculateMUSes([file_path], number_of_muses)
            let ground_rules : Map<string, string[]> = musFacade.getGroundRulesForMUS(mus_index_for_ground_rules);
            let non_ground_rules : Array<Set<string>> = musFacade.getNonGroundRulesForMUSes();
            let result : string = '';
            for(let [key, value] of ground_rules){
                result += value.toString();
            }
            let result1 : string = ''
            for(let i = 0; i < non_ground_rules.length; i++){
                for(let rule of non_ground_rules[i])
                    result1 += rule;
            }
            assert.equal(instance["ground_rules"], result);
            assert.equal(instance["non_ground_rules"], result1);
        });
    });

});



