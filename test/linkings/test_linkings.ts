import assert from 'assert';
import { InvalidLinkingsError, Linker } from '../../src/linkings';
import { Util } from '../../src/utils';
import fs from 'fs';
import path from 'path';
import { OsPortability } from '../../src/os_portability';

describe('Linkings', function() {

    const test_path = "test/linkings/linkings.json";

    const linkFiles_test_suite: Object[] = Util.readJSON("test/linkings/linkFiles_test_suite.json");
    linkFiles_test_suite.forEach(test => {
        it(test["testing"], function() {
            try {
                if(test["initial"]) {
                    Util.writeJSON(test["initial"], test_path);
                }
        
                Linker.linkFiles(test["files_to_link"], test_path);
                const output = Util.readJSON(test_path);
                assert.deepEqual(output, test["expected"]);
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });

    const unlinkFile_test_suite : Object[] = Util.readJSON("test/linkings/unlinkFile_test_suite.json");
    unlinkFile_test_suite.forEach(test => {
        it(test["testing"], function() {
            try {
                Util.writeJSON(test["initial"], test_path);
                Linker.unlinkFile(test["file_to_unlink"], test_path);
                const output = Util.readJSON(test_path);
                assert.deepEqual(output, test["expected"]);
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });

    const invalid_linkings_test_suite: Object[] = Util.readJSON("test/linkings/invalid_linkings_test_suite.json");
    it("should test that an error is thrown when the linkings file does not contain a valid linkings object", function() {
        invalid_linkings_test_suite.forEach(test => {
            try {
                Util.writeJSON(test, test_path);
                assert.throws( () => {Linker.linkFiles([], test_path)}, InvalidLinkingsError);
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });

    const disbandFilePool_test_suite: Object[] = Util.readJSON("test/linkings/disbandFilePool_test_suite.json");
    disbandFilePool_test_suite.forEach(test => {
        it(test["testing"], function() {
            try {
                Util.writeJSON(test["initial"], test_path);
                Linker.disbandFilePool(test["file_in_pool_to_disband"], test_path);
                const output = Util.readJSON(test_path);
                assert.deepEqual(output, test["expected"]);
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });

    it("should test if all the pools are returned", function() {
        try {
            const initial = {
                "poolId": 3,
                "file1": "pool_1",
                "file2": "pool_1",
                "file3": "pool_2",
                "file4": "pool_2",
                "file5": "pool_2",
                "file6": "pool_3",
                "file7": "pool_3",
                "file8": "pool_3",
                "file9": "pool_3",
                "reverseLinkings": {
                    "pool_1": ["file1", "file2"],
                    "pool_2": ["file3", "file4", "file5"],
                    "pool_3": ["file6", "file7", "file8", "file9"]
                }
            }
            Util.writeJSON(initial, test_path);
            const output: Object = Linker.getAllPools(test_path);
            assert.deepEqual(output, initial["reverseLinkings"]);
        } finally {
            fs.unlinkSync(test_path);
        }
    });
    
    const getLinkedFiles_test_suite: Object[] = Util.readJSON("test/linkings/getLinkedFiles_test_suite.json");
    getLinkedFiles_test_suite.forEach(test => {
        it(test["testing"], function(){
            try {
                Util.writeJSON(test["initial"], test_path);
                const output: string[] = Linker.getLinkedFiles(test["file_in_pool_to_return"], test_path);
                assert.deepEqual(output, test["expected"]);
            } finally {
                fs.unlinkSync(test_path);
            }
        });
    });

    const purgeAndGetMissingFiles_test_suite: Object[] = Util.readJSON("test/linkings/purgeAndGetMissingFiles_test_suite.json");
    it("should test if the missing files are correctly identified and removed", function() {

        let presentFilesRelativePaths: string[] = [];

        purgeAndGetMissingFiles_test_suite.forEach(test => {
            try {
                const initiallyLinkedFilesRelativePaths: string[] = test["linkedFilesRelativePaths"];

                //Get the absolute paths from the relative paths and link the files
                //We need real paths to check the presence of the files in the filesystem
                const initiallyLinkedFilesAbsolutePaths: string[] = initiallyLinkedFilesRelativePaths.map(file => path.resolve(file));

                //Create only the non-missing files
                presentFilesRelativePaths = test["presentFilesRelativePaths"];
                presentFilesRelativePaths.forEach(file => {
                    fs.writeFileSync(file, "");
                });

                Linker.linkFiles(initiallyLinkedFilesAbsolutePaths, test_path);

                const missingFilesAbsolutePaths: string[] = Linker.purgeAndGetMissingFiles(test_path);
                const missingFilesRelativePaths: string[] = missingFilesAbsolutePaths.map(file => path.relative(".", file));
                assert.deepEqual(missingFilesRelativePaths.toString(), OsPortability.get_instance().convert_file_sep(test["expectedMissingRelativePaths"].toString()));                
            } finally {
                presentFilesRelativePaths.forEach(file => {
                    fs.unlinkSync(file);
                });
                fs.unlinkSync(test_path);
            }
        });
    })
})