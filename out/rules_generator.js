"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RulesGenerator {
    constructor() {
    }
    //computes ground instances from non ground rules that are cause of incoherence
    get_ground_rules_from_debug(muses, debug_atom_rules, mus_index = 0, debug_predicate_name = '_debug') {
        let ground_instances_of_mus_rules = new Map();
        // find all possible instantiations of rule that are
        // part of a mus
        if (mus_index < muses.length) {
            for (let j = 0; j < muses[mus_index].length; j++) {
                // console.log(muses[i][j]);
                let regex_text = debug_predicate_name + '\\d+\\(';
                let regex_identifier = new RegExp(regex_text);
                let matches = regex_identifier.exec(muses[mus_index][j]);
                if (matches === null) {
                    continue;
                }
                // debug atom identifier
                let atom_identifier = matches[0].slice(0, -1);
                // console.log("Debug atom:" + atom_identifier);
                // get corresponding debug atom from debug atoms map
                let corresponding_debug_atom = debug_atom_rules.get(atom_identifier);
                //console.log("Corresponding rule: " + corresponding_debug_atom.getNonGroundRule())
                let regexTerms = new RegExp(/,/);
                let debug_atom = muses[mus_index][j];
                //remove _debug
                debug_atom = debug_atom.replace(matches[0], '');
                //remove last ) which closes the atom
                debug_atom = debug_atom.slice(0, -1);
                //get all variables in atom
                //which now is just a list of terms
                let terms = debug_atom.split(regexTerms);
                //get non-ground rule which will become ground after substitutions
                let corresponding_ground_rule = corresponding_debug_atom.getNonGroundRule();
                for (let k = 0; k < terms.length; k++) {
                    if (k >= corresponding_debug_atom.getVariables().length) {
                        throw new Error("The number of variables in atom does not correspond with the number of variables in debug atom");
                    }
                    let variable_name = corresponding_debug_atom.getVariables()[k];
                    let regex_variable_global = new RegExp(variable_name, 'g');
                    // substitute all occurrencies of variable with the associated constant
                    //check that the match is effectively a variable
                    corresponding_ground_rule = corresponding_ground_rule.replace(regex_variable_global, terms[k]);
                }
                // let regexSpaces = new RegExp(/\s/g);
                if (ground_instances_of_mus_rules.get(corresponding_debug_atom.getNonGroundRule()) == null) {
                    ground_instances_of_mus_rules.set(corresponding_debug_atom.getNonGroundRule(), [corresponding_ground_rule]);
                }
                else {
                    ground_instances_of_mus_rules.get(corresponding_debug_atom.getNonGroundRule()).push(corresponding_ground_rule);
                }
                // console.log(corresponding_ground_rule);
            }
        }
        return ground_instances_of_mus_rules;
    }
    // public get_non_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules : Map<string, DebugAtom>) : Set<string>{
    //     // create wasp caller
    //     let non_ground_rules : Set<string> = new Set<string>();
    //     //get non ground rules from gringo-wrapper execution
    //     let regex_identifier = new RegExp(/_debug\d+/);
    //     for(let i = 0; i < muses.length; i++){
    //         for(let j = 0; j < muses[i].length; j++){
    //             let atom_identifier :string = regex_identifier.exec(muses[i][j])[0]; 
    //             if(debug_atom_rules.has(atom_identifier)){
    //                 non_ground_rules.add(debug_atom_rules.get(atom_identifier).getNonGroundRule());
    //             }
    //         }
    //     }
    //     return non_ground_rules;
    // }
    get_non_ground_rules_from_debug(muses, debug_atom_rules, mus_index_max = -1, debug_predicate_name = '_debug') {
        // create wasp caller
        let non_ground_rules = new Array(muses.length);
        //-1 stands for: consider all muses
        if (mus_index_max == -1) {
            mus_index_max = muses.length;
        }
        for (let i = 0; i < muses.length && i < mus_index_max; i++) {
            non_ground_rules[i] = new Set();
        }
        //get non ground rules from gringo-wrapper execution
        let regex_text = debug_predicate_name + '\\d+';
        let regex_identifier = new RegExp(regex_text);
        for (let i = 0; i < muses.length && mus_index_max; i++) {
            for (let j = 0; j < muses[i].length; j++) {
                let atom_identifier = regex_identifier.exec(muses[i][j])[0];
                if (debug_atom_rules.has(atom_identifier)) {
                    non_ground_rules[i].add(debug_atom_rules.get(atom_identifier).getNonGroundRule());
                }
            }
        }
        return non_ground_rules;
    }
}
exports.RulesGenerator = RulesGenerator;
// //Usage example
// let generator = new RulesGenerator();
// //computes ground instances and non ground rules belonging to muses
// let my_debugger = DebugGrounder.createDefault(['/home/andrea/git/ASP-Debugger/test/unsat/problems/3col_unsat.asp']);
// let wasp_caller = new WaspCaller();
// let groundP : string = my_debugger.ground();
// let  my_program : Map<string, DebugAtom> = my_debugger.getDebugAtomsMap();
// let muses : Array<string[]> = wasp_caller.get_muses(groundP, Array.from(my_program.keys()), 3);
// console.log(muses);
// //console.log(muses);
// let ground_rules : Map<string, string[]> = generator.get_ground_rules_from_debug(muses, my_program, 1);
// let non_ground_rules : Array<Set<string>> = generator.get_non_ground_rules_from_debug(muses, my_program);
// let result : string = '';
// for(let [key, value] of ground_rules){
//     result += value.toString();
// }
// console.log(result);
// let result1 : string = '';
// for(let i = 0; i< non_ground_rules.length; i++){
//     for(let element of non_ground_rules[i]){
//         result1 += element;
//     }
// }
// console.log(result1);
//# sourceMappingURL=rules_generator.js.map