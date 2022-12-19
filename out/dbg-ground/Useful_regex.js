"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASP_REGEX = void 0;
class ASP_REGEX {
}
exports.ASP_REGEX = ASP_REGEX;
// positive lookbehind for a single '.' or the beginning of a line
// arbitrary sequence of spaces, letters, digits, brackets, colons, underscores, dashes and two dots
// positive lookbehind for a single '.' that delimits the fact
ASP_REGEX.FACT_REGEX = "((?<=((?<!\\.)\\.(?!\\.)))|^)" + "(([ a-zA-Z0-9(),_\\-]|(\\.\\.))*)" + "(?=((?<!\\.)\\.(?!\\.)))";
/** Group that matches the fact */
ASP_REGEX.FACT_REGEX_MATCHING_GROUP = "$3";
/** Regular expression that matches a variable */
// positive lookbehind for a starting delimiter of the variable
// variable
// positive lookahead for a ending delimiter of the variable
ASP_REGEX.VARIABLE_REGEX = "(?<=[(,; ])" + "(_*[A-Z][A-Za-z0-9]*)" + "(?=[),; ])";
ASP_REGEX.MULTILINE = 'm';
ASP_REGEX.FACT_PATTERN = new RegExp(ASP_REGEX.FACT_REGEX, ASP_REGEX.MULTILINE);
ASP_REGEX.VARIABLE_PATTERN = new RegExp(ASP_REGEX.VARIABLE_REGEX);
ASP_REGEX.COMMENT_PATTERN = new RegExp(" *%([^#@].*)?$\n?", ASP_REGEX.MULTILINE);
ASP_REGEX.AGGREGATE_PATTERN = new RegExp("[^\\{\\},]*\\{[^\\{\\}]*?\\}[^\\{\\},]*");
//# sourceMappingURL=Useful_regex.js.map