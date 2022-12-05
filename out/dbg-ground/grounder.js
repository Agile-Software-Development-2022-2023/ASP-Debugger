"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const asp_utils_1 = require("./asp_utils");
class AspGrounderError extends Error {
    constructor(message) { super(message); }
}
exports.AspGrounderError = AspGrounderError;
class AspGrounder {
    static loadProgram(programPaths) {
        try {
            let program = "";
            for (let ppath of programPaths)
                program += fs_1.readFileSync(ppath, 'utf-8');
            return program;
        }
        catch (err) {
            throw new AspGrounderError('Loading ASP program error.');
        }
    }
}
exports.AspGrounder = AspGrounder;
class AspGrounderGringo extends AspGrounder {
    ground(inputProgram) {
        let gringo_proc;
        try {
            gringo_proc = child_process_1.spawnSync(AspGrounderGringo.GRINGO_COMMAND, AspGrounderGringo.GRINGO_OPTIONS.split(/\s+/), { encoding: 'utf-8', cwd: path_1.default.resolve(__dirname, "../../"), input: inputProgram });
        }
        catch (err) {
            throw new AspGrounderError(err);
        }
        if (!gringo_proc.stdout)
            throw new AspGrounderError('Invalid gringo exec.');
        if (gringo_proc.stderr && gringo_proc.stderr.match(/not\sfound|error/i).length > 0)
            throw new AspGrounderError(gringo_proc.stderr);
        return gringo_proc.stdout;
    }
}
exports.AspGrounderGringo = AspGrounderGringo;
AspGrounderGringo.GRINGO_COMMAND = 'gringo';
AspGrounderGringo.GRINGO_OPTIONS = '-o smodels';
class TheoreticalAspGrounder extends AspGrounder {
    constructor(grnd) { super(); this.grounder = grnd; }
    ground(inputProgram) {
        let stringsMap = new Map();
        inputProgram = asp_utils_1.freezeStrings(inputProgram, stringsMap);
        inputProgram = this.removeComments(inputProgram);
        inputProgram = this.rewriteFacts(inputProgram);
        inputProgram = asp_utils_1.restoreStrings(inputProgram, stringsMap);
        return this.nullifyFactRewritings(this.grounder.ground(inputProgram));
    }
    removeComments(input_program) { return input_program.replace(/%.*$/gm, ''); }
    rewriteFacts(input_program) {
        //const df_predname: string = this.getDisjFactPredName(input_program);
        return input_program.replace(/((?<=((?<!\.)\.(?!\.)))|^)(([ a-zA-Z0-9(),_\-#]|(\.\.))*)(?=((?<!\.)\.(?!\.)))/gm, "$3 :- _df") + "\n_df | -_df.";
    }
    nullifyFactRewritings(ground_program) {
        try {
            let sections = ground_program.split(/^0\n/gm);
            let rules = sections[0];
            let symbols = sections[1];
            //
            // rewrite symbol table
            //
            const posDisjFactRegexp = new RegExp('^(\\d+) _df\\n', 'gm');
            const negDisjFactRegexp = new RegExp('^(\\d+) -_df\\n', 'gm');
            const pos_disj_atom_code = posDisjFactRegexp.exec(symbols)[1];
            const neg_disj_atom_code = negDisjFactRegexp.exec(symbols)[1];
            symbols = symbols.replace(posDisjFactRegexp, '');
            symbols = symbols.replace(negDisjFactRegexp, '');
            //
            // rewrite rules
            //
            const disjFactRuleRegexp = new RegExp('^1 (\\d+) 1 0 ' + pos_disj_atom_code, 'gm');
            const constraintRuleRegexp = new RegExp('^1 1 2 0 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                + neg_disj_atom_code + ' ' + pos_disj_atom_code + ')\\n', 'gm');
            const disjuncRuleRegexp = new RegExp('^8 2 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                + neg_disj_atom_code + ' ' + pos_disj_atom_code + ') 0 0\\n', 'gm');
            rules = rules.replace(disjFactRuleRegexp, '1 $1 0 0');
            rules = rules.replace(constraintRuleRegexp, '');
            rules = rules.replace(disjuncRuleRegexp, '');
            sections[0] = rules;
            sections[1] = symbols;
            return sections.join("0\n");
        }
        catch (err) {
            return ground_program;
        }
    }
    getDisjFactPredName(input_program) { return asp_utils_1.make_unique('_df', input_program); }
}
exports.TheoreticalAspGrounder = TheoreticalAspGrounder;
class AspGrounderFactory {
    constructor() { }
    static getInstance() {
        if (AspGrounderFactory.instance == null)
            AspGrounderFactory.instance = new AspGrounderFactory();
        return AspGrounderFactory.instance;
    }
    getDefault() { return new AspGrounderGringo(); }
    getTheoretical() { return new TheoreticalAspGrounder(new AspGrounderGringo()); }
}
exports.AspGrounderFactory = AspGrounderFactory;
//# sourceMappingURL=grounder.js.map