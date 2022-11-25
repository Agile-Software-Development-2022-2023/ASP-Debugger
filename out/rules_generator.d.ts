import { DebugAtom } from './dbg-ground/debug_grounder';
export declare class RulesGenerator {
    constructor();
    get_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules: Map<string, DebugAtom>, mus_index?: number, debug_predicate_name?: string): Map<string, string[]>;
    get_non_ground_rules_from_debug(muses: Array<string[]>, debug_atom_rules: Map<string, DebugAtom>, mus_index_max?: number, debug_predicate_name?: string): Array<Set<string>>;
}
