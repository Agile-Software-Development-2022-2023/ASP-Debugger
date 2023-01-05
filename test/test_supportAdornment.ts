import { describe } from "mocha";
import  {SupportAdorner} from "../src/support/supportAdornment"
import { readFileSync } from "fs";
import assert from "assert";
// testing the support rules are added correctly to a numeric asp program
describe("Adornment support atoms", function() {
    let fileList = JSON.parse(readFileSync('./test/unsat/support_test/programs_test_support.json').toString());
    it("should test that program is adorned correctly with support atoms", function() {
        fileList["test"].forEach( problem =>{
            let program:string = readFileSync(problem["problem_path"],'utf-8');
            let mySupportAd: SupportAdorner = new SupportAdorner(program); 

            if(problem["output"]!="ERRORE")
                 assert.deepEqual(mySupportAd.addSupport(), problem["output"]); 
            else{
                 assert.throws(mySupportAd.addSupport, Error);
            }
            });
        
    });
});