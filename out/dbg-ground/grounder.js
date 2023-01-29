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
        if (this.errorOnStdout(grounder_proc.stdout))
            throw new AspGrounderError(grounder_proc.stdout);
        return grounder_proc.stdout;
    }
}
class AspGrounderGringo extends ExternalAspGrounder {
    getGrounderCommand() { return AspGrounderGringo.GRINGO_COMMAND; }
    getGrounderOptions() { return AspGrounderGringo.GRINGO_OPTIONS; }
    errorOnStdout(stdout) { return false; }
}
exports.AspGrounderGringo = AspGrounderGringo;
AspGrounderGringo.GRINGO_COMMAND = 'gringo';
AspGrounderGringo.GRINGO_OPTIONS = '-o smodels';
class AspGrounderIdlv extends ExternalAspGrounder {
    getGrounderCommand() { return this.idlv_command; }
    getGrounderOptions() { return this.idlv_options; }
    errorOnStdout(stdout) { return stdout.match(/(STDIN:|-->)/) != null; }
    constructor() {
        super();
        this.idlv_options = '--stdin --output 0';
        if (process.platform == 'linux') {
            this.idlv_command = './bin/idlv_1.1.6_linux_x86-64';
        }
        else if (process.platform == 'win32') {
            this.idlv_command = '.\\bin\\idlv_1.1.6_windows.exe';
        }
        else if (process.platform == 'darwin') {
            this.idlv_command = './bin/idlv_1.1.6_mac';
        }
    }
    ground(inputProgram) {
        const us_unique = (0, asp_utils_1.make_unique)('u', inputProgram, 'u');
        return super.ground(IntervalsExpander.expandIntervals(inputProgram.replace(new RegExp(/(^|\W)_(\w)/g), "$1 " + us_unique + "$2")))
            .replace(new RegExp(us_unique, "g"), '_')
            .replace(/\s+\n/g, "\n");
    }
}
exports.AspGrounderIdlv = AspGrounderIdlv;
class TheoreticalAspGrounder extends AspGrounder {
    constructor(grnd) { super(); this.grounder = grnd; }
    ground(inputProgram) {
        let stringsMap = new Map();
        inputProgram = (0, asp_utils_1.freezeStrings)(inputProgram, stringsMap).replace(new RegExp(/\r\n/gm), '\n');
        inputProgram = this.removeComments(inputProgram);
        this.disjFactPredName = (0, asp_utils_1.make_unique)(TheoreticalAspGrounder.DEFAULT_DISJ_FACT_PREDNAME, inputProgram);
        this.disjAtomPredName = (0, asp_utils_1.make_unique)(TheoreticalAspGrounder.DEFAULT_DISJ_ATOM_PREDNAME, inputProgram);
        inputProgram = this.rewriteFacts(inputProgram);
        inputProgram = (0, asp_utils_1.restoreStrings)(inputProgram, stringsMap);
        return this.nullifyFactRewritings(this.grounder.ground(inputProgram));
    }
    removeComments(input_program) { return input_program.replace(/%.*$/gm, ''); }
    rewriteFacts(input_program) {
        // rewrite all facts from input program.
        let facts = new Set();
        let __this = this;
        input_program = input_program.replace(/(?<=^|\.|\])(\s*-?[a-z_][a-zA-Z0-9_]*\s*(\([\sa-zA-Z0-9_,\-#\(\)\.]*?\))?\s*)\./g, function (match, atom) {
            facts.add(atom.trim());
            return atom + ` :- ${__this.disjFactPredName}.`;
        });
        // rewrite all ground atoms (not facts) from input program.
        let allmatches = input_program.matchAll(/(\s*-?[a-z_][a-zA-Z0-9_]*\s*(\([\sa-zA-Z0-9_,\-#\(\)\.]*?\))?\s*)(\.|,|\||:)/g);
        let groundAtoms = new Set();
        for (let match of allmatches) {
            let atom = match[1].trim();
            if (!atom.match(/[^_a-z0-9]([A-Z]|_[^_a-zA-Z0-9])/g) &&
                !facts.has(atom) && atom !== this.disjFactPredName && atom !== this.disjFactPredName) // constant atom that is not a fact...
                groundAtoms.add(atom);
        }
        for (let atom of groundAtoms)
            input_program += "\n" + atom + ` :- ${this.disjAtomPredName}.`;
        if (facts.size !== 0)
            input_program += `\n${this.disjFactPredName} | -${this.disjFactPredName}.`;
        if (groundAtoms.size !== 0)
            input_program += `\n${this.disjAtomPredName} | -${this.disjAtomPredName}.`;
        return input_program;
    }
    nullifyFactRewritings(ground_program) {
        try {
            let sections = ground_program.split(/^0\n/gm);
            let rules = sections[0];
            let symbols = sections[1];
            //
            // disjunctive facts rewritings
            //
            try {
                //
                // rewrite symbol table
                //
                const posDisjFactRegexp = new RegExp(`^(\\d+) ${this.disjFactPredName}\\n`, 'gm');
                const negDisjFactRegexp = new RegExp(`^(\\d+) -${this.disjFactPredName}\\n`, 'gm');
                const pos_disj_fact_code = posDisjFactRegexp.exec(symbols)[1];
                const neg_disj_fact_code = negDisjFactRegexp.exec(symbols)[1];
                symbols = symbols.replace(posDisjFactRegexp, '');
                symbols = symbols.replace(negDisjFactRegexp, '');
                //
                // rewrite rules
                //
                const disjFactRuleRegexp = new RegExp('^1 (\\d+) 1 0 ' + pos_disj_fact_code + '$', 'gm');
                const dfConstraintRuleRegexp = new RegExp('^1 1 2 0 (' + pos_disj_fact_code + ' ' + neg_disj_fact_code + '|'
                    + neg_disj_fact_code + ' ' + pos_disj_fact_code + ')\\n', 'gm');
                const dfDisjuncRuleRegexp = new RegExp('^8 2 (' + pos_disj_fact_code + ' ' + neg_disj_fact_code + '|'
                    + neg_disj_fact_code + ' ' + pos_disj_fact_code + ') 0 0\\n', 'gm');
                rules = rules.replace(disjFactRuleRegexp, '1 $1 0 0');
                rules = rules.replace(dfConstraintRuleRegexp, '');
                rules = rules.replace(dfDisjuncRuleRegexp, '');
            }
            catch (err) { }
            //
            // disjunctive facts rewritings
            //
            try {
                //
                // rewrite symbol table
                //
                const posDisjAtomRegexp = new RegExp(`^(\\d+) ${this.disjAtomPredName}\\n`, 'gm');
                const negDisjAtomRegexp = new RegExp(`^(\\d+) -${this.disjAtomPredName}\\n`, 'gm');
                const pos_disj_atom_code = posDisjAtomRegexp.exec(symbols)[1];
                const neg_disj_atom_code = negDisjAtomRegexp.exec(symbols)[1];
                symbols = symbols.replace(posDisjAtomRegexp, '');
                symbols = symbols.replace(negDisjAtomRegexp, '');
                //
                // rewrite rules
                //
                const disjAtomRuleRegexp = new RegExp('^1 (\\d+) 1 0 ' + pos_disj_atom_code + '\n', 'gm');
                const daConstraintRuleRegexp = new RegExp('^1 1 2 0 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                    + neg_disj_atom_code + ' ' + pos_disj_atom_code + ')\\n', 'gm');
                const daDisjuncRuleRegexp = new RegExp('^8 2 (' + pos_disj_atom_code + ' ' + neg_disj_atom_code + '|'
                    + neg_disj_atom_code + ' ' + pos_disj_atom_code + ') 0 0\\n', 'gm');
                rules = rules.replace(disjAtomRuleRegexp, '');
                rules = rules.replace(daConstraintRuleRegexp, '');
                rules = rules.replace(daDisjuncRuleRegexp, '');
            }
            catch (err) { }
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
TheoreticalAspGrounder.DEFAULT_DISJ_FACT_PREDNAME = '_df';
TheoreticalAspGrounder.DEFAULT_DISJ_ATOM_PREDNAME = '_da';
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