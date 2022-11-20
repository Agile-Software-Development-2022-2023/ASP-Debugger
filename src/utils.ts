import fs from 'fs';

export class Util {

    //Reads a json given a specified path
    //Returns the parsed object or throws an error if there was a problem
    //reading or parsing the file
    static readJSON(path_to_json : string): Object {

        let jsonString : string;
        let jsonObject : Object;
    
        try {
            jsonString = fs.readFileSync(path_to_json, 'utf-8');
            jsonObject = JSON.parse(jsonString);
        } catch (error) {
            throw error;
        }

        return jsonObject;
    }

    //Converts the given object to a json and writes it to the given path
    //Throws an error if there was a problem converting the object or writing the file
    static writeJSON(object : Object, path_to_json : string): void {
        try {
            fs.writeFileSync(path_to_json, JSON.stringify(object), 'utf-8');
        } catch (error) {
            throw error;
        }
    }
}