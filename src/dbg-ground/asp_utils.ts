export function make_unique(pred_name: string, asp_program: string, append_chars: string = '_'): string
{
    while ( asp_program.includes(pred_name) )
        pred_name = append_chars + pred_name;
    return pred_name;
}

export function freezeStrings(asp_program: string, stringsMap: Map<string, string>): string
{
    let match_count: number = 0;
    stringsMap.clear();
    return asp_program.replace(/\"(.|\n)*?\"/g, function(match: string)
        {
            let string_token: string = '#str-' + (++match_count) + '#';
            stringsMap.set(string_token, match);
            return string_token;
        });
}

export function restoreStrings(asp_program: string, stringsMap: Map<string, string>): string
{
    if ( stringsMap.size === 0 )
        return asp_program;
    return asp_program.replace(/#str-\d+#/g, function(match: string)
    {
        if ( !stringsMap.has(match) )
            return '';
        return stringsMap.get(match);
    });
}