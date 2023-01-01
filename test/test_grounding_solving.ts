import assert from 'assert';
import { Grounder_Solver } from '../src/grounding_solving';
import fs from 'fs';
import { OsPortability } from '../src/os_portability';

describe("Grounding and solving", function() {

    //This test only checks whether there are errors while calling the asp system
    it("should test that the asp system is executed correctly", function() {

        const test_path = "test/test_program.lp";

        try {
            fs.writeFileSync(test_path, "", {encoding: 'utf-8'});
            const grounder_solver = new Grounder_Solver();
            let expected_output :string = "DLV 2.1.1\n\n{}\n";
            expected_output = OsPortability.get_instance().convert_endl(expected_output);
            assert.deepEqual(expected_output, grounder_solver.getFirstAnswerSet([test_path])[0]);
            assert.deepEqual("", grounder_solver.getFirstAnswerSet([test_path])[1]);
        } finally {
            fs.unlinkSync(test_path);
        }
    });
});