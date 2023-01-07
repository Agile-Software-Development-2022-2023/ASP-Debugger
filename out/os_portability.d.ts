export declare class OsPortability {
    private static instance;
    private static TO_WIN_ENDL;
    private static TO_LINUX_MAC_ENDL;
    private static TO_WIN_FILE_SEP;
    private static os_name;
    protected constructor();
    static get_instance(): OsPortability;
    convert_endl(to_convert: string): string;
    convert_file_sep(to_convert: string): string;
    get_endl(): string;
    protected static set_platform(my_platform: string): void;
}
