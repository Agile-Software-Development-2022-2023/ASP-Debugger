"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDebugAtomsChoiceRule = exports.AdornedDebugProgramBuilder = exports.DefaultAdornerPolicy = void 0;
const AdornerImplementation_1 = require("./AdornerImplementation");
const asp_utils_1 = require("./asp_utils");
const dbg_annotation_1 = require("./dbg_annotation");
const Useful_regex_1 = require("./Useful_regex");
const dbg_directives_1 = require("./dbg_directives");
const support_mapper_1 = require("../support/support_mapper");
var DefaultAdornerPolicy;
(function (DefaultAdornerPolicy) {
    DefaultAdornerPolicy[DefaultAdornerPolicy["RULES_ONLY"] = 0] = "RULES_ONLY";
    DefaultAdornerPolicy[DefaultAdornerPolicy["FACTS_ONLY"] = 1] = "FACTS_ONLY";
    DefaultAdornerPolicy[DefaultAdornerPolicy["ALL"] = 2] = "ALL";
})(DefaultAdornerPolicy = exports.DefaultAdornerPolicy || (exports.DefaultAdornerPolicy = {}));
class AdornedDebugProgramBuilder {
    constructor(logic_program = '', policy = DefaultAdornerPolicy.RULES_ONLY) {
        this.stringPlaceholder = new Map();
        this.logic_program = logic_program;
        this.supportRuleMapper = new support_mapper_1.SupportRuleMapper();
        this.setDefaultPolicy(policy);
    }
    setDefaultPolicy(policy) {
        switch (policy) {
            case DefaultAdornerPolicy.RULES_ONLY:
                this.adornerImpl = new AdornerImplementation_1.RulesOnlyImplementation();
                break;
            case DefaultAdornerPolicy.ALL:
                this.adornerImpl = new AdornerImplementation_1.AdornAllImplementation();
                break;
            case DefaultAdornerPolicy.FACTS_ONLY:
                this.adornerImpl = new AdornerImplementation_1.FactsOnlyImplementation();
                break;
            default:
                this.adornerImpl = new AdornerImplementation_1.RulesOnlyImplementation();
        }
    }
    getDebugPredicate() { return this.adornerImpl.getDebugPredicate(); }
    setDebugPredicate(pred) { this.adornerImpl.setDebugPredicate(pred); }
    getSupportRuleMap() { return this.supportRuleMapper.getMap(); }
    //public getLogicProgram(): string { return logic_program; }
    //public setLogicProgram(input_program: string){ logic_program = input_program;this.debug_predicate = "_debug";}
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
        ruleBody = ruleBody.replace(new RegExp("#.+\{(.+)\}", "g"), "");
        //let variables1 = new Array<string>();
        let variables = new Array();
        //variables1 = ruleBody.match(new RegExp(ASP_REGEX.VARIABLE_PATTERN,"g"));
        variables = ruleBody.match(new RegExp("(?<![a-z])_*[A-Z][a-z0-9]*", "g"));
        //if(variables1 === null)
        //variables1 = [];
        if (variables === null)
            variables = [];
        return variables.filter((value, index, array) => array.indexOf(value) === index);
    }
    reset() {
        this.adornerImpl.reset();
        this.stringPlaceholder.clear();
        this.logic_program = '';
    }
    cleanString() {
        this.logic_program = (0, asp_utils_1.freezeStrings)(this.logic_program, this.stringPlaceholder);
    }
    restorePlaceholderToString() {
        for (let [key, value] of this.adornerImpl.getDebugAtomsMap()) {
            value.setNonGroundRule((0, asp_utils_1.restoreStrings)(value.getNonGroundRule(), this.stringPlaceholder));
        }
        this.adornerImpl.setAdornedProgram((0, asp_utils_1.restoreStrings)(this.adornerImpl.getAdornedProgram(), this.stringPlaceholder));
    }
    setLogicProgram(logic_program) {
        this.logic_program = logic_program;
    }
    getLogicProgram() {
        return this.logic_program;
    }
    getAdornedProgram() {
        return this.adornerImpl.getAdornedProgram();
    }
    getUniqueDebugPrefix() {
        return this.adornerImpl.make_unique_debug_prefix(this.logic_program);
    }
    adornProgram() {
        //remove aggregate atoms that are not useful for debugging purposes.
        let aggregateTerm1 = new RegExp(Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN + ",");
        let aggregateTerm2 = new RegExp(Useful_regex_1.ASP_REGEX.AGGREGATE_PATTERN + "(?!,)");
        //manage weak constraints, it permit to deal with weak.
        this.logic_program = this.replaceAll(this.logic_program, new RegExp("\](?!\.)"), "\]\.");
        let skipCurrentRule = false;
        let lastDebugRuleAnnotation = dbg_directives_1.DebugDirectives.getInstance().getStartingDebugRuleAnnotation();
        let debugRuleAnnotation = null;
        // split the program into rules. The regex matches only a single '.'
        //logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule=>{
        this.logic_program.split(/(?<!\.)\.(?!\.)/).forEach(rule => {
            if (rule.match(/^\s*\[.*?@.*?\]\s*$/) != null) {
                this.adornerImpl.adornWeights(rule);
                return;
            }
            debugRuleAnnotation = dbg_annotation_1.DebugRuleAnnotation.parseAnnotation(rule.trim() + '.');
            skipCurrentRule = (lastDebugRuleAnnotation != null && lastDebugRuleAnnotation.skipRule());
            lastDebugRuleAnnotation = debugRuleAnnotation;
            if (skipCurrentRule || (debugRuleAnnotation != null && !debugRuleAnnotation.isNested())) {
                //if (debugRuleAnnotation == null || debugRuleAnnotation.isNested())
                this.adornerImpl.copyRuleAsItIs(rule);
                return;
            }
            this.supportRuleMapper.mapRule(rule);
            if (rule.includes(":-")) {
                this.adornerImpl.adornSimpleRules(rule);
                //this includes rules without the body, such a rule should be adorned with the creation of the body including the debug atom
            }
            else if ((rule.includes("|") || (rule.includes("{") && rule.includes("}"))) && !rule.includes(":~")) {
                this.adornerImpl.adornChoiceRules(rule);
                //can be modified if i want to adorn facts too
            }
            else {
                if (rule.includes(":~"))
                    this.adornerImpl.adornWeak(rule);
                else
                    this.adornerImpl.adornFacts(rule);
            }
        });
        //final append
        if (this.adornerImpl.getDebugRules().length > 0) {
            this.adornerImpl.appendDebugRules();
        }
        //logic_program = this.adornedProgram;
    }
    getDebugAtomsMap() { return this.adornerImpl.getDebugAtomsMap(); }
}
exports.AdornedDebugProgramBuilder = AdornedDebugProgramBuilder;
function addDebugAtomsChoiceRule(rules, atoms, debug_predicate, support_predicate) {
    let placeholders = new Map();
    let id_of_debug = atoms.match(new RegExp(`^([0-9]+) (${debug_predicate}|${support_predicate}).*\n`, "gm"));
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