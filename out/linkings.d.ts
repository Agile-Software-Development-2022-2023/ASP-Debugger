export declare class InvalidLinkingsError extends Error {
}
export declare class Linker {
    private static checkLinkingsValidity;
    static linkFiles(files_paths: string[], path_to_linkings: string): void;
    static unlinkFile(file_path: string, path_to_linkings: string): void;
    static disbandFilePool(file_path: string, path_to_linkings: string): void;
    static getAllPools(path_to_linkings: string): Object;
    static getLinkedFiles(file_path: string, path_to_linkings: string): string[];
}
