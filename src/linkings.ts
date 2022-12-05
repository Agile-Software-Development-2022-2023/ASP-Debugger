import { Util } from "./utils";
import fs from 'fs';

export class InvalidLinkingsError extends Error{}

export class Linker {

    //Checks if the given object represents a valid linking object
    private static checkLinkingsValidity(linkings: Object): boolean {
        
        //Check if the object has the poolId and reverseLinkings property
        if(!("poolId" in linkings) || !("reverseLinkings" in linkings))
            return false;

        //Checks if the value for poolId is an integer
        const poolId = linkings["poolId"];
        if(!Number.isInteger(poolId))
            return false;

        //Checks if the value for reverseLinkings is an object
        const reverseLinkings: any = linkings["reverseLinkings"];
        if(!(reverseLinkings instanceof Object))
            return false;

        for(const key of Object.keys(linkings)) {

            //Every file key should have value "pool_n", with n an integer
            if(key != "poolId" && key != "reverseLinkings") {
                
                //Checks if the value is a string
                if(typeof linkings[key] !== "string")
                    return false;

                const regex = /^pool_([1-9]\d*)$/;
                const value: string = linkings[key];
                const matches: RegExpMatchArray | null = value.match(regex);

                if(!matches)
                    return false;

                const poolIdNum: number = parseInt(matches[1]);

                //Checks that the poolId for this file's pool is not higher than poolId
                if(poolIdNum > poolId)
                    return false;

                //Checks if the poolId for this file's pool is a key of reverseLinkings
                if(!(value in reverseLinkings))
                    return false;
            }
        }

        for(const key of Object.keys(reverseLinkings)) {

            //Checks that every property of reverseLinkings has an array as value
            if(!Array.isArray(reverseLinkings[key]))
                return false;
            const arr: any[] = reverseLinkings[key];

            //Checks that the array (the pool) contains at least 2 files
            if(arr.length < 2)
                return false; 

            for(const file of arr) {
                //Checks that every value in the array is a string
                if(typeof file !== "string") 
                    return false;
                //Checks that every value appears as a key in linkings, and that its value is the current key
                if(!(file in linkings))
                    return false;
                if(linkings[file] !== key)
                    return false;
            }
        }

        return true;
    }

    //Creates or updates a given linkings file by linking the given files (at least 2)
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static linkFiles(files_paths : string[], path_to_linkings: string): void {

        let linkings : Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings);
            }
        } catch (error) {
            throw error;
        }

        if(!this.checkLinkingsValidity(linkings))
            throw new InvalidLinkingsError();

        const reverseLinkings : Object = linkings['reverseLinkings'];

        //Scans through the given files and see if they belong to a pool already
        //The one that belongs to the biggest pool determines the base pool all other linked files will go in
        let maxPoolLength : number = 0;
        let biggestPool : string;
        let poolsToMerge : Object = {};
        let filesToAdd : string[] = [];

        files_paths.forEach(file => {

            if(file in linkings) {
                const filePool : string = linkings[file];
                poolsToMerge[filePool] = true;
    
                if(reverseLinkings[filePool].length > maxPoolLength) {
                    maxPoolLength = reverseLinkings[filePool].length;
                    biggestPool = filePool;
                }
            }
            else {
                filesToAdd.push(file);
            }
        });

        let pool : string;

        //If no file belongs to a pool and there are at least 2 files, create a new pool
        if(filesToAdd.length == files_paths.length && files_paths.length >= 2) {
            linkings['poolId']++;
            pool = 'pool_' + linkings['poolId'];
            reverseLinkings[pool] = [];
        }
        else {
            pool = biggestPool;
        }

        filesToAdd.forEach(file => {
            linkings[file] =  pool;
            reverseLinkings[pool].push(file);
        });

        //Moves every linked file from its pool to the biggest pool
        for (const pool of Object.keys(poolsToMerge)) {
            if(pool != biggestPool) {

                reverseLinkings[pool].forEach(file => {
                    linkings[file] = biggestPool;
                    reverseLinkings[biggestPool].push(file);
                });
                //Deletes the pool after moving every file in it
                delete reverseLinkings[pool];
            }
        }

        Util.writeJSON(linkings, path_to_linkings);
    }

    //Unlinks the given file from any file it is linked to
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static unlinkFile(file_path: string, path_to_linkings: string): void {

        let linkings: Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings)
            }
        } catch (error) {
            throw error;
        }

        if(!this.checkLinkingsValidity(linkings)) 
            throw new InvalidLinkingsError();

        //If the given file is not linked to any file, do nothing
        if(!(file_path in linkings))
            return

        let reverseLinkings: Object = linkings["reverseLinkings"];
        let linkedFiles: string[] = reverseLinkings[linkings[file_path]];

        //If the given file is linked to a single other file, remove the pool
        if(linkedFiles.length === 2) {
            delete reverseLinkings[linkings[file_path]];
            delete linkings[linkedFiles[0]];
            delete linkings[linkedFiles[1]];
        }
        //Otherwise just remove the given file from its pool
        else {
            linkedFiles.splice(linkedFiles.indexOf(file_path), 1);
            delete linkings[file_path];
        }

        Util.writeJSON(linkings, path_to_linkings);
    }

    //Unlinks all files inside the pool that contains the given file and removes that pool
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static disbandFilePool(file_path: string, path_to_linkings: string): void {
        let linkings: Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings)
            }
        } catch (error) {
            throw error;
        }

        if(!this.checkLinkingsValidity(linkings)) 
            throw new InvalidLinkingsError();

        //If the given file is not linked to any file, do nothing
        if(!(file_path in linkings))
            return

        let reverseLinkings: Object = linkings["reverseLinkings"];
        let pool: string = linkings[file_path];
        let linkedFiles: string[] = reverseLinkings[pool];

        //Unlink every file and delete the pool
        linkedFiles.forEach(file => {
            delete linkings[file];
        });
        delete reverseLinkings[pool];

        Util.writeJSON(linkings, path_to_linkings);
    }

    //Returns all pools inside the linkings file
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static getAllPools(path_to_linkings: string): Object {
        let linkings: Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings)
            }
        } catch (error) {
            throw error;
        }

        if(!this.checkLinkingsValidity(linkings)) 
            throw new InvalidLinkingsError();
            
        return linkings["reverseLinkings"];
    }

    //Returns the array of files linked to the given file
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    //Throws an error if the linkings file contains an invalid linkings object
    static getLinkedFiles(file_path: string, path_to_linkings: string): string[] {
        let linkings: Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings)
            }
        } catch (error) {
            throw error;
        }

        if(!this.checkLinkingsValidity(linkings)) 
            throw new InvalidLinkingsError();

        //If the given file is not linked to any file, do nothing
        if(!(file_path in linkings))
            return [file_path];

        return linkings["reverseLinkings"][linkings[file_path]];
    }
}