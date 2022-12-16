export declare class Grounder_Solver {
    /**
     * Runs the asp systems
     * @param files_paths the paths of the files which contain a logic program
     * @param options optional arguments for the asp system
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    private runAspSystem;
    /**
     * Grounds the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    ground(files_paths: string[]): string[];
    /**
     * Calculates all answer sets of the logic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getAllAnswerSets(files_paths: string[]): string[];
    /**
     * Caculates only the first answer set of the lgoic program contained in the given files
     * @param files_paths the paths of the files which contain the logic program
     * @returns an array with the stdout of the process at index 0 and the stderr of the process at index 1
     */
    getFirstAnswerSet(files_paths: string[]): string[];
}
