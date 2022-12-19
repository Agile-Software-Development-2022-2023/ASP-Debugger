"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalsExpander = exports.AspGrounderFactory = exports.TheoreticalAspGrounder = exports.AspGrounderIdlv = exports.AspGrounderGringo = exports.AspGrounder = exports.AspGrounderError = void 0;
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
                program += (0, fs_1.readFileSync)(ppath, 'utf-8') + "\n";
            return program;
        }
        catch (err) {
            throw new AspGrounderError('Loading ASP program error.');
        }
    }
}
exports.AspGrounder = AspGrounder;
class ExternalAspGrounder extends AspGrounder {
    ground(inputProgram) {
        const grounder_command = this.getGrounderCommand();
        const grounder_options = this.getGrounderOptions();
        let grounder_proc;
        try {
            grounder_proc = (0, child_process_1.spawnSync)(grounder_command, grounder_options.split(/\s+/), { encoding: 'utf-8', cwd: path_1.default.resolve(__dirname, "../../"), input: inputProgram });
        }
        catch (err) {
            throw new AspGrounderError(err);
        }
        if (!grounder_proc.stdout)
            throw new AspGrounderError('Invalid external grounder exec:\n\t' + grounder_proc.toString());
        if (grounder_proc.stderr && grounder_proc.stderr.match(/not\sfound|error/i))
            throw new AspGrounderError(grounder_proc.stderr);
        return grounder_proc.stdout;
    }
}
class AspGrounderGringo extends ExternalAspGrounder {
    getGrounderCommand() { return AspGrounderGringo.GRINGO_COMMAND; }
    getGrounderOptions() { return AspGrounderGringo.GRINGO_OPTIONS; }
}
exports.AspGrounderGringo = AspGrounderGringo;
AspGrounderGringo.GRINGO_COMMAND = 'gringo';
AspGrounderGringo.GRINGO_OPTIONS = '-o smodels';
class AspGrounderIdlv extends ExternalAspGrounder {
    getGrounderCommand() { return AspGrounderIdlv.IDLV_COMMAND; }
    getGrounderOptions() { return AspGrounderIdlv.IDLV_OPTIONS; }
    ground(inputProgram) {
        if (process.platform == 'win32') {
            throw new Error("Missing wasp exe for windows so no debuging can be supported after executing idlv");
            //this.sysComm = './bin/wasp-windows';
        }
        else if (process.platform == 'darwin') {
            throw new Error("Missing wasp for mac so no debuging can be supported after executing idlv");
            //this.sysComm = './bin/wasp-mac';
        }
        const us_unique = (0, asp_utils_1.make_unique)('u', inputProgram, 'u');
        return super.ground(IntervalsExpander.expandIntervals(inputProgram.replace(new RegExp(/(^|\W)_(\w)/g), "$1 " + us_unique + "$2")))
            .replace(new RegExp(us_unique, "g"), '_')
            .replace(/\s+\n/g, "\n");
    }
}
exports.AspGrounderIdlv = AspGrounderIdlv;
AspGrounderIdlv.IDLV_COMMAND = './bin/idlv_1.1.6_linux_x86-64';
AspGrounderIdlv.IDLV_OPTIONS = '--stdin';
class TheoreticalAspGrounder extends AspGrounder {
    constructor(grnd) { super(); this.grounder = grnd; }
    ground(inputProgram) {
        let stringsMap = new Map();
        inputProgram = (0, asp_utils_1.freezeStrings)(inputProgram, stringsMap);
        inputProgram = this.removeComments(inputProgram);
        inputProgram = this.rewriteFacts(inputProgram);
        inputProgram = (0, asp_utils_1.restoreStrings)(inputProgram, stringsMap);
        return this.nullifyFactRewritings(this.grounder.ground(inputProgram));
    }
    removeComments(input_program) { return input_program.replace(/%.*$/gm, ''); }
    rewriteFacts(input_program) {
        //const df_predname: string = this.getDisjFactPredName(input_program);
        return input_program.replace(/(?<=^|\.|\])(\s*[a-z\-_][a-zA-Z0-9_]*\s*(\([\sa-zA-Z0-9_,\-#\(\)\.]*?\))?\s*)\./g, "$1 :- _df.") + "\n_df | -_df.";
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
            const disjFactRuleRegexp = new RegExp('^1 (\\d+) 1 0 ' + pos_disj_atom_code + '$', 'gm');
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
    getDisjFactPredName(input_program) { return (0, asp_utils_1.make_unique)('_df', input_program); }
}
exports.TheoreticalAspGrounder = TheoreticalAspGrounder;
class AspGrounderFactory {
    static getInstance() {
        if (AspGrounderFactory.instance == null)
            AspGrounderFactory.instance = new AspGrounderFactory();
        return AspGrounderFactory.instance;
    }
    constructor() { }
    getDefault() { return new AspGrounderIdlv(); }
    getTheoretical() { return new TheoreticalAspGrounder(this.getDefault()); }
}
exports.AspGrounderFactory = AspGrounderFactory;
class IntervalsExpander {
    static expandIntervals(input_program) {
        let ans = '';
        input_program = input_program.replace(/(\[.*?@.*?\])/g, "$1.");
        input_program.split(/(?<!\.)\.(?!\.)/).forEach(rule => {
            if (rule.match(/^\s*$/) != null || rule.match(/\[.*?@.*?\]/) != null) {
                ans += rule;
                return;
            }
            if (rule.match(/:~/) != null) {
                ans += rule + '.';
                return;
            }
            let intervalFromIndices = [];
            let intervalToIndices = [];
            let intervalCurrentIndices = [];
            let id = 0;
            rule = rule.replace(/((?:-\s*)?\d+)\s*\.\.\s*((?:-\s*)?\d+)/g, function (match, from, to) {
                from = Number.parseInt(from.replace(/\s/g, ''));
                to = Number.parseInt(to.replace(/\s/g, ''));
                intervalFromIndices.push(from);
                intervalToIndices.push(to);
                intervalCurrentIndices.push(from);
                return '#interval-' + (id++) + '#';
            });
            if (intervalCurrentIndices.length === 0) {
                ans += rule + '.';
                return;
            }
            intervalCurrentIndices[0]--;
            while (IntervalsExpander.nextIntervalIndices(intervalFromIndices, intervalToIndices, intervalCurrentIndices)) {
                let ruleInstance = rule;
                for (let i = 0; i < intervalCurrentIndices.length; ++i)
                    ruleInstance = ruleInstance.replace('#interval-' + i + '#', intervalCurrentIndices[i].toString());
                ans += ruleInstance + '.';
            }
        });
        return ans;
    }
    static nextIntervalIndices(intervalFromIndices, intervalToIndices, intervalCurrentIndices) {
        let i = 0;
        while (i < intervalFromIndices.length) {
            intervalCurrentIndices[i]++;
            if (intervalCurrentIndices[i] <= intervalToIndices[i])
                return true;
            intervalCurrentIndices[i] = intervalFromIndices[i];
            i++;
        }
        return false;
    }
}
exports.IntervalsExpander = IntervalsExpander;
//# sourceMappingURL=grounder.js.map