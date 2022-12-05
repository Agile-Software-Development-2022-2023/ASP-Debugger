"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asp_core_1 = require("./asp_core");
const asp_utils_1 = require("./asp_utils");
const Useful_regex_1 = require("./Useful_regex");
class AdornedDebugProgramBuilder {
    constructor(input_program) {
        this.logic_program = input_program;
        this.debugAtomsMap = new Map();
        this.adornedProgram = "";
        this.stringPlaceholder = new Map();
        this.debug_predicate = "_debug";
    }
    getDebugPredicate() { return this.debug_predicate; }
    setDebugPredicate(pred) { this.debug_predicate = pred; }
    getLogicProgram() { return this.logic_program; }
    setLogicProgram(input_program) { this.logic_program = input_program; this.debug_predicate = "_debug"; }
    replaceAll(program, regex, sub) {
        let origin = program;
        let replaced = program.replace(regex, sub);
        while (origin !== replaced) {
            origin = replaced;
            replaced = replaced.replace(regex, sub);
        }
        return replaced;
    }
    removeComments() { this.logic_program = this.replaceAll(this.logic_program, Useful_regex_1.ASP_REGEX.COMMENT_PATTERN, ""); }
    //it should ignore the strings
    getVariables(ruleBody) {
        // remove any aggregates from the rule body		
        //first remove strings
        ruleBody = ruleBody.replace(new RegExp(Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN, "g"), "");
        let variables = new Array();
        variables = ruleBody.match(new RegExp(Useful_regex_1.ASP_REGEX.VARIABLE_PATTERN, "g"));
        if (variables === null)
            variables = [];
        //return an array of unique variables  
        return variables.filter((value, index, array) => array.indexOf(value) === index);
    }
    clearMap() {
        this.debugAtomsMap = new Map();
    }
    cleanString() {
        this.logic_program = asp_utils_1.freezeStrings(this.logic_program, this.stringPlaceholder);
    }
    restorePlaceholderToString() {
        this.logic_program = asp_utils_1.restoreStrings(this.logic_program, this.stringPlaceholder);
    }
    getAdornedProgram() {
        return this.adornedProgram;
    }
    adornProgram(debugConstantPrefix = "_debug") {
        debugConstantPrefix = asp_utils_1.make_unique(debugConstantPrefix, this.logic_program);
        this.debug_predicate = debugConstantPrefix;
        let debugConstantNum = 1;
        this.adornedProgram = "";
        //remove aggregate atoms that are not useful for debugging purposes.
        let aggregateTerm1 = new RegExp(Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN + ",");
        let aggregateTerm2 = new RegExp(Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN + "(?!,)");
        //manage weak constraints, it permit to deal with weak.
        this.logic_program = this.replaceAll(this.logic_program, new RegExp("\](?!\.)"), "\]\.");
        let debugRules = "";
        // split the program into rules. The regex matches only a single '.'
        //this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule=>{
        this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule => {
            if (rule.includes(":-")) {
                // rule with the body should be adorned adding a the debug atoms with their globalVars
                //Consider that the debug atom then should be put as the head of a rule with the body of the rules adorned
                //This permits to derive the debug atom only if necessary, dependetly of the constants it includes
                let debugPred = debugConstantPrefix + debugConstantNum;
                let variables = this.getVariables(rule.split(":-")[1]);
                this.debugAtomsMap.set(debugPred, new asp_core_1.DebugAtom(debugPred, variables.length, variables, rule.replace("\n", "").trim() + "."));
                if (variables.length > 0) {
                    debugPred = debugPred.concat("(");
                    debugPred = debugPred.concat(variables[0]);
                    for (let i = 1; i < variables.length; ++i) {
                        debugPred = debugPred.concat(", ");
                        debugPred = debugPred.concat(variables[i]);
                    }
                    debugPred = debugPred.concat(")");
                }
                this.adornedProgram = this.adornedProgram.concat(rule);
                this.adornedProgram = this.adornedProgram.concat(", ");
                this.adornedProgram = this.adornedProgram.concat(debugPred);
                this.adornedProgram = this.adornedProgram.concat(".");
                /*Construct a rule of the form debug(1,2,3):- pred1(1), pred2(2),pred3(3).
                    where the original rule was head...:- pred1(1), pred2(2),pred3(3).*/
                debugRules = debugRules.concat(debugPred);
                if (variables.length > 0) {
                    debugRules = debugRules.concat(" :- ");
                    let body = rule.split(":-")[1];
                    body = this.replaceAll(body, aggregateTerm1, "");
                    body = this.replaceAll(body, aggregateTerm2, "");
                    body = this.replaceAll(body, Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN, "");
                    debugRules = debugRules.concat(body);
                }
                //in order to start the new rule
                debugRules = debugRules.concat(".\n");
                debugConstantNum++;
                //this includes rules without the body, such a rule should be adorned with the creation of the body including the debug atom
            }
            else if ((rule.includes("|") || (rule.includes("{") && rule.includes("}"))) && !rule.includes(":~")) {
                // disjunction or choice rule, thus add ' :- _debug#' to the rule
                let debugPred = debugConstantPrefix + debugConstantNum;
                this.adornedProgram = this.adornedProgram.concat(rule);
                this.adornedProgram = this.adornedProgram.concat(" :- ");
                this.adornedProgram = this.adornedProgram.concat(debugPred);
                this.adornedProgram = this.adornedProgram.concat(".");
                this.debugAtomsMap.set(debugPred, new asp_core_1.DebugAtom(debugPred, 0, [], rule.replace("\n", "").trim() + "."));
                debugRules = debugRules.concat(debugPred);
                debugRules = debugRules.concat(".\n");
                debugConstantNum++;
                //can be modified if i want to adorn facts too
            }
            else {
                // ignore if a fact or [w@l], copy as it is
                this.adornedProgram = this.adornedProgram.concat(rule);
                // only add delimiting . if the rule is not empty
                //note that the weight and the level [w@l] of a weak is managed as follow.
                if (rule.trim().length > 0 && !rule.includes("@")) {
                    this.adornedProgram = this.adornedProgram.concat(".");
                }
            }
        });
        if (debugRules.length > 0) {
            this.adornedProgram = this.adornedProgram.concat("\n" + debugRules);
        }
        //this.logic_program = this.adornedProgram;
    }
    getDebugAtomsMap() { return this.debugAtomsMap; }
}
exports.AdornedDebugProgramBuilder = AdornedDebugProgramBuilder;
function addDebugAtomsChoiceRule(rules, atoms, predicate) {
    let placeholders = new Map();
    let id_of_debug = atoms.match(new RegExp(`^([0-9]+) ${predicate}.*\n`, "gm"));
    if (id_of_debug == null)
        return '';
    for (let i = 0; i < id_of_debug.length; ++i) {
        id_of_debug[i] = id_of_debug[i].split(" ")[0];
    }
    let choice = "3 " + id_of_debug.length + " ";
    choice = choice.concat(id_of_debug.join(" ")) + " 0 0\n";
    rules = rules.concat(choice);
    //IMPORTANT
    //remove the rules and facts of debug atoms, because they will not be evaluated in the choice until they could be true in other ruless.
    rules = rules.replace(new RegExp("(^|\n)1 (" + id_of_debug.join('|') + ")( |\\d)+\n", "gm"), "$1");
    return rules;
}
exports.addDebugAtomsChoiceRule = addDebugAtomsChoiceRule;
//# sourceMappingURL=adorner.js.map