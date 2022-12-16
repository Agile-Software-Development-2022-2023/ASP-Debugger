import { spawnSync } from "child_process";
import path from "path";

export class Grounder_Solver {

    /**
     * Runs the asp systems
     * @param files_paths the paths of the files which contain a logic program
     * @param options optional arguments for the asp system
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    private runAspSystem(files_paths: string[], options?: string[]): string[] {

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

        const args = options? files_paths.concat(options): files_paths;

        return spawnSync(pathToSystem, args, {encoding: "utf-8", cwd: path.resolve(__dirname, "../")}).output.slice(1);   
    }

    /**
     * Grounds the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    ground(files_paths: string[]): string[] {
        return this.runAspSystem(files_paths, ["--mode=idlv", "--t"]);
    }

    /**
     * Calculates all answer sets of the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getAllAnswerSets(files_paths: string[]): string[] {
        return this.runAspSystem(files_paths);
    }

    /**
     * Caculates only the first answer set of the lgoic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getFirstAnswerSet(files_paths: string[]): string[] {
        return this.runAspSystem(files_paths, ["-n=1"]);
    }
}