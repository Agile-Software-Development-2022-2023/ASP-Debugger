"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const linkings_1 = __importDefault(require("../../src/linkings"));
const utils_1 = __importDefault(require("../../src/utils"));
const fs_1 = __importDefault(require("fs"));
const linkFiles_test_suite = [
    {
        "testing": "should test if the linkings file is created properly",
        "files_to_link": ["file1", "file2", "file3"],
        "expected": {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"]
            }
        }
    },
    {
        "testing": "should test if the linkings file is updated properly",
        "initial": {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"]
            }
        },
        "files_to_link": ["file4", "file5"],
        "expected": {
            "poolId": 2,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "file4": "pool_2",
            "file5": "pool_2",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"],
                "pool_2": ["file4", "file5"]
            }
        }
    },
    {
        "testing": "should test if files are properly added to a pool",
        "initial": {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"]
            }
        },
        "files_to_link": ["file1", "file4", "file5"],
        "expected": {
            "poolId": 1,
            "file2": "pool_1",
            "file3": "pool_1",
            "file4": "pool_1",
            "file5": "pool_1",
            "file1": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3", "file4", "file5"]
            }
        }
    },
    {
        "testing": "should test if pools are properly merged",
        "initial": {
            "poolId": 2,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "file4": "pool_2",
            "file5": "pool_2",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"],
                "pool_2": ["file4", "file5"]
            }
        },
        "files_to_link": ["file1", "file5"],
        "expected": {
            "poolId": 2,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "file4": "pool_1",
            "file5": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3", "file4", "file5"]
            }
        }
    },
    {
        "testing": "should test that the linkings file is unchanged when less than 2 files are linked",
        "initial": {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"]
            }
        },
        "files_to_link": [],
        "expected": {
            "poolId": 1,
            "file1": "pool_1",
            "file2": "pool_1",
            "file3": "pool_1",
            "reverseLinkings": {
                "pool_1": ["file1", "file2", "file3"]
            }
        }
    }
];
describe('LINKINGS', function () {
    linkFiles_test_suite.forEach((test) => {
        it(test["testing"], function () {
            const test_path = "test/.linkings.json";
            try {
                if (test["initial"]) {
                    utils_1.default.writeJSON(test["initial"], test_path);
                }
                linkings_1.default.linkFiles(test["files_to_link"], test_path);
                const output = utils_1.default.readJSON(test_path);
                assert_1.default.deepEqual(output, test["expected"]);
            }
            finally {
                fs_1.default.unlinkSync(test_path);
            }
        });
    });
});
//# sourceMappingURL=test_linkings.js.map