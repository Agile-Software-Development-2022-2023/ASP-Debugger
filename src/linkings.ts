import { Util } from "./utils";
import fs from 'fs';

export class Linker {

    //Creates or updates a given linkings file by linking the given files (at least 2)
    //Throws an error if there was a problem reading, writing or checking the existance of the given linkings file
    static linkFiles(files_paths : string[], path_to_linkings: string): void {

        let linkings : Object = {"poolId":0,"reverseLinkings": {}};
        try {
            if(fs.existsSync(path_to_linkings)) {
                linkings = Util.readJSON(path_to_linkings);
            }
        } catch (error) {
            throw error;
        }

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
}