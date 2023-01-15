export declare class SupportAdorner {
    protected debug_predicate: string;
    protected support_predicate: string;
    protected numeric_program: string;
    protected output_program: string;
    constructor(numeric_program: string, debug_predicate?: string, support_predicate?: string);
    addSupport(): string;
    protected retrieveMax(maps: string): number;
}
