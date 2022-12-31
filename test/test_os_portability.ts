import { Test } from "mocha";
import { platform } from "os";

export class TestOsPortability{
    private static instance : TestOsPortability | null = null;
    private static LINUX_TO_WIN_ENDL : RegExp = new RegExp('\n', 'gi');
    private static WIN_TO_LINUX_ENDL : RegExp = new RegExp('\r\n', 'gi');
    private static LINUX_TO_WIN_FILE_SEP : RegExp = new RegExp('/', 'gi');
    private static WIN_TO_LINUX_FILE_SEP : RegExp = new RegExp('\\a', 'gi');
    private os_name : string;

    private constructor(){
        if(process.platform == 'win32'){
            this.os_name = 'win32';
        }
        else if(process.platform == 'linux'){
            this.os_name = 'linux';
        }
    }
    
    public static get_instance(): TestOsPortability{
        if(this.instance == null){
            this.instance = new TestOsPortability();
        }
        return this.instance;
    }

    public convert_endl(to_convert : string) : string{
        if(this.os_name == 'win32'){
            to_convert = to_convert.replace(TestOsPortability.LINUX_TO_WIN_ENDL, '\r\n');
        }   
        else if (this.os_name == 'linux'){
            to_convert = to_convert.replace(TestOsPortability.WIN_TO_LINUX_ENDL, '\n');
        }     
        return to_convert;
    }

    public convert_file_sep(to_convert : string) : string{
        if(this.os_name == 'win32'){
            to_convert = to_convert.replace(TestOsPortability.LINUX_TO_WIN_FILE_SEP, '\\');
        }   
        else if (this.os_name == 'linux'){
            to_convert = to_convert.replace(TestOsPortability.WIN_TO_LINUX_FILE_SEP, '/');
        }     
        return to_convert;
    }
    public get_endl() : string{
        if(this.os_name == 'win32'){
           return '\r\n';
        }   
        return '\n';
    }

}