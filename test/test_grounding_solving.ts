import assert from 'assert';
import { Grounder_Solver } from '../src/grounding_solving';
import fs from 'fs';

describe("Grounding and solving", function() {

    //This test only checks whether there are errors while calling the asp system
    it("should test that the asp system is executed correctly", function() {

        const test_path = "test/test_program.lp";

        try {
            fs.writeFileSync(test_path, "", {encoding: 'utf-8'});
            const grounder_solver = new Grounder_Solver();
            assert.deepEqual("DLV 2.1.1\n\n{}\n", grounder_solver.getFirstAnswerSet([test_path])[0])
            assert.deepEqual("", grounder_solver.getFirstAnswerSet([test_path])[1]);
        } finally {
            fs.unlinkSync(test_path);
        }
    });
});