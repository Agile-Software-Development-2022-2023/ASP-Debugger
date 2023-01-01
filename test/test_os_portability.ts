import assert from "assert";
import { OsPortability } from "../src/os_portability";


describe('os-portability-win', function(){
    let current_os : string;

    it('should test if new lines for linux are substituted with new lines for windows', function(){
        let a : string  = "hello\nciao";
        let b : string = "hello\r\nciao";
        a = OsPortabilitySpy.get_instance().convert_endl(a);
        //console.log("Platform ", process.platform);
        assert.deepEqual(a,b);
    });

    it('should test if file paths for linux are substituted with file paths for windows', function(){
        let a : string  = "home/pippo/test.txt";
        let b : string = "home\\pippo\\test.txt";
        a = OsPortabilitySpy.get_instance().convert_file_sep(a);
        //console.log("Platform ", process.platform);
        assert.deepEqual(a,b);
    });

    beforeEach(function(){
        current_os = process.platform;
        //Object.defineProperty(process, 'platform', {value : 'win32'});
        OsPortabilitySpy.get_instance();
        OsPortabilitySpy.set_platform('win32');
    });

    this.afterEach(function(){
        //Object.defineProperty(process, 'platform', {value : current_os});
        OsPortabilitySpy.set_platform(current_os);
    });

})

describe('os-portability-linux', function(){
    let current_os : string;

    it('should test if new lines are substituted with new lines for linux', function(){
        let a : string  = "hello\r\nciao";
        let b : string = "hello\nciao";
        a = OsPortability.get_instance().convert_endl(a);
        assert.deepEqual(a,b);
    });

    it('should test if file paths for windows are substituted with file paths for linux', function(){
        let a : string  = "home\\pippo\\test.txt\\";
        let b : string = "home/pippo/test.txt/";
        a = OsPortabilitySpy.get_instance().convert_file_sep(a);
        //console.log("Platform ", process.platform);
        assert.deepEqual(a,b);
    });

    beforeEach(function(){
        current_os = process.platform;
        //Object.defineProperty(process, 'platform', {value : 'linux'});
        OsPortabilitySpy.get_instance();
        OsPortabilitySpy.set_platform('linux');
    });

    afterEach(function(){
        //Object.defineProperty(process, 'platform', {value : current_os});
        OsPortabilitySpy.set_platform(current_os);
    });

})

class OsPortabilitySpy extends OsPortability{
    public static set_platform(my_platform: string): void {
        super.set_platform(my_platform);
    }
}