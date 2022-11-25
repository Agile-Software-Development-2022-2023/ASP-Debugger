import { AspRule, DebugAtom } from "./asp_core";


export class NonGroundDebugProgramBuilder
{
    private input_program: string;
    private nonground_rules: AspRule[];

    public constructor(input_program: string)
    {
        this.input_program = input_program;
    }
    
    public getInputProgram(): string { return this.input_program; }
    public getNonGroundRules(): AspRule[] { return this.nonground_rules; }
    public getResult(): string { return this.nonground_rules.join("\n"); }

    public removeComments() {}
    public parseRules() {}
    public adornRules(): Map<string, DebugAtom> { return null; }
}