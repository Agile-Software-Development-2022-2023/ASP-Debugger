"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewritingBasedDebugGrounder = exports.DebugGrounder = exports.DebugGrounderError = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const asp_core_1 = require("./asp_core");
const grounder_1 = require("./grounder");
const adorner_1 = require("./adorner");
const dbg_directives_1 = require("./dbg_directives");
const supportAdornment_1 = require("../support/supportAdornment");
const asp_utils_1 = require("./asp_utils");
const GRINGO_WRAPPER = './src/dbg-ground/gringo-wrapper/bin/gringo-wrapper';
const GRINGO_WRAPPER_OPTIONS = ['-go="-o smodels"'];
class DebugGrounderError extends grounder_1.AspGrounderError {
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
        this.debug_predicate = "_debug";
        this.support_predicate = "_support";
    }
    getEncodings() { return this.encodings; }
    getDebugAtomsMap() { return this.debugAtomsMap; }
    getSupportRuleMap() { return new Map(); }
    getDebugPredicate() { return this.debug_predicate; }
    ;
    getSupportPredicate() { return this.support_predicate; }
    static createDefault(encoding_paths) {
        return new RewritingBasedDebugGrounder(encoding_paths);
        //return new GringoWrapperDebugGrounder(encoding_paths); 
    }
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
            gw_proc = (0, child_process_1.spawnSync)(GRINGO_WRAPPER, gw_args, { encoding: 'utf-8', cwd: path_1.default.resolve(__dirname, "../../") });
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
    getAdornedProgram() { throw new DebugGrounderError('Program adornment not supported when using gringo-wrapper.'); }
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
                this.debugAtomsMap.set(debug_predname, new asp_core_1.DebugAtom(debug_predname, debug_predarity, variables, nonground_rule));
                ground_prog_done = true;
            }
            if (!ground_prog_done)
                ground_prog_rules.push(line);
            ++i;
        }
        return ground_prog_rules.slice(0, b_minus_index + 4).join("\n");
    }
}
class RewritingBasedDebugGrounder extends DebugGrounder {
    constructor() {
        super(...arguments);
        this.adornedProgram = '';
        this.supportRuleMap = new Map();
    }
    ground() {
        let debugDirectives = dbg_directives_1.DebugDirectives.getInstance();
        let input_program = grounder_1.AspGrounder.loadProgram(this.encodings);
        input_program = input_program.replace(new RegExp(/\r\n/gm), '\n');
        input_program = debugDirectives.parseDirectives(input_program);
        this.support_predicate = (0, asp_utils_1.make_unique)(this.support_predicate, input_program);
        //
        // pre-ground rewriting.
        //
        let nongroundDebugProgBuilder = new adorner_1.AdornedDebugProgramBuilder(input_program, debugDirectives.getDefaultAdornerPolicy());
        nongroundDebugProgBuilder.cleanString();
        this.debug_predicate = nongroundDebugProgBuilder.getUniqueDebugPrefix();
        //
        // remove comments from the rule group
        //
        nongroundDebugProgBuilder.removeComments();
        //
        // program adornment.
        //
        nongroundDebugProgBuilder.adornProgram();
        nongroundDebugProgBuilder.restorePlaceholderToString();
        this.supportRuleMap = nongroundDebugProgBuilder.getSupportRuleMap();
        //
        // adorned program grounding.
        //
        this.adornedProgram = nongroundDebugProgBuilder.getAdornedProgram();
        let ground_prog = grounder_1.AspGrounderFactory.getInstance().getTheoretical().ground(this.adornedProgram);
        ground_prog = ground_prog.replace(new RegExp(/\r\n/gm), '\n');
        //
        // adorn ground program for support
        //
        if (debugDirectives.isMissingSupportEnabled())
            ground_prog = new supportAdornment_1.SupportAdorner(ground_prog, this.debug_predicate, this.support_predicate).addSupport();
        //get Maps of Debug Atom after the calculatoin of the preprocessed ground program
        this.debugAtomsMap = nongroundDebugProgBuilder.getDebugAtomsMap();
        //
        // apply the post-ground rewriting.
        //
        // ground_prog will be properly rewrited to obtain the final debug program...
        let split = ground_prog.split(/^0\n/gm);
        split[0] = (0, adorner_1.addDebugAtomsChoiceRule)(split[0], split[1], this.debug_predicate, this.support_predicate);
        return split.join("0\n");
    }
    getAdornedProgram() { return this.adornedProgram; }
    getSupportRuleMap() { return this.supportRuleMap; }
}
exports.RewritingBasedDebugGrounder = RewritingBasedDebugGrounder;
//# sourceMappingURL=dbg_grounder.js.map