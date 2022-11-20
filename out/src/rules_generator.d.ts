import { DebugAtom } from './dbg-ground/debug_grounder';
export declare class RulesGenerator {
    constructor();
    get_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules: Map<string, DebugAtom>): Map<string, string[]>;
    get_non_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules: Map<string, DebugAtom>): Set<string>;
}
