"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const GRINGO_WRAPPER = './src/dbg-ground/gringo-wrapper/bin/gringo-wrapper';
const GRINGO_WRAPPER_OPTIONS = ['-go="-o smodels"'];
class DebugAtom {
    constructor(predName, predArity, vars, rl) {
        this.predicateName = predName;
        this.predicateArity = predArity;
        this.variables = vars;
        this.nonground_rule = rl;
    }
    getPredicateName() { return this.predicateName; }
    getPredicateArity() { return this.predicateArity; }
    getVariables() { return this.variables; }
    getNonGroundRule() { return this.nonground_rule; }
}
exports.DebugAtom = DebugAtom;
class DebugGrounderError extends Error {
    constructor(message) { super(message); }
}
exports.DebugGrounderError = DebugGrounderError;
class DebugGrounder {
    constructor(encoding_paths) {
        if (typeof encoding_paths === "string")
            this.encodings = [encoding_paths];
        else
            this.encodings = encoding_paths;
        this.debugAtomsMap = new Map();
    }
    getEncodings() { return this.encodings; }
    getDebugAtomsMap() { return this.debugAtomsMap; }
    static createDefault(encoding_paths) { return new GringoWrapperDebugGrounder(encoding_paths); }
}
exports.DebugGrounder = DebugGrounder;
class GringoWrapperDebugGrounder extends DebugGrounder {
    constructor(encoding_paths) { super(encoding_paths); }
    ground() {
        let gw_proc;
        try {
            let gw_args = [];
            let gw_output;
            GRINGO_WRAPPER_OPTIONS.forEach(function (opt) { gw_args.push(opt); });
            this.encodings.forEach(function (enc) { gw_args.push(enc); });
            const working_dir = require('path').resolve('./');
            gw_proc = child_process_1.spawnSync(GRINGO_WRAPPER, gw_args, { encoding: 'utf-8', cwd: working_dir });
        }
        catch (err) {
            throw new DebugGrounderError(err);
        }
        if (!gw_proc.stdout)
            throw new DebugGrounderError('Invalid gringo-wrapper exec.');
        if (gw_proc.stderr && gw_proc.stderr.match(/not\sfound|error/).length > 0)
            throw new DebugGrounderError(gw_proc.stderr);
        return this.extractDebugAtomsMap(gw_proc.stdout);
    }
    extractDebugAtomsMap(gw_output) {
        let ground_prog_rules = [];
        let b_minus_found = false;
        let b_minus_index;
        let ground_prog_done = false;
        this.debugAtomsMap.clear();
        let i = 0;
        for (var line of gw_output.split(/\n/)) {
            let rule_fields = line.split(' ');
            let code = rule_fields[0];
            if (code === 'B-') {
                b_minus_found = true;
                b_minus_index = i;
            }
            if (b_minus_found && code === '10') {
                const debug_predname = rule_fields[1];
                const debug_predarity = Number.parseInt(rule_fields[2]);
                let variables = [];
                let i = 0;
                for (; i < debug_predarity; ++i)
                    variables.push(rule_fields[3 + i]);
                let nonground_rule = rule_fields.slice(3 + i).join(' ');
                this.debugAtomsMap.set(debug_predname, new DebugAtom(debug_predname, debug_predarity, variables, nonground_rule));
                ground_prog_done = true;
            }
            if (!ground_prog_done)
                ground_prog_rules.push(line);
            ++i;
        }
        return ground_prog_rules.slice(0, b_minus_index + 4).join("\n");
    }
}
exports.GringoWrapperDebugGrounder = GringoWrapperDebugGrounder;
//# sourceMappingURL=debug_grounder.js.map