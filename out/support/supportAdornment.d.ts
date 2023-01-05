export declare class SupportAdorner {
    protected support_predicate: string;
    protected numeric_program: string;
    protected output_program: string;
    constructor(numeric_program: string, support_predicate?: string);
    addSupport(): string;
    protected retrieveMax(maps: string): number;
}
