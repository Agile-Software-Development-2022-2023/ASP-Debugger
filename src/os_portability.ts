import { Test } from "mocha";
import { platform } from "os";

export class OsPortability{
    private static instance : OsPortability | null = null;
    private static TO_WIN_ENDL : RegExp = new RegExp('(\n)|(\r\n)', 'gi');
    private static TO_LINUX_MAC_ENDL : RegExp = new RegExp('\r\n', 'gi');
    private static TO_WIN_FILE_SEP : RegExp = new RegExp('/', 'gi');
    //private static WIN_TO_LINUX_FILE_SEP : RegExp = new RegExp('(\\\)(.*?)', 'gi');
    private static os_name : string;

    protected constructor(){
        if(process.platform == 'win32'){
            OsPortability.os_name = 'win32';
        }
        else if(process.platform == 'linux'){
            OsPortability.os_name = 'linux';
        }
        else if(process.platform == 'darwin'){
            OsPortability.os_name = 'darwin';
        }
    }
    
    public static get_instance(): OsPortability{
        if(this.instance == null){
            this.instance = new OsPortability();
        }
        return this.instance;
    }

    public convert_endl(to_convert : string) : string{
        if(OsPortability.os_name == 'win32'){
            to_convert = to_convert.replace(OsPortability.TO_WIN_ENDL, '\r\n');
        }   
        else if (OsPortability.os_name == 'linux' || OsPortability.os_name == 'darwin'){
            to_convert = to_convert.replace(OsPortability.TO_LINUX_MAC_ENDL, '\n');
        }
        return to_convert;
    }

    public convert_file_sep(to_convert : string) : string{
        if(OsPortability.os_name == 'win32'){
            to_convert = to_convert.replace(OsPortability.TO_WIN_FILE_SEP, '\\');
        }   
        else if (OsPortability.os_name == 'linux' || OsPortability.os_name == 'darwin'){
            for(let i: number = 0; i < to_convert.length; ++i){
                if(to_convert.at(i) == '\\'){
                    
                    to_convert = to_convert.substring(0, i) + '/'+ to_convert.substring(i+1, to_convert.length);
                }
            }
        }     
        return to_convert;
    }
    public get_endl() : string{
        if(OsPortability.os_name == 'win32'){
           return '\r\n';
        }   
        return '\n';
    }
    protected static set_platform(my_platform : string){
        OsPortability.os_name = my_platform;
    }
}