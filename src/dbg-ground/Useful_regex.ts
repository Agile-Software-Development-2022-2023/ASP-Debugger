export class ASP_REGEX{
    // positive lookbehind for a single '.' or the beginning of a line
    // arbitrary sequence of spaces, letters, digits, brackets, colons, underscores, dashes and two dots
    // positive lookbehind for a single '.' that delimits the fact
    public static FACT_REGEX: string  = "((?<=((?<!\\.)\\.(?!\\.)))|^)"+ "(([ a-zA-Z0-9(),_\\-]|(\\.\\.))*)"+ "(?=((?<!\\.)\\.(?!\\.)))";

	/** Group that matches the fact */
	public static FACT_REGEX_MATCHING_GROUP:string = "$3";
	
	/** Regular expression that matches a variable */
     // positive lookbehind for a starting delimiter of the variable
     // variable
     // positive lookahead for a ending delimiter of the variable
    public static VARIABLE_REGEX :string = "(?<=[(,; ])"+ "(_*[A-Z][A-Za-z0-9]*)" + "(?=[),; ])"; 
	
    private static MULTILINE:string = 'm';
    public static  FACT_PATTERN: RegExp= new RegExp(ASP_REGEX.FACT_REGEX, ASP_REGEX.MULTILINE);

    public static  VARIABLE_PATTERN: RegExp = new RegExp(ASP_REGEX.VARIABLE_REGEX);

	public static  COMMENT_PATTERN: RegExp = new RegExp(" *%.*\n{0,1}", ASP_REGEX.MULTILINE);

	public static  AGGREGATE_PATTERN: RegExp = new RegExp("[^\\{\\},]*\\{[^\\{\\}]*?\\}[^\\{\\},]*");
	
}