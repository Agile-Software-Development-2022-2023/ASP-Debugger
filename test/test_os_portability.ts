import assert from "assert";
import { OsPortability } from "../src/os_portability";


describe('os-portability-win', function(){
    let current_os : string;

    [{new_line:"first test of \r\n new line \n", new_line_converted: "first test of \r\n new line \r\n"},
     {new_line:"line1 \n line2 \n line 3\n", new_line_converted: "line1 \r\n line2 \r\n line 3\r\n"},
     {new_line:"line1 \r\n line2 \r\n line 3\r\n", new_line_converted: "line1 \r\n line2 \r\n line 3\r\n"}
    ].
    forEach(function(new_line_conversion){
        it('should test if new lines are substituted with new lines for windows', function(){
            new_line_conversion.new_line = OsPortabilitySpy.get_instance().convert_endl(new_line_conversion.new_line);
            //console.log("Platform ", process.platform);
            assert.deepEqual(new_line_conversion.new_line,new_line_conversion.new_line_converted);
        });
    });

    [{path:"home/mate/test.txt", converted_path:"home\\mate\\test.txt"},
     {path:"usr/bin\\python3", converted_path:"usr\\bin\\python3"},
     {path:"usr\\bin\\perl", converted_path:"usr\\bin\\perl"},
    ].forEach(function(path_conversion){
        it('should test if file paths for are substituted with file paths for windows', function(){
            path_conversion.path = OsPortabilitySpy.get_instance().convert_file_sep(path_conversion.path);
            //console.log("Platform ", process.platform);
            assert.deepEqual(path_conversion.path,path_conversion.converted_path);
        });
    });
    
    before(function(){
        current_os = process.platform;
        //Object.defineProperty(process, 'platform', {value : 'win32'});
        OsPortabilitySpy.get_instance();
        OsPortabilitySpy.set_platform('win32');
    });

    after(function(){
        //Object.defineProperty(process, 'platform', {value : current_os});
        OsPortabilitySpy.set_platform(current_os);
    });

})

describe('os-portability-linux', function(){
    let current_os : string;
    [{new_line:"first test of \r\n new line \n", new_line_converted: "first test of \n new line \n"},
     {new_line:"line1 \r\n line2 \r\n line 3\r\n", new_line_converted: "line1 \n line2 \n line 3\n"},
     {new_line:"line1 \n line2 \n line 3\n", new_line_converted: "line1 \n line2 \n line 3\n"}
    ].
    forEach(function(new_line_conversion){
        it('should test if new lines are substituted with new lines for linux', function(){
            new_line_conversion.new_line = OsPortability.get_instance().convert_endl(new_line_conversion.new_line);
            assert.deepEqual(new_line_conversion.new_line,new_line_conversion.new_line_converted);
        });
    });

    [{path:"home\\mate\\test.txt", converted_path:"home/mate/test.txt"},
    {path:"usr\\bin/python3", converted_path:"usr/bin/python3"},
    {path:"usr/bin/perl", converted_path:"usr/bin/perl"},
   ].forEach(function(path_conversion){
        it('should test if file paths are substituted with file paths for linux', function(){
            path_conversion.path = OsPortabilitySpy.get_instance().convert_file_sep(path_conversion.path);
            //console.log("Platform ", process.platform);
            assert.deepEqual(path_conversion.path,path_conversion.converted_path);
        });
    });

    before(function(){
        current_os = process.platform;
        //Object.defineProperty(process, 'platform', {value : 'linux'});
        OsPortabilitySpy.get_instance();
        OsPortabilitySpy.set_platform('linux');
    });

    after(function(){
        //Object.defineProperty(process, 'platform', {value : current_os});
        OsPortabilitySpy.set_platform(current_os);
    });

})

describe('os-portability-mac', function(){
    let current_os : string;
    
    [{new_line:"first test of \r\n new line \n", new_line_converted: "first test of \n new line \n"},
     {new_line:"line1 \r\n line2 \r\n line 3\r\n", new_line_converted: "line1 \n line2 \n line 3\n"},
     {new_line:"line1 \n line2 \n line 3\n", new_line_converted: "line1 \n line2 \n line 3\n"}
    ].
    forEach(function(new_line_conversion){
        it('should test if new lines are substituted with new lines for mac', function(){
            new_line_conversion.new_line = OsPortability.get_instance().convert_endl(new_line_conversion.new_line);
            assert.deepEqual(new_line_conversion.new_line,new_line_conversion.new_line_converted);
        });
    });

    [{path:"home\\mate\\test.txt", converted_path:"home/mate/test.txt"},
    {path:"usr\\bin/python3", converted_path:"usr/bin/python3"},
    {path:"usr/bin/perl", converted_path:"usr/bin/perl"},
   ].forEach(function(path_conversion){
        it('should test if file paths are substituted with file paths for mac', function(){
            path_conversion.path = OsPortabilitySpy.get_instance().convert_file_sep(path_conversion.path);
            //console.log("Platform ", process.platform);
            assert.deepEqual(path_conversion.path,path_conversion.converted_path);
        });
    });

    before(function(){
        current_os = process.platform;
        //Object.defineProperty(process, 'platform', {value : 'linux'});
        OsPortabilitySpy.get_instance();
        OsPortabilitySpy.set_platform('darwin');
    });

    after(function(){
        //Object.defineProperty(process, 'platform', {value : current_os});
        OsPortabilitySpy.set_platform(current_os);
    });

})

class OsPortabilitySpy extends OsPortability{
    public static set_platform(my_platform: string): void {
        super.set_platform(my_platform);
    }
}