export default class WaspCaller {
    sysComm: string;
    constructor(pathToWasp?: string);
    exec_command(command: string, args: string[], input: string, std_out: boolean): string;
    parse_result(muses: string): Array<string[]>;
    compute_muses(grounded: string, d_predicates: string[], number_of?: number): string;
    get_muses(grounded: string, d_predicates: string[], number_of?: number): Array<string[]>;
}
