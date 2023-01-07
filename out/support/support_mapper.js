"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportRuleMapper = void 0;
const asp_core_1 = require("../dbg-ground/asp_core");
class SupportRuleMapper {
    constructor() {
        this.supportMap = new Map();
    }
    mapSimpleRule(rule) {
        if (rule.match(':-') == null)
            return;
        let head_atoms = rule.split(':-')[0].split('|');
        for (let atom of head_atoms) {
            let atomPredicate = asp_core_1.Predicate.getFromAtom(atom);
            if (atomPredicate == null)
                continue;
            let atomPredicateStr = atomPredicate.getPredString();
            if (!this.supportMap.has(atomPredicateStr))
                this.supportMap.set(atomPredicateStr, new Set());
            this.supportMap.get(atomPredicateStr).add(rule.trim());
        }
    }
    getMap() { return this.supportMap; }
}
exports.SupportRuleMapper = SupportRuleMapper;
//# sourceMappingURL=support_mapper.js.map