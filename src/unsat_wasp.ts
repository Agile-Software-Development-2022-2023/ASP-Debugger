import { spawnSync, SpawnSyncReturns } from "child_process";


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
            throw err
        }  
        if(std_out== true){
            return execProcess.stdout.toString();
        }
        return  execProcess.stderr.toString();
    }

    // to implement
    parse_result(muses:string): Array<string[]>{
        //PARSE compute muses exec output and return an array of atoms for each muses specified
        let musMatrix = new  Array<Array<string>>;
        let muses_lines:string[] = muses.split("\n");
        let re = new RegExp(/\[MUS\s\#\d+\]\:\s+(.+)/);
        for(let i:number = 0; i< muses_lines.length;++i) {
            let el:string = muses_lines[i];
            let arr = new Array<string>;1
            if(re.test(el)){
                //adding a space in order to recognize and add the last token 
                //assuming that the division happen by a space
                el = el.replace(re, "$1 ");
                //if i have only the space, then i don't have a muse
                if(el.length == 1) continue;
                let inString:boolean=false;
                for(let x = 0; x<el.length; x++) { 
                    if(el[x] == '"' && el[x-1] != '\\'){
                        inString =  !inString;
                    }
                    else if(!inString && el[x] == ' '){
                        arr.push(el.substring(0, x));
                        if(x != el.length-1){
                            el = el.substring(x+1, el.length);
                            x = 0;
                        }
                    }
                }
                musMatrix.push(arr);
            }       
        }
        return musMatrix;
    }

    compute_muses(grounded: string, d_predicates:string[], number_of: number= 0):string{
        let command:string;
        command =  this.sysComm;
        let mus = "--mus=".concat(d_predicates.join(";"));
        let output ;
        try {
            output = this.exec_command(command, [ mus,  "-n ".concat(number_of.toString()) ], grounded, true);    
        } catch (error) {
            throw error
        }
        
        return output;
    }

    get_muses(grounded: string, d_predicates:string[], number_of: number= 0):Array<string[]>{
        let musesObtained;
        try{musesObtained = this.compute_muses(grounded, d_predicates, number_of);}
        catch(e){throw e}
        return this.parse_result(musesObtained);
    }

}


/*import { exec } from 'child_process';

exec('gringo-', (err, stdout, stderr) => {
  // your callback
});*/