"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportRuleMapper = void 0;
const asp_core_1 = require("../dbg-ground/asp_core");
class SupportRuleMapper {
    constructor() {
        this.supportMap = new Map();
    }
    mapRule(rule) {
        if (rule.includes(':~'))
            return;
        if (!rule.includes(':-')) {
            this.tryMapChoice(rule, rule, false);
            return;
        }
        let head_body = rule.split(':-');
        if (head_body[1].trim().length === 0) {
            this.tryMapChoice(head_body[0], rule, false);
            return;
        }
        if (head_body[0].includes('|') || head_body[0].match(/[{}]/) == null) {
            let head_atoms = head_body[0].split('|');
            for (let atom of head_atoms)
                this.addSupport(atom, rule);
        }
        else
            this.tryMapChoice(head_body[0], rule);
    }
    tryMapChoice(head, rule, hasBody = true) {
        if (head.includes('|'))
            return;
        let choiceMatch = head.match(/{((.|\n)*)}/);
        if (choiceMatch == null)
            return;
        let choiceElems = choiceMatch[1].split(';');
        for (let elem of choiceElems) {
            let elemAtoms = elem.split(':');
            if (elemAtoms.length < 2 && !hasBody)
                continue;
            this.addSupport(elemAtoms[0], rule);
        }
    }
    addSupport(atom, rule) {
        let atomPredicate = asp_core_1.Predicate.getFromAtom(atom);
        if (atomPredicate == null)
            return;
        let atomPredicateStr = atomPredicate.getPredString();
        if (!this.supportMap.has(atomPredicateStr))
            this.supportMap.set(atomPredicateStr, new Set());
        this.supportMap.get(atomPredicateStr).add(rule.trim() + '.');
    }
    getMap() { return this.supportMap; }
}
exports.SupportRuleMapper = SupportRuleMapper;
//# sourceMappingURL=support_mapper.js.map