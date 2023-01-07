"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsPortability = void 0;
class OsPortability {
    constructor() {
        if (process.platform == 'win32') {
            OsPortability.os_name = 'win32';
        }
        else if (process.platform == 'linux') {
            OsPortability.os_name = 'linux';
        }
        else if (process.platform == 'darwin') {
            OsPortability.os_name = 'darwin';
        }
    }
    static get_instance() {
        if (this.instance == null) {
            this.instance = new OsPortability();
        }
        return this.instance;
    }
    convert_endl(to_convert) {
        if (OsPortability.os_name == 'win32') {
            to_convert = to_convert.replace(OsPortability.TO_WIN_ENDL, '\r\n');
        }
        else if (OsPortability.os_name == 'linux' || OsPortability.os_name == 'darwin') {
            to_convert = to_convert.replace(OsPortability.TO_LINUX_MAC_ENDL, '\n');
        }
        return to_convert;
    }
    convert_file_sep(to_convert) {
        if (OsPortability.os_name == 'win32') {
            to_convert = to_convert.replace(OsPortability.TO_WIN_FILE_SEP, '\\');
        }
        else if (OsPortability.os_name == 'linux' || OsPortability.os_name == 'darwin') {
            for (let i = 0; i < to_convert.length; ++i) {
                if (to_convert.at(i) == '\\') {
                    to_convert = to_convert.substring(0, i) + '/' + to_convert.substring(i + 1, to_convert.length);
                }
            }
        }
        return to_convert;
    }
    get_endl() {
        if (OsPortability.os_name == 'win32') {
            return '\r\n';
        }
        return '\n';
    }
    static set_platform(my_platform) {
        OsPortability.os_name = my_platform;
    }
}
exports.OsPortability = OsPortability;
OsPortability.instance = null;
OsPortability.TO_WIN_ENDL = new RegExp('(\n)|(\r\n)', 'gi');
OsPortability.TO_LINUX_MAC_ENDL = new RegExp('\r\n', 'gi');
OsPortability.TO_WIN_FILE_SEP = new RegExp('/', 'gi');
//# sourceMappingURL=os_portability.js.map