import assert from "assert";
import fs from "fs";
import Util from "../../src/utils";

describe('UTILS', function() {
    
    //Test One: test reading a json file
    it('should test if the json file is read correctly', function() {
        const expected = {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2"]
            }
        };

        const test_linkings_file : string = "test/test_read.json";
        fs.writeFileSync(test_linkings_file, JSON.stringify(expected), 'utf-8');

        const output = Util.readJSON(test_linkings_file);

        fs.unlinkSync(test_linkings_file);

        assert.deepEqual(output, expected);
    });

    it("should test if an error is thrown when the given path doesn't exist", function() {
        assert.throws(() => { Util.readJSON('fakefilepath') }, Error);
    });

    it('should test if an error is thrown when the json file to read is not structured correctly', function() {
        const test_file_path = "test/malformed_json.json";

        fs.writeFileSync(test_file_path, "This is not an acceptable json", 'utf-8');

        assert.throws(() => { Util.readJSON(test_file_path) }, Error);

        fs.unlinkSync(test_file_path);
    });

    it('should test if an object is correctly written to a json file', function() {
        const expected = {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2"]
            }
        };

        const test_path = "test/test_write.json";

        Util.writeJSON(expected, test_path);

        const output = Util.readJSON(test_path);

        assert.deepEqual(output, expected);

        fs.unlinkSync(test_path);
    });
})