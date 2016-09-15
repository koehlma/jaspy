/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var tokenizer = (function () {
    var index;


    var TOKEN_TYPES = {
        INDENT: 'indent',
        DEDENT: 'dedent',

        STRING: 'string',
        FLOAT: 'float',
        INTEGER: 'integer',
        COMPLEX: 'complex',

        OPERATOR: 'operator',
        BRACKET: 'bracket',
        SPECIAL: 'special',

        NAME: 'name',

        COMMENT: 'comment',
        NEWLINE: 'newline',

        WHITESPACE: 'whitespace',

        LITERAL: 'literal',

        KEYWORD: 'keyword',
        IDENTIFIER: 'identifier',

        ERROR: 'error'
    };


    var LITERAL_TYPES = {
        STRING: 'string',
        BYTES: 'bytes',
        FLOAT: 'float',
        COMPLEX: 'complex'
    };


    function group() {
        return '(' + Array.prototype.slice.call(arguments).join('|') + ')';
    }

    function any() {
        return group.apply(null, arguments) + '*';
    }

    function maybe() {
        return group.apply(null, arguments) + '?';
    }

    function exact() {
        return '^' + group.apply(null, arguments) + '$';
    }

    function compile() {
        return new RegExp(group.apply(null, arguments), 'gu');
    }


    var STRING_PREFIXES = group('', 'b', 'B', 'r', 'R', 'u', 'U', 'f', 'F',
                                'br', 'bR', 'Br', 'BR', 'rb', 'rB', 'Rb', 'RB',
                                'fr', 'fR', 'Fr', 'FR', 'rf', 'rF', 'Rf', 'RF');

    var SHORT_STRING = group("'([^\\\\\n']|\\\\(.|\n|\r\n))*'", '"([^\\\\\n"]|\\\\(.|\n|\r\n))*"');
    var LONG_STRING = group("'''([^\\\\]|\\\\.)*'''", '"""([^\\\\]|\\\\.)*"""');

    var STRING = maybe(STRING_PREFIXES) + group(LONG_STRING, SHORT_STRING);

    var DECINTEGER = '[1-9](_?[0-9])*|0(_?0)*';
    var BININTEGER = '0[bB](_?[01])+';
    var OCTINTEGER = '0[oO](_?[0-7])+';
    var HEXINTEGER = '0[xX](_?[0-9a-fA-F])+';

    var INTEGER = group(BININTEGER, OCTINTEGER, HEXINTEGER, DECINTEGER);

    var DIGITPART = '[0-9](_?[0-9])*';
    var FRACTION = '\\.' + DIGITPART;
    var EXPONENT = '[eE][+-]?' + DIGITPART;

    var POINTFLOAT = group(maybe(DIGITPART) + FRACTION, DIGITPART + '\\.');
    var EXPONENTFLOAT = group(DIGITPART, POINTFLOAT) + EXPONENT;

    var FLOAT = group(EXPONENTFLOAT, POINTFLOAT);

    var COMPLEX = group(FLOAT, DIGITPART) + '[jJ]';

    var NUMBER = group(COMPLEX, FLOAT, INTEGER);

    var LITERAL = group(STRING, NUMBER);

    var OPERATOR = group('(\\*\\*|//|<<|>>)=?', '[><!=+\\-*/%@&|^]=?', '[~<>]');

    var BRACKET = '[\\[\\](){}]';
    var SPECIAL = group(',', ':', '\\.\\.\\.', '\\.', ';');

    var COMMENT = '#.*';

    var NAME;
    // << if UNICODE_SUPPORT
        var NAME_START = '([_A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԣԱ-Ֆՙա-ևא-תװ-ײء-يٮ-ٯٱ-ۓەۥ-ۦۮ-ۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴ-ߵߺऄ-हऽॐक़-ॡॱ-ॲॻ-ॿঅ-ঌএ-ঐও-নপ-রলশ-হঽৎড়-ঢ়য়-ৡৰ-ৱਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલ-ળવ-હઽૐૠ-ૡଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହଽଡ଼-ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘ-ౙౠ-ౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠ-ೡഅ-ഌഎ-ഐഒ-നപ-ഹഽൠ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะา-ำเ-ๆກ-ຂຄງ-ຈຊຍດ-ທນ-ຟມ-ຣລວສ-ຫອ-ະາ-ຳຽເ-ໄໆໜ-ໝༀཀ-ཇཉ-ཬྈ-ྋက-ဪဿၐ-ၕၚ-ၝၡၥ-ၦၮ-ၰၵ-ႁႎႠ-Ⴥა-ჺჼᄀ-ᅙᅟ-ᆢᆨ-ᇹሀ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙶᚁ-ᚚᚠ-ᛪ\u16ee-\u16f0ᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦩᧁ-ᧇᨀ-ᨖᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮ-ᮯᰀ-ᰣᱍ-ᱏᱚ-ᱽᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₔℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎ\u2160-\u2188Ⰰ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱽⲀ-ⳤⴀ-ⴥⴰ-ⵥⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-\u3007\u3021-\u3029〱-〵\u3038-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆷㇰ-ㇿ㐀-䶵一-鿃ꀀ-ꒌꔀ-ꘌꘐ-ꘟꘪ-ꘫꙀ-ꙟꙢ-ꙮꙿ-ꚗꜗ-ꜟꜢ-ꞈꞋ-ꞌꟻ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꤊ-ꤥꤰ-ꥆꨀ-ꨨꩀ-ꩂꩄ-ꩋ가-힣豈-鶴侮-頻並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּ-סּףּ-פּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]|[\ud840-\ud868][\udc00-\udfff]|\ud800[\udc00-\udc0b\udc0d-\udc26\udc28-\udc3a\udc3c-\udc3d\udc3f-\udc4d\udc50-\udc5d\udc80-\udcfa\udd40-\udd74\ude80-\ude9c\udea0-\uded0\udf00-\udf1e\udf30-\udf4a\udf80-\udf9d\udfa0-\udfc3\udfc8-\udfcf\udfd1-\udfd5]|\ud801[\udc00-\udc9d]|\ud802[\udc00-\udc05\udc08\udc0a-\udc35\udc37-\udc38\udc3c\udc3f\udd00-\udd15\udd20-\udd39\ude00\ude10-\ude13\ude15-\ude17\ude19-\ude33]|\ud808[\udc00-\udf6e]|\ud809[\udc00-\udc62]|\ud835[\udc00-\udc54\udc56-\udc9c\udc9e-\udc9f\udca2\udca5-\udca6\udca9-\udcac\udcae-\udcb9\udcbb\udcbd-\udcc3\udcc5-\udd05\udd07-\udd0a\udd0d-\udd14\udd16-\udd1c\udd1e-\udd39\udd3b-\udd3e\udd40-\udd44\udd46\udd4a-\udd50\udd52-\udea5\udea8-\udec0\udec2-\udeda\udedc-\udefa\udefc-\udf14\udf16-\udf34\udf36-\udf4e\udf50-\udf6e\udf70-\udf88\udf8a-\udfa8\udfaa-\udfc2\udfc4-\udfcb]|\ud869[\udc00-\uded6]|\ud87e[\udc00-\ude1d])';
        var NAME_CONTINUE = '([0-9_\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u0610-\u061a\u064b-\u065e٠-٩\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7-\u06e8\u06ea-\u06ed۰-۹\u0711\u0730-\u074a\u07a6-\u07b0߀-߉\u07eb-\u07f3\u0901-\u0903\u093c\u093e-\u094d\u0951-\u0954\u0962-\u0963०-९\u0981-\u0983\u09bc\u09be-\u09c4\u09c7-\u09c8\u09cb-\u09cd\u09d7\u09e2-\u09e3০-৯\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51੦-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3૦-૯\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b62-\u0b63୦-୯\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7௦-௯\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c62-\u0c63౦-౯\u0c82-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0ce2-\u0ce3೦-೯\u0d02-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62-\u0d63൦-൯\u0d82-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2-\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e๐-๙\u0eb1\u0eb4-\u0eb9\u0ebb-\u0ebc\u0ec8-\u0ecd໐-໙\u0f18-\u0f19༠-༩\u0f35\u0f37\u0f39\u0f3e-\u0f3f\u0f71-\u0f84\u0f86-\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e၀-၉\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-႙\u135f\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17b6-\u17d3\u17dd០-៩\u180b-\u180d᠐-᠙\u18a9\u1920-\u192b\u1930-\u193b᥆-᥏\u19b0-\u19c0\u19c8-\u19c9᧐-᧙\u1a17-\u1a1b\u1b00-\u1b04\u1b34-\u1b44᭐-᭙\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1baa᮰-᮹\u1c24-\u1c37᱀-᱉᱐-᱙\u1dc0-\u1de6\u1dfe-\u1dff‿-⁀⁔\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2de0-\u2dff\u302a-\u302f\u3099-\u309a꘠-꘩\ua66f\ua67c-\ua67d\ua802\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4꣐-꣙꤀-꤉\ua926-\ua92d\ua947-\ua953\uaa29-\uaa36\uaa43\uaa4c-\uaa4d꩐-꩙\ufb1e\ufe00-\ufe0f\ufe20-\ufe26︳-︴﹍-﹏０-９＿]|\ud800\uddfd|\ud801[\udca0-\udca9]|\ud802[\ude01-\ude03\ude05-\ude06\ude0c-\ude0f\ude38-\ude3a\ude3f]|\ud834[\udd65-\udd69\udd6d-\udd72\udd7b-\udd82\udd85-\udd8b\uddaa-\uddad\ude42-\ude44]|\ud835[\udfce-\udfff]|\udb40[\udd00-\uddef])';

        NAME = NAME_START + any(NAME_START, NAME_CONTINUE);
    // -- else
        NAME = '[a-zA-Z_]\w*';
    // >>

    var NEWLINE = '(\n|\r\n)';
    var WHITESPACE = '([ \f\t]|\\\\\n|\\\\\r\n)+';

    var TOKEN = group(LITERAL, OPERATOR, BRACKET, SPECIAL, NAME, COMMENT, WHITESPACE, NEWLINE);


    var token_regex = compile(TOKEN);

    var whitespace_regex = compile(exact(WHITESPACE));

    var string_regex = compile(exact(STRING));

    var complex_regex = compile(exact(COMPLEX));
    var float_regex = compile(exact(FLOAT));
    var integer_regex = compile(exact(INTEGER));

    var operator_regex = compile(exact(OPERATOR));
    var bracket_regex = compile(exact(BRACKET));
    var special_regex = compile(exact(SPECIAL));

    var name_regex = compile(exact(NAME));

    var comment_regex = compile(exact(COMMENT));
    var newline_regex = compile(exact(NEWLINE));


    var unicode_escape_regex = /(\\N\{[^}]+}|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8})/g;
    var general_escape_regex = /(\\[0-7]{3}|\\x[0-9A-Fa-f]{2}|\\(\n|\r\n|[^N]))/g;

    var invalid_escape_sequence = false;

    var valid_bytes_regex = /^[\x00-\xff]*$/g;

    function replace_unicode_escape(match) {
        switch (match.charAt(1)) {
            case 'N':
            case 'U':
                throw new Error('SyntaxError: Unsupported unicode character escape sequence!');
            case 'u':
                return String.fromCharCode(parseInt(match.substr(2), 16));
        }
    }

    function replace_general_escape(match) {
        switch (match.charAt(1)) {
            case '\n':
            case '\r':
                return '';
            case '\\':
            case "'":
            case '"':
                return match.charAt(1);
            case 'a':
                return '\a';
            case 'b':
                return '\b';
            case 'f':
                return '\f';
            case 'n':
                return '\n';
            case 'r':
                return '\r';
            case 't':
                return '\t';
            case 'v':
                return '\v';
            case 'x':
                return String.fromCharCode(parseInt(match.substr(2), 16));
            default:
                if (match.charAt(1) >= '1' && match.charAt(1) <= '7') {
                    return String.fromCharCode(parseInt(match.substr(1), 8));
                } else {
                    invalid_escape_sequence = true;
                    return match;
                }
        }
    }

    function parse_string(token) {
        var index;

        var raw = false;
        var format = false;
        var bytes = false;

        loop: for (index = 0; index < token.length; index++) {
            switch (token.charAt(index).toLowerCase()) {
                case "'":
                case '"':
                    break loop;
                case 'r':
                    raw = true;
                    break;
                case 'f':
                    format = true;
                    break;
                case 'b':
                    bytes = true;
                    break;
                case 'u':
                    break;
            }
        }

        switch (token.substr(index, 3)) {
            case '"""':
            case "'''":
                token = token.substr(index + 3, token.length - index - 6);
                break;
            default:
                token = token.substr(index + 1, token.length - index - 2);
                break;
        }

        if (!raw) {
            if (!bytes) {
                token = token.replace(unicode_escape_regex, replace_unicode_escape)
            }
            token = token.replace(general_escape_regex, replace_general_escape);
        }

        if (invalid_escape_sequence) {
            console.warn('DeprecationWarning: Unrecognized escape sequence!');
            invalid_escape_sequence = false;
        }

        if (bytes) {
            if (token.match(valid_bytes_regex)) {
                return {type: LITERAL_TYPES.BYTES, value: token};
            }
            throw new Error('SyntaxError: Bytes can only contain ASCII literal characters!');
        }
        return {type: LITERAL_TYPES.STRING, value: token, format: format};
    }


    function parse_integer(token) {
        var base = 10;
        switch (token.charAt(1).toLowerCase()) {
            case 'x':
                base = 16;
                break;
            case 'o':
                base = 8;
                break;
            case 'b':
                base = 2;
                break;
        }
        if (base != 10) {
            token = token.substr(2);
        }
        return {type: LITERAL_TYPES.INTEGER, value: token.replace('_', ''), base: base};
    }


    function parse_float(token) {
        return {type: LITERAL_TYPES.FLOAT, value: parseFloat(token.replace('_', ''))};
    }


    function parse_complex(token) {
        var literal = parse_float(token.substr(0, token.length - 1));
        literal.type = LITERAL_TYPES.COMPLEX;
        return literal;
    }


    var parse_map = {
        string: parse_string,
        integer: parse_integer,
        float: parse_float,
        complex: parse_complex
    };


    var KEYWORDS = ['False', 'True', 'None', 'and', 'as', 'assert', 'async', 'await',
                    'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
                    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
                    'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
                    'while', 'with', 'yield'];

    var keywords = {};
    for (index = 0; index < KEYWORDS.length; index++) {
        keywords[KEYWORDS[index]] = true;
    }

    function is_keyword(name) {
        return keywords.hasOwnProperty(name);
    }


    function decide(token) {
        if (token.match(whitespace_regex)) {
            return TOKEN_TYPES.WHITESPACE;
        }
        if (token.match(string_regex)) {
            return TOKEN_TYPES.STRING;
        }
        if (token.match(complex_regex)) {
            return TOKEN_TYPES.COMPLEX;
        }
        if (token.match(float_regex)) {
            return TOKEN_TYPES.FLOAT;
        }
        if (token.match(integer_regex)) {
            return TOKEN_TYPES.INTEGER;
        }
        if (token.match(operator_regex)) {
            return TOKEN_TYPES.OPERATOR;
        }
        if (token.match(bracket_regex)) {
            return TOKEN_TYPES.BRACKET;
        }
        if (token.match(special_regex)) {
            return TOKEN_TYPES.SPECIAL;
        }
        if (token.match(name_regex)) {
            return is_keyword(token) ? TOKEN_TYPES.KEYWORD : TOKEN_TYPES.IDENTIFIER;
        }
        if (token.match(comment_regex)) {
            return TOKEN_TYPES.COMMENT;
        }
        if (token.match(newline_regex)) {
            return TOKEN_TYPES.NEWLINE;
        }
        return TOKEN_TYPES.ERROR;
    }


    function feed(token) {
        var index, newlines, offset;
        newlines = 0;
        offset = 0;
        for (index = 0; index < token.length; index++) {
            offset += 1;
            switch (token.charAt(index)) {
                case '\r':
                    if (!(token.charAt(index + 1) == '\n')) {
                        break;
                    }
                case '\n':
                    newlines++;
                    offset = 0;
            }
        }
        return {newlines: newlines, offset: offset};
    }

    function tokenize(source) {
        var tokens, match, t, type, position, row, column, token, indentations;
        tokens = [];
        t = '';
        position = 0;
        row = 0;
        column = 0;
        token = {raw: ''};
        indentations = [];
        while (match = token_regex.exec(source)) {
            if (match.index != position + token.raw.length) {
                console.error('error: ', row, column);
            }
            var pos_info = feed(match[0]);
            row += pos_info.newlines;
            if (pos_info.newlines > 0) {
                column = pos_info.offset;
            } else {
                column += pos_info.offset
            }

            position = match.index;

            token = {};
            token.raw = match[0];
            token.type = decide(token.raw);

            switch (token.type) {
                case TOKEN_TYPES.STRING:
                    token.type = TOKEN_TYPES.LITERAL;
                    token.value = parse_string(token.raw);
                    break;
                case TOKEN_TYPES.INTEGER:
                    token.type = TOKEN_TYPES.LITERAL;
                    token.value = parse_integer(token.raw);
                    break;
                case TOKEN_TYPES.FLOAT:
                    token.type = TOKEN_TYPES.LITERAL;
                    token.value = parse_float(token.raw);
                    break;
                case TOKEN_TYPES.COMPLEX:
                    token.type = TOKEN_TYPES.COMPLEX;
                    token.value = parse_complex(token.raw);
                    break;
                case TOKEN_TYPES.WHITESPACE:
                    if (tokens[tokens.length - 1]) {

                    }
                    break;
                default:
                    break;
            }

            tokens.push(token);

            console.log(token);

        }
        console.log(tokens);
    }

    return {
        tokenize: tokenize,
        feed: feed,
        parse_string: parse_string
    }
})();


$.tokenizer = tokenizer;
