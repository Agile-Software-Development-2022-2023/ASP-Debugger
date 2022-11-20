import {DebugGrounder, DebugAtom} from './dbg-ground/debug_grounder'
import WaspCaller from './unsat_wasp'

export class RulesGenerator{

    public constructor(){
    }
    //computes ground instances from non ground rules that are cause of incoherence
    public get_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules : Map<string, DebugAtom>) : Map<string, string[]>{
        let ground_instances_of_mus_rules = new Map<string, string[]>();
        // find all possible instantiations of rule that are
        // part of a mus
        for(let i = 0; i < muses.length; i++){
            for(let j = 0; j < muses[i].length;j++){
                // console.log(muses[i][j]);
                let regex_identifier = new RegExp(/_debug\d+\(/);
                let matches : Array<string> = regex_identifier.exec(muses[i][j]);
                
                if(matches === null){
                    continue;

                }
                // debug atom identifier
                let atom_identifier : string = matches[0].slice(0, -1);
                // console.log("Debug atom:" + atom_identifier);
                // get corresponding debug atom from debug atoms map
                let corresponding_debug_atom = debug_atom_rules.get(atom_identifier);
                //console.log("Corresponding rule: " + corresponding_debug_atom.getNonGroundRule())
                let regexTerms = new RegExp(/,/);
                let debug_atom: string = muses[i][j];
                //remove _debug
                debug_atom = debug_atom.replace(matches[0], '');
                //remove last ) which closes the atom
                debug_atom = debug_atom.slice(0, -1)
                //get all variables in atom
                //which now is just a list of terms
                let terms = debug_atom.split(regexTerms);
                //get non-ground rule which will become ground after substitutions
                let corresponding_ground_rule : string = corresponding_debug_atom.getNonGroundRule();
                for(let k = 0; k < terms.length; k++){
                    if( k >= corresponding_debug_atom.getVariables().length){
                        throw new Error("The number of variables in atom does not correspond with the number of variables in debug atom");
                    }
                    let variable_name: string = corresponding_debug_atom.getVariables()[k];

                    let regex_variable_global = new RegExp(variable_name, 'g');
                    // substitute all occurrencies of variable with the associated constant
                    corresponding_ground_rule = corresponding_ground_rule.replace(regex_variable_global, terms[k]);
                }

                // let regexSpaces = new RegExp(/\s/g);
                if(ground_instances_of_mus_rules.get(corresponding_debug_atom.getNonGroundRule()) == null){
                    ground_instances_of_mus_rules.set(corresponding_debug_atom.getNonGroundRule(), [corresponding_ground_rule]);               
                }
                else{
                    ground_instances_of_mus_rules.get(corresponding_debug_atom.getNonGroundRule()).push(corresponding_ground_rule);
                }
                // console.log(corresponding_ground_rule);
            }
        }
        return ground_instances_of_mus_rules;
    }



    public get_non_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules : Map<string, DebugAtom>) : Set<string>{
        // create wasp caller
        let non_ground_rules : Set<string> = new Set<string>();
        //get non ground rules from gringo-wrapper execution
        let regex_identifier = new RegExp(/_debug\d+/);
        for(let i = 0; i < muses.length; i++){
            for(let j = 0; j < muses[i].length; j++){
                let atom_identifier :string = regex_identifier.exec(muses[i][j])[0]; 
                if(debug_atom_rules.has(atom_identifier)){
                    non_ground_rules.add(debug_atom_rules.get(atom_identifier).getNonGroundRule());
                }
            }

        }
        return non_ground_rules;
    }

}

//Usage example
// let generator = new RulesGenerator();
// computes ground instances and non ground rules belonging to muses
// let my_debugger = DebugGrounder.createDefault(['']);
// let wasp_caller = new WaspCaller();

// let groundP : string = my_debugger.ground();
// let  my_program : Map<string, DebugAtom> = my_debugger.getDebugAtomsMap();
// let muses : Array<string[]> = wasp_caller.get_muses(groundP, Array.from(my_program.keys()), 1);
// //console.log(muses);
// let ground_rules : Map<string, string[]> = generator.get_ground_rules_from_debug(muses, my_program);

// let non_ground_rules : Set<string> = generator.get_non_ground_rules_from_debug(muses, my_program);

// let result : string = '';
// for(let [key, value] of ground_rules){
//     result += value.toString();
// }
// console.log(result);

// let result1 : string = ''
// for(let element of non_ground_rules){
//     result1 += element;
// }
// console.log(result1);