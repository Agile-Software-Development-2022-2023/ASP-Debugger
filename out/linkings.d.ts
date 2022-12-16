export declare class InvalidLinkingsError extends Error {
}
export declare class Linker {
    /**
     * Checks if the given object represents a valid linking object
     * @param linkings the object to check
     * @returns true if the given object is a valid linkings object, false otherwise
    */
    private static checkLinkingsValidity;
    /**
     * Reads and returns the linkings object given a path
     * @param path_to_linkings the path to the json file containing the linkings object
     * @throws an error if there was a problem reading, writing or checking the existance of the given linkings file
     * @throws {InvalidLinkingsError} if the linkings file contains an invalid linkings object
     * @returns the read linkings object if the given path exists, otherwise a default empty linkings object
    */
    private static readAndValidateLinkings;
    /**
     * Creates or updates a given linkings file by linking the given files
     *
     * If less than 2 files are given no file is linked
     * @param files_paths the paths of the files that need to be linked
     * @param path_to_linkings the path to the json file containing the linkings object
    */
    static linkFiles(files_paths: string[], path_to_linkings: string): void;
    /**
     * Removes a file without validating the given linkings object
     * @param file_path the path to the file to be unlinked
     * @param linkings the linkings object (won't be validated)
    */
    private static unlinkFileNoValidation;
    /**
     * Unlinks the given file from any file it is linked to
     * @param file_path the path to the file to be unlinked
     * @param path_to_linkings the path to the json file containing the linkings object
    */
    static unlinkFile(file_path: string, path_to_linkings: string): void;
    /**
     * Unlinks all files inside the pool that contains the given file and removes that pool
     * @param file_path a path to a file contained in the pool to be removed
     * @param path_to_linkings the path to the json file containing the linkings object
    */
    static disbandFilePool(file_path: string, path_to_linkings: string): void;
    /**
     * @param path_to_linkings the path to the json file containing the linkings object
     * @returns an object containing all the pools in the given linkings
    */
    static getAllPools(path_to_linkings: string): Object;
    /**
     * @param file_path a path to a file
     * @returns if the file is in a pool, the list of paths to all the files in the same pool, otherwise a list containing only the given file
    */
    static getLinkedFiles(file_path: string, path_to_linkings: string): string[];
    /**
     * Removes the linked files that are missing from the filesystem
     * @param path_to_linkings the path to the json file containing the linkings object
     * @param file_path an optional path to a file. If given, removes only the missing files linked to it
     * @returns the list of paths to the missing files that were removed
    */
    static purgeAndGetMissingFiles(path_to_linkings: string, file_path?: string): string[];
}
