"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Util {
    //Reads a json given a specified path
    //Returns the parsed object or throws an error if there was a problem
    //reading or parsing the file
    static readJSON(path_to_json) {
        let jsonString;
        let jsonObject;
        try {
            jsonString = fs_1.default.readFileSync(path_to_json, 'utf-8');
            jsonObject = JSON.parse(jsonString);
        }
        catch (error) {
            throw error;
        }
        return jsonObject;
    }
    //Converts the given object to a json and writes it to the given path
    //Throws an error if there was a problem converting the object or writing the file
    static writeJSON(object, path_to_json) {
        try {
            fs_1.default.writeFileSync(path_to_json, JSON.stringify(object), 'utf-8');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Util;
//# sourceMappingURL=utils.js.map