import assert from "assert";
import { readFileSync } from "fs";
import { brotliDecompressSync } from "zlib";
import { DebugAtom } from "../../../src/dbg-ground/asp_core";
import { AdornedDebugProgramBuilder, DefaultAdornerPolicy } from "../../../src/dbg-ground/adorner"
import { DebugRuleGroup } from "../../../src/dbg-ground/dbg_filter";
describe('Check preprocessing phase relatively to the utility feature works properly before grounding the program ', function()
{
    let preproc: AdornedDebugProgramBuilder = new AdornedDebugProgramBuilder() ;
    it('checks that the method getVariables retrieve actually retrieve all the variables in a function', function()
    {
        let bodies: Array<string> = ["pred(A,B,C,D), #count{X: pred1(X)}", "test(Z,A), test(Z,B), test(Z,C)", "test, proof, proof", "pred(X,C,V), pred1(L,O,P)"];
        let expected: Array<Array<string>> = [["A", "B", "C", "D"], ["Z","A", "B", "C"], [],["X","C","V","L","O","P"]];
        for(let i = 0; i< bodies.length; i++){
            assert.deepEqual(preproc.getVariables(bodies[i]), expected[i]);
        }
    });

    it('checks that the comments of a program are successfully removed', function(){
        let prog :string = "h1(X,Y,Z):-b1(X,Y,Z).\n"+"      %comment%comment&imcommenting\n"+"  %          \n"+":-{pred(X,Y)},t(X).\n"+"%this co!#mm()ent@ is removed from the program\n"+":-3{pred(X,Y,Z)},t(X).\n"+"%also this comments should be removed\n"+":-1<{pred(X,Y):t(Y)},t(costant).\n"+"         %comment that should be removed    \n";
        let expected:string = "h1(X,Y,Z):-b1(X,Y,Z).\n:-{pred(X,Y)},t(X).\n:-3{pred(X,Y,Z)},t(X).\n:-1<{pred(X,Y):t(Y)},t(costant).\n"; 

        preproc.setCurrentRuleGroup(prog);
        preproc.removeComments();
        assert.deepEqual(preproc.getCurrentRuleGroup(), expected);
    });
    
});
describe('Check preprocessing phase relatively to the rules adornment works properly before grounding the program ', function()
{
    let preproc: AdornedDebugProgramBuilder = new AdornedDebugProgramBuilder() ;


    it('checks that the rules of an ASP program already processed and without comments are adorned correctly', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_specific_adornments"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let adorned:string = item["expected"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let computed = preproc.getAdornedProgram();
            assert.deepEqual(computed, adorned);
        });
    })
    it('checks that after the adornment of the rules of an ASP program, the debug map corresponds to the expected one', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_specific_adornments"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let atoms = item["map"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let obtainedMap: Map<string, DebugAtom> = preproc.getDebugAtomsMap();
            obtainedMap.forEach((value:DebugAtom, key:string)=>{
                let map:any = atoms[key];
                let atom:DebugAtom = new DebugAtom(map["predicateName"],map["predicateArity"],map["variables"],map["nonground_rule"]);
                assert.deepEqual(atom, value);
            });
        });
    })
    
});
describe('Check preprocessing phase relatively to the facts adornment works properly before grounding the program ', function()
{
    let preproc: AdornedDebugProgramBuilder = new AdornedDebugProgramBuilder() ;
    preproc.setDefaultPolicy(DefaultAdornerPolicy.FACTS_ONLY);
    it('checks that the facts of an ASP program already processed and without comments are adorned correctly', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_facts_adornment"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let adorned:string = item["expected"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let computed = preproc.getAdornedProgram();
            console.log(computed);
            assert.deepEqual(computed, adorned);
        });
    })
    it('checks that after adorning the facts of an ASP program, the debug map corresponds to the expected one', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_facts_adornment"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let atoms = item["map"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let obtainedMap: Map<string, DebugAtom> = preproc.getDebugAtomsMap();
            obtainedMap.forEach((value:DebugAtom, key:string)=>{
                let map:any = atoms[key];
                let atom:DebugAtom = new DebugAtom(map["predicateName"],map["predicateArity"],map["variables"],map["nonground_rule"]);
                assert.deepEqual(atom, value);
            });
        });
    })
});
    describe('Check preprocessing phase relatively to all adornments works properly before grounding the program ', function()
{
    let preproc: AdornedDebugProgramBuilder = new AdornedDebugProgramBuilder() ;
    preproc.setDefaultPolicy(DefaultAdornerPolicy.ALL);
    it('checks that all of an ASP program already processed and without comments is adorned correctly', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_adorn_all"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let adorned:string = item["expected"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let computed = preproc.getAdornedProgram();
            console.log(computed);
            assert.deepEqual(computed, adorned);
        });
    })
    it('checks that after adorning rules and facts of an ASP program, the debug map corresponds to the expected one', function(){
        let values =  JSON.parse(readFileSync("./test/unsat/dbg-ground/preproc.json").toString());
        values["test_adorn_all"].forEach(function(item: string[]) {
            let program:string = item["program"];
            let atoms = item["map"];
            preproc.reset();
            preproc.setCurrentRuleGroup(program);
            preproc.adornProgram();
            let obtainedMap: Map<string, DebugAtom> = preproc.getDebugAtomsMap();
            obtainedMap.forEach((value:DebugAtom, key:string)=>{
                let map:any = atoms[key];
                let atom:DebugAtom = new DebugAtom(map["predicateName"],map["predicateArity"],map["variables"],map["nonground_rule"]);
                assert.deepEqual(atom, value);
            });
        });
    })
});