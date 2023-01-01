"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaspCaller = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class WaspCaller {
    constructor(pathToWasp = "/bin/wasp") {
        if (process.platform == 'linux') {
            this.sysComm = "./".concat(pathToWasp);
        }
        else if (process.platform == 'win32') {
            this.sysComm = '.\\bin\\wasp.exe';
        }
        else if (process.platform == 'darwin') {
            throw new Error("Missing wasp for mac");
            //this.sysComm = './bin/wasp-mac';
        }
        //for now it is linux based
        //this.sysComm = "./".concat(pathToWasp);
    }
    exec_command(command, args, input, std_out) {
        let execProcess;
        try {
            execProcess = (0, child_process_1.spawnSync)(command, args, { input: input, encoding: 'utf-8', cwd: path_1.default.resolve(__dirname, "../") });
        }
        catch (err) {
            throw err;
        }
        if (std_out == true) {
            return execProcess.stdout.toString();
        }
        return execProcess.stderr.toString();
    }
    // to implement
    parse_result(muses) {
        //PARSE compute muses exec output and return an array of atoms for each muses specified
        let musMatrix = new Array();
        let muses_lines = muses.split("\n");
        let re = new RegExp(/\[MUS\s\#\d+\]\:\s+(.+)/);
        for (let i = 0; i < muses_lines.length; ++i) {
            let el = muses_lines[i];
            let arr = new Array();
            if (re.test(el)) {
                //adding a space in order to recognize and add the last token 
                //assuming that the division happen by a space
                el = el.replace(re, "$1 ");
                //if i have only the space, then i don't have a muse
                if (el.length == 1)
                    continue;
                let inString = false;
                for (let x = 0; x < el.length; x++) {
                    if (el[x] == '"' && el[x - 1] != '\\') {
                        inString = !inString;
                    }
                    else if (!inString && el[x] == ' ') {
                        arr.push(el.substring(0, x));
                        if (x != el.length - 1) {
                            el = el.substring(x + 1, el.length);
                            x = 0;
                        }
                    }
                }
                musMatrix.push(arr);
            }
        }
        return musMatrix;
    }
    compute_muses(grounded, d_predicates, number_of = 0) {
        let command;
        command = this.sysComm;
        let mus = "--mus=".concat(d_predicates.join(";"));
        let output;
        try {
            output = this.exec_command(command, [mus, "-n ".concat(number_of.toString())], grounded, true);
        }
        catch (error) {
            throw error;
        }
        if (output.length === 0) {
            throw new Error("WASP was not able to obtain muses because of unexpected format of ground program");
        }
        return output;
    }
    get_muses(grounded, d_predicates, number_of = 0) {
        let musesObtained;
        try {
            musesObtained = this.compute_muses(grounded, d_predicates, number_of);
        }
        catch (e) {
            throw e;
        }
        return this.parse_result(musesObtained);
    }
}
exports.WaspCaller = WaspCaller;
/*import { exec } from 'child_process';

exec('gringo-', (err, stdout, stderr) => {
  // your callback
});*/ 
//# sourceMappingURL=unsat_wasp.js.map