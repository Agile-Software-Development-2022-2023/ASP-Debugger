import assert from 'assert';
import Linker from '../../src/linkings';
import Util from '../../src/utils';
import fs from 'fs';

const linkFiles_test_suite : Object[] = [
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
]

describe('LINKINGS', function() {

    linkFiles_test_suite.forEach( (test) => {
        it(test["testing"], function() {
            const test_path = "test/.linkings.json";

            try {
                if(test["initial"]) {
                    Util.writeJSON(test["initial"], test_path);
                }
        
                Linker.linkFiles(test["files_to_link"], test_path);
                const output = Util.readJSON(test_path);
                assert.deepEqual(output, test["expected"])
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });
})