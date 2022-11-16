import { ChildProcess, ExecException, spawn, spawnSync, SpawnSyncReturns } from "child_process";

const { exec } = require('child_process');


export default class WaspCaller{

    
    sysComm :string;
    constructor(){
        //for now it is linux based
        this.sysComm = "./resources/wasp";
    }   

    exec_command(command:string , args: string[], input:string, std_out:boolean ): string {
        let execProcess: SpawnSyncReturns<string>;
        try{
            execProcess = spawnSync(command, args,  { input : input , encoding: 'utf-8'});
        }
        catch(err){
            console.log("output",err)
            console.log("sdterr",err.stderr.toString())
            return "";
        }  
        console.log(execProcess.stdout);
        console.log(execProcess.stderr);
        if(std_out== true){
            return execProcess.stdout.toString();
        }
        return  execProcess.stderr.toString();
    }

    // to implement
    parse_result(muses:string): Array<string[]>{
        //PARSE compute muses exec oupu and return an array of atoms for each muses specified
        return [];
    }

    compute_muses(grounded: string, d_predicates:string[], number_of: number= 0):string{
        let command:string;
        command =  this.sysComm;
        let mus = "--mus=".concat(d_predicates.join(";"));
        let output = this.exec_command(command, [ mus,  "-n ".concat(number_of.toString()) ], grounded, true);
        return output;
    }

    get_muses(grounded: string, d_predicates:string[], number_of: number= 0):Array<string[]>{
        let musesObtained = this.compute_muses(grounded, d_predicates, number_of);
        return this.parse_result(musesObtained);
    }

}


/*import { exec } from 'child_process';

exec('gringo-', (err, stdout, stderr) => {
  // your callback
});*/