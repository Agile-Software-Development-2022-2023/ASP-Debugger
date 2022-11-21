"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("fs"));
class Linker {
    //Creates or updates a given linkings file by linking the given files (at least 2)
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    static linkFiles(files_paths, path_to_linkings) {
        let linkings = { "poolId": 0, "reverseLinkings": {} };
        try {
            if (fs_1.default.existsSync(path_to_linkings)) {
                linkings = utils_1.Util.readJSON(path_to_linkings);
            }
        }
        catch (error) {
            throw error;
        }
        const reverseLinkings = linkings['reverseLinkings'];
        //Scans through the given files and see if they belong to a pool already
        //The one that belongs to the biggest pool determines the base pool all other linked files will go in
        let maxPoolLength = 0;
        let biggestPool;
        let poolsToMerge = {};
        let filesToAdd = [];
        files_paths.forEach(file => {
            if (file in linkings) {
                const filePool = linkings[file];
                poolsToMerge[filePool] = true;
                if (reverseLinkings[filePool].length > maxPoolLength) {
                    maxPoolLength = reverseLinkings[filePool].length;
                    biggestPool = filePool;
                }
            }
            else {
                filesToAdd.push(file);
            }
        });
        let pool;
        //If no file belongs to a pool and there are at least 2 files, create a new pool
        if (filesToAdd.length == files_paths.length && files_paths.length >= 2) {
            linkings['poolId']++;
            pool = 'pool_' + linkings['poolId'];
            reverseLinkings[pool] = [];
        }
        else {
            pool = biggestPool;
        }
        filesToAdd.forEach(file => {
            linkings[file] = pool;
            reverseLinkings[pool].push(file);
        });
        //Moves every linked file from its pool to the biggest pool
        for (const pool of Object.keys(poolsToMerge)) {
            if (pool != biggestPool) {
                reverseLinkings[pool].forEach(file => {
                    linkings[file] = biggestPool;
                    reverseLinkings[biggestPool].push(file);
                });
                //Deletes the pool after moving every file in it
                delete reverseLinkings[pool];
            }
        }
        utils_1.Util.writeJSON(linkings, path_to_linkings);
    }
}
exports.Linker = Linker;
//# sourceMappingURL=linkings.js.map