"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreStrings = exports.freezeStrings = exports.make_unique = void 0;
function make_unique(pred_name, asp_program, append_chars = '_') {
    while (asp_program.includes(pred_name))
        pred_name = append_chars + pred_name;
    return pred_name;
}
exports.make_unique = make_unique;
function freezeStrings(asp_program, stringsMap) {
    let match_count = 0;
    stringsMap.clear();
    return asp_program.replace(/\"(.|\n)*?\"/g, function (match) {
        let string_token = '#str-' + (++match_count) + '#';
        stringsMap.set(string_token, match);
        return string_token;
    });
}
exports.freezeStrings = freezeStrings;
function restoreStrings(asp_program, stringsMap) {
    if (stringsMap.size === 0)
        return asp_program;
    return asp_program.replace(/#str-\d+#/g, function (match) {
        if (!stringsMap.has(match))
            return '';
        return stringsMap.get(match);
    });
}
exports.restoreStrings = restoreStrings;
//# sourceMappingURL=asp_utils.js.map