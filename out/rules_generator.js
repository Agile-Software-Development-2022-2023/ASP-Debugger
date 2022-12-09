"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesGenerator = void 0;
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
                //identify debug atoms
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
                let debug_atom = muses[mus_index][j];
                //remove _debug
                debug_atom = debug_atom.replace(matches[0], '');
                //remove last ) which closes the atom
                debug_atom = debug_atom.slice(0, -1);
                //get all variables in atom
                //which now is just a list of terms
                let terms = Array(); //debug_atom.split(regexTerms);
                //split terms considering strings
                let inside_string = false;
                let term_is_string = false;
                let current_term = '';
                //iterate over all characters of the debug atom (which is now in the form term_1, ..., term_n)
                //and find all constants, considering the special case of strings
                for (let i = 0; i < debug_atom.length; i++) {
                    //start of a string
                    if (debug_atom.at(i) == '"' && inside_string == false) {
                        inside_string = true;
                        term_is_string = true;
                        //term += debug_atom.at(i);
                    }
                    else if (debug_atom.at(i) == '"' && inside_string == true) {
                        //string continues with \"
                        if (i > 0 && debug_atom.at(i - 1) == '\\') {
                            inside_string = true;
                            current_term += debug_atom.at(i);
                        }
                        else { //string ends becuase " has been found
                            inside_string = false;
                            //term += debug_atom.at(i);
                        }
                    }
                    else {
                        //going to next term
                        if (inside_string == false && debug_atom.at(i) == ',') {
                            if (term_is_string) {
                                current_term = '\"' + current_term + '\"';
                            }
                            terms.push(current_term);
                            current_term = '';
                            term_is_string = false;
                        }
                        else {
                            //term continues
                            current_term += debug_atom.at(i);
                        }
                    }
                }
                //handling last term which will always be valid
                if (term_is_string) {
                    current_term = '\"' + current_term + '\"';
                }
                terms.push(current_term);
                //get non-ground rule which will become ground after substitutions
                let corresponding_ground_rule = corresponding_debug_atom.getNonGroundRule();
                //scroll all the rule and do the replace only where you are not in a string
                let double_quotes_indexes = new Array();
                for (let idx = 0; idx < corresponding_ground_rule.length; idx++) {
                    if (idx > 0 && corresponding_ground_rule.at(idx) == '"') {
                        if (corresponding_ground_rule.at(idx - 1) != '\\') {
                            double_quotes_indexes.push(idx);
                        }
                    }
                }
                for (let k = 0; k < terms.length; k++) {
                    if (k >= corresponding_debug_atom.getVariables().length) {
                        throw new Error("The number of variables in atom does not correspond with the number of variables in debug atom");
                    }
                    let variable_name = '([^a-zA-Z])(' + corresponding_debug_atom.getVariables()[k] + ')([^a-zA-Z])';
                    //let variable_name: string = corresponding_debug_atom.getVariables()[k];
                    let regex_variable_global = new RegExp(variable_name, 'g');
                    let to_replace = '$1' + terms[k] + '$3';
                    //no strings in rule
                    if (double_quotes_indexes.length == 0) {
                        corresponding_ground_rule = corresponding_ground_rule.replace(regex_variable_global, to_replace);
                    }
                    else { //pay attention in the substitution because whatever is inside a string should stay as it is
                        for (let idx = 0; idx < double_quotes_indexes.length; idx++) {
                            let ground_rule_before_string = corresponding_ground_rule.substring(0, double_quotes_indexes[idx]);
                            idx++;
                            if (idx < double_quotes_indexes.length) {
                                let ground_rule_after_string = corresponding_ground_rule.substring(double_quotes_indexes[idx] + 1, corresponding_ground_rule.length);
                                ground_rule_before_string = ground_rule_before_string.replace(regex_variable_global, to_replace);
                                ground_rule_after_string = ground_rule_after_string.replace(regex_variable_global, to_replace);
                                corresponding_ground_rule = ground_rule_before_string + corresponding_ground_rule.substring(double_quotes_indexes[idx - 1], double_quotes_indexes[idx] + 1) + ground_rule_after_string;
                            }
                        }
                    }
                    // substitute all occurrencies of variable with the associated constant
                    //check that the match is effectively a variable
                    //corresponding_ground_rule = corresponding_ground_rule.replace(regex_variable_global, terms[k]);
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
//Usage example
// let generator = new RulesGenerator();
// //computes ground instances and non ground rules belonging to muses
// let file_path : string = '/home/andrea/git/ASP-Debugger/test/unsat/problems/3col_unsat_strings.asp';
// let number_of_muses = 1;
// let mus_index_for_ground_rules = 0;
// let musFacade = new MUSesCalculator();
// musFacade.calculateMUSes([file_path], number_of_muses)
// let ground_rules : Map<string, string[]> = musFacade.getGroundRulesForMUS(mus_index_for_ground_rules);
// let non_ground_rules : Array<Set<string>> = musFacade.getNonGroundRulesForMUSes();
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