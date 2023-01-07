"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Predicate = exports.DebugAtom = exports.AspRule = void 0;
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
    setNonGroundRule(nonground_rule) { this.nonground_rule = nonground_rule; }
}
exports.DebugAtom = DebugAtom;
class Predicate {
    constructor(predName, predArity = 0) {
        this.predicateName = predName;
        this.predicateArity = predArity;
    }
    equals(other) {
        return this.predicateName === other.predicateName && other.predicateArity === this.predicateArity;
    }
    ;
    getPredicateName() { return this.predicateName; }
    getPredicateArity() { return this.predicateArity; }
    static getFromAtom(atom) {
        let matches = atom.match(/\s*([a-z\-_][a-zA-Z0-9_]*)\s*(\(([\sa-zA-Z0-9_,\-#\(\)\.]*?)\))?\s*/);
        if (matches == null)
            return null;
        let predname = matches[1];
        let termslist = matches[3];
        if (termslist == undefined)
            return new Predicate(predname);
        termslist = termslist.replace(/\(.*\)/g, '');
        return new Predicate(predname, termslist.split(',').length);
    }
    getPredString() { return this.predicateName + '/' + this.predicateArity.toString(); }
}
exports.Predicate = Predicate;
//# sourceMappingURL=asp_core.js.map