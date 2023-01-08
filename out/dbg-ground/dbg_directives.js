"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugDirectives = exports.DebugDirectiveError = void 0;
const adorner_1 = require("./adorner");
const dbg_annotation_1 = require("./dbg_annotation");
class DebugDirectiveError extends Error {
    constructor(message) { super(message); }
}
exports.DebugDirectiveError = DebugDirectiveError;
class DebugDirectives {
    static getInstance() {
        if (DebugDirectives.instance == null)
            DebugDirectives.instance = new DebugDirectives();
        return DebugDirectives.instance;
    }
    parseDirectives(input_program) {
        this.reset();
        let __this = this;
        return input_program.replace(/^\s*%#(.*)$/gm, function (dir_match, dir_content) {
            if (!__this.__parseDefaultPolicyDirective(dir_content) &&
                !__this.__parseMissingSupportDirective(dir_content))
                throw new DebugDirectiveError('Directive "' + dir_match + '" not supported.');
            return '';
        });
    }
    __parseDefaultPolicyDirective(dir_content) {
        let dir_content_match = dir_content.match(/^debug\s+default\s*=\s*(rules_only|facts_only|all|none)\s*\.\s*$/);
        if (dir_content_match == null)
            return false;
        this.reset();
        const policy = dir_content_match[1];
        if (policy === 'facts_only')
            this.defaultAdornerPolicy = adorner_1.DefaultAdornerPolicy.FACTS_ONLY;
        else if (policy === 'all')
            this.defaultAdornerPolicy = adorner_1.DefaultAdornerPolicy.ALL;
        else if (policy === 'none') {
            this.defaultAdornerPolicy = adorner_1.DefaultAdornerPolicy.ALL;
            this.negateDefaultAdornerPolicy = true;
        }
        return true;
    }
    __parseMissingSupportDirective(dir_content) {
        let dir_content_match = dir_content.match(/^debug\s+support\s*=\s*none\s*\.\s*$/);
        if (dir_content_match == null)
            return false;
        this.reset();
        this.missingSupportEnabled = false;
        return true;
    }
    reset() {
        this.defaultAdornerPolicy = adorner_1.DefaultAdornerPolicy.RULES_ONLY;
        this.negateDefaultAdornerPolicy = false;
        this.missingSupportEnabled = true;
    }
    getDefaultAdornerPolicy() { return this.defaultAdornerPolicy; }
    isNegateDefaultAdornerPolicy() { return this.negateDefaultAdornerPolicy; }
    isMissingSupportEnabled() { return this.missingSupportEnabled; }
    getStartingDebugRuleAnnotation() {
        if (this.defaultAdornerPolicy == adorner_1.DefaultAdornerPolicy.ALL &&
            this.negateDefaultAdornerPolicy)
            return new dbg_annotation_1.DebugRuleAnnotation(true, true);
        return null;
    }
    constructor() {
        this.defaultAdornerPolicy = adorner_1.DefaultAdornerPolicy.RULES_ONLY;
        this.negateDefaultAdornerPolicy = false;
        this.missingSupportEnabled = true;
    }
}
exports.DebugDirectives = DebugDirectives;
DebugDirectives.instance = null;
//# sourceMappingURL=dbg_directives.js.map