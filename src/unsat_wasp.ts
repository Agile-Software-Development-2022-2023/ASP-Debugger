import { ChildProcess } from "child_process";

const { exec } = require('child_process');


export default class WaspMuses{

    
    sysComm :string;
    constructor(){
        //for now it is linux based
        this.sysComm = "./wasp --mus=\"";
    }   

    call_wasp(grounded: string, d_predicates:string[]):string{
        let command:string;
        command = grounded.concat(" >", this.sysComm, " ", d_predicates.join(";"),"\"");
        console.log(command);
        let child_proc:ChildProcess = exec(command, function (err: any, stdout: any, stderr: any) {
                console.log(stdout);
                stdout;
            });
        return child_proc.stdout.read()
    }

}


/*import { exec } from 'child_process';

exec('gringo-', (err, stdout, stderr) => {
  // your callback
});*/