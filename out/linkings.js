"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Linker = exports.InvalidLinkingsError = void 0;
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("fs"));
class InvalidLinkingsError extends Error {
}
exports.InvalidLinkingsError = InvalidLinkingsError;
class Linker {
    //Checks if the given object represents a valid linking object
    static checkLinkingsValidity(linkings) {
        //Check if the object has the poolId and reverseLinkings property
        if (!("poolId" in linkings) || !("reverseLinkings" in linkings))
            return false;
        //Checks if the value for poolId is an integer
        const poolId = linkings["poolId"];
        if (!Number.isInteger(poolId))
            return false;
        //Checks if the value for reverseLinkings is an object
        const reverseLinkings = linkings["reverseLinkings"];
        if (!(reverseLinkings instanceof Object))
            return false;
        for (const key of Object.keys(linkings)) {
            //Every file key should have value "pool_n", with n an integer
            if (key != "poolId" && key != "reverseLinkings") {
                //Checks if the value is a string
                if (typeof linkings[key] !== "string")
                    return false;
                const regex = /^pool_([1-9]\d*)$/;
                const value = linkings[key];
                const matches = value.match(regex);
                if (!matches)
                    return false;
                const poolIdNum = parseInt(matches[1]);
                //Checks that the poolId for this file's pool is not higher than poolId
                if (poolIdNum > poolId)
                    return false;
                //Checks if the poolId for this file's pool is a key of reverseLinkings
                if (!(value in reverseLinkings))
                    return false;
            }
        }
        for (const key of Object.keys(reverseLinkings)) {
            //Checks that every property of reverseLinkings has an array as value
            if (!Array.isArray(reverseLinkings[key]))
                return false;
            const arr = reverseLinkings[key];
            //Checks that the array (the pool) contains at least 2 files
            if (arr.length < 2)
                return false;
            for (const file of arr) {
                //Checks that every value in the array is a string
                if (typeof file !== "string")
                    return false;
                //Checks that every value appears as a key in linkings, and that its value is the current key
                if (!(file in linkings))
                    return false;
                if (linkings[file] !== key)
                    return false;
            }
        }
        return true;
    }
    //Creates or updates a given linkings file by linking the given files (at least 2)
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
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
        if (!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();
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
    //Unlinks the given file from any file it is linked to
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static unlinkFile(file_path, path_to_linkings) {
        let linkings = { "poolId": 0, "reverseLinkings": {} };
        try {
            if (fs_1.default.existsSync(path_to_linkings)) {
                linkings = utils_1.Util.readJSON(path_to_linkings);
            }
        }
        catch (error) {
            throw error;
        }
        if (!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();
        //If the given file is not linked to any file, do nothing
        if (!(file_path in linkings))
            return;
        let reverseLinkings = linkings["reverseLinkings"];
        let linkedFiles = reverseLinkings[linkings[file_path]];
        //If the given file is linked to a single other file, remove the pool
        if (linkedFiles.length === 2) {
            delete reverseLinkings[linkings[file_path]];
            delete linkings[linkedFiles[0]];
            delete linkings[linkedFiles[1]];
        }
        //Otherwise just remove the given file from its pool
        else {
            linkedFiles.splice(linkedFiles.indexOf(file_path), 1);
            delete linkings[file_path];
        }
        utils_1.Util.writeJSON(linkings, path_to_linkings);
    }
    //Unlinks all files inside the pool that contains the given file and removes that pool
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static disbandFilePool(file_path, path_to_linkings) {
        let linkings = { "poolId": 0, "reverseLinkings": {} };
        try {
            if (fs_1.default.existsSync(path_to_linkings)) {
                linkings = utils_1.Util.readJSON(path_to_linkings);
            }
        }
        catch (error) {
            throw error;
        }
        if (!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();
        //If the given file is not linked to any file, do nothing
        if (!(file_path in linkings))
            return;
        let reverseLinkings = linkings["reverseLinkings"];
        let pool = linkings[file_path];
        let linkedFiles = reverseLinkings[pool];
        //Unlink every file and delete the pool
        linkedFiles.forEach(file => {
            delete linkings[file];
        });
        delete reverseLinkings[pool];
        utils_1.Util.writeJSON(linkings, path_to_linkings);
    }
    //Returns all pools inside the linkings file
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static getAllPools(path_to_linkings) {
        let linkings = { "poolId": 0, "reverseLinkings": {} };
        try {
            if (fs_1.default.existsSync(path_to_linkings)) {
                linkings = utils_1.Util.readJSON(path_to_linkings);
            }
        }
        catch (error) {
            throw error;
        }
        if (!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();
        return linkings["reverseLinkings"];
    }
    //Returns the array of files linked to the given file
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static getLinkedFiles(file_path, path_to_linkings) {
        let linkings = { "poolId": 0, "reverseLinkings": {} };
        try {
            if (fs_1.default.existsSync(path_to_linkings)) {
                linkings = utils_1.Util.readJSON(path_to_linkings);
            }
        }
        catch (error) {
            throw error;
        }
        if (!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();
        //If the given file is not linked to any file, do nothing
        if (!(file_path in linkings))
            return [file_path];
        return linkings["reverseLinkings"][linkings[file_path]];
    }
}
exports.Linker = Linker;
//# sourceMappingURL=linkings.js.map