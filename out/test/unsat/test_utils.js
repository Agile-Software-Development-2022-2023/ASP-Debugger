"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../../src/utils");
describe('UTILS', function () {
    //Test One: test reading a json file
    it('should test if the json file is read correctly', function () {
        const expected = {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2"]
            }
        };
        const test_linkings_file = "test/test_read.json";
        fs_1.default.writeFileSync(test_linkings_file, JSON.stringify(expected), 'utf-8');
        const output = utils_1.Util.readJSON(test_linkings_file);
        fs_1.default.unlinkSync(test_linkings_file);
        assert_1.default.deepEqual(output, expected);
    });
    it("should test if an error is thrown when the given path doesn't exist", function () {
        assert_1.default.throws(() => { utils_1.Util.readJSON('fakefilepath'); }, Error);
    });
    it('should test if an error is thrown when the json file to read is not structured correctly', function () {
        const test_file_path = "test/malformed_json.json";
        fs_1.default.writeFileSync(test_file_path, "This is not an acceptable json", 'utf-8');
        assert_1.default.throws(() => { utils_1.Util.readJSON(test_file_path); }, Error);
        fs_1.default.unlinkSync(test_file_path);
    });
    it('should test if an object is correctly written to a json file', function () {
        const expected = {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2"]
            }
        };
        const test_path = "test/test_write.json";
        utils_1.Util.writeJSON(expected, test_path);
        const output = utils_1.Util.readJSON(test_path);
        assert_1.default.deepEqual(output, expected);
        fs_1.default.unlinkSync(test_path);
    });
});
//# sourceMappingURL=test_utils.js.map