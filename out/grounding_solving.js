"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grounder_Solver = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class Grounder_Solver {
    /**
     * Runs the asp systems
     * @param files_paths the paths of the files which contain a logic program
     * @param options optional arguments for the asp system
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    runAspSystem(files_paths, options) {
        let pathToSystem;
        switch (process.platform) {
            case "darwin":
                pathToSystem = "bin/dlv2_macos";
                break;
            case "win32":
                pathToSystem = "bin/dlv2_windows.exe";
                break;
            default:
                pathToSystem = "bin/dlv2_linux";
                break;
        }
        const args = options ? files_paths.concat(options) : files_paths;
        return (0, child_process_1.spawnSync)(pathToSystem, args, { encoding: "utf-8", cwd: path_1.default.resolve(__dirname, "../") }).output.slice(1);
    }
    /**
     * Grounds the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    ground(files_paths) {
        return this.runAspSystem(files_paths, ["--mode=idlv", "--t"]);
    }
    /**
     * Calculates all answer sets of the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getAllAnswerSets(files_paths) {
        return this.runAspSystem(files_paths, ["-n 0"]);
    }
    /**
     * Caculates only the first answer set of the lgoic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getFirstAnswerSet(files_paths) {
        return this.runAspSystem(files_paths);
    }
}
exports.Grounder_Solver = Grounder_Solver;
//# sourceMappingURL=grounding_solving.js.map