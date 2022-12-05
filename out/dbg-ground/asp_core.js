"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AspRule {
    constructor(body, globvars = []) {
        this.body = body;
        this.globvars = globvars;
    }
    getRule() {
        return this.body;
    }
    getGlobVars() {
        return this.globvars;
    }
    setBody(body) {
        this.body = body;
    }
    setGlobVars(globvars) {
        this.globvars = globvars;
    }
    getBody() {
        return this.body;
    }
    isFact() { return this.body.length == 0; }
}
exports.AspRule = AspRule;
class DebugAtom {
    constructor(predName, predArity, vars, rl) {
        this.predicateName = predName;
        this.predicateArity = predArity;
        this.variables = vars;
        this.nonground_rule = rl;
    }
    equals(other) {
        return other.predicateArity == this.predicateArity && other.variables === this.variables && this.nonground_rule === other.nonground_rule && this.predicateName === other.predicateName;
    }
    ;
    getPredicateName() { return this.predicateName; }
    getPredicateArity() { return this.predicateArity; }
    getVariables() { return this.variables; }
    getNonGroundRule() { return this.nonground_rule; }
}
exports.DebugAtom = DebugAtom;
//# sourceMappingURL=asp_core.js.map