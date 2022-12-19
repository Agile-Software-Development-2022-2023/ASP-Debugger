"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRuleAnnotation = exports.DebugAnnotationError = void 0;
const adorner_1 = require("./adorner");
const dbg_directives_1 = require("./dbg_directives");
class DebugAnnotationError extends Error {
    constructor(message) { super(message); }
}
exports.DebugAnnotationError = DebugAnnotationError;
class DebugRuleAnnotation {
    constructor(skip, nested = false) { this.skip = skip; this.nested = nested; }
    static parseAnnotation(input_rule) {
        let annotationMatch = input_rule.match(/^\s*%@\s*(skip|correct|check)\s*\.\s*$/);
        if (annotationMatch == null) {
            annotationMatch = input_rule.match(/^\s*%@/);
            if (annotationMatch != null)
                throw new DebugAnnotationError('Annotation "' + annotationMatch[0] + '" not supported.');
            let directives = dbg_directives_1.DebugDirectives.getInstance();
            if (directives.getDefaultAdornerPolicy() == adorner_1.DefaultAdornerPolicy.ALL &&
                directives.isNegateDefaultAdornerPolicy())
                return new DebugRuleAnnotation(true, true);
            return null;
        }
        return new DebugRuleAnnotation(annotationMatch[1] != 'check');
    }
    skipRule() { return this.skip; }
    isNested() { return this.nested; }
}
exports.DebugRuleAnnotation = DebugRuleAnnotation;
//# sourceMappingURL=dbg_annotation.js.map