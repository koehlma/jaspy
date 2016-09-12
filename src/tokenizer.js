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
    function Token(type, value, start, end, line) {
        this.type = type;
        this.value = value;
        this.start = start;
        this.end = end;
        this.line = line;
    }

    Token.TYPES = {
        INDENT: 0,
        DEDENT: 1,

        STRING: 2,
        FLOAT: 3,
        COMPLEX: 4,
        INTEGER: 5,

        OPERATOR: 6,
        BRACKET: 7,
        SPECIAL: 8,

        NAME: 9,

        COMMENT: 10
    };


    function any() {
        return '(' + Array.prototype.slice.call(arguments).join('|') + ')';
    }

    function maybe() {
        return any.apply(null, arguments) + '?';
    }

    function exact(regex) {
        return '^' + regex + '$';
    }

    function compile(regex) {
        return new RegExp(regex, 'gu');
    }


    var regexes = (function () {
        var string_prefix = any('', 'b', 'B', 'r', 'R', 'u', 'U', 'f', 'F',
                                'br', 'bR', 'Br', 'BR', 'rb', 'rB', 'Rb', 'RB',
                                'fr', 'fR', 'Fr', 'FR', 'rf', 'rF', 'Rf', 'RF');

        var short_string = any("'([^\\\\\n']|\\\\.|\\\\(\n|\r\n))*'", '"([^\\\\\n"]|\\\\.|\\\\(\n|\r\n))*"');
        var long_string = any("'''([^\\\\]|\\\\.)*'''", '"""([^\\\\]|\\\\.)*"""');

        var string = maybe(string_prefix) + any(long_string, short_string);


        var decinteger = '[1-9](_?[0-9])*|0(_?0)*';
        var bininteger = '0[bB](_?[01])+';
        var octinteger = '0[oO](_?[0-7])+';
        var hexinteger = '0[xX](_?[0-9a-fA-F])+';

        var integer = any(decinteger, bininteger, octinteger, hexinteger);


        var digitpart = '[0-9](_?[0-9])*';
        var fraction = '\\.' + digitpart;
        var exponent = '[eE][+-]?' + digitpart;

        var pointfloat = any(maybe(digitpart) + fraction, digitpart + '\\.');
        var exponentfloat = any(digitpart, pointfloat) + exponent;

        var float = any(exponentfloat, pointfloat);


        var complex = any(float, digitpart) + '[jJ]';


        var number = any(complex, float, integer);


        var literal = any(string, number);


        var operator = any('(\\*\\*|//|<<|>>)=?', '[><!=+\\-*/%@&|^]=?', '[~<>]');

        var bracket = '[\\[\\](){}]';
        var special = any(bracket, ',', ':', '\\.\\.\\.', '\\.', ';');

        var comment = '#.*';

        var name = '\\w+';
        var newline = '(\n|\r\n)';
        var whitespace = '([ \f\t]|\\\\\n|\\\\\r\n)+';

        var token = any(literal, operator, bracket, special, name, comment, whitespace, newline);

        return {
            token: compile(token),

            whitespace: compile(exact(whitespace)),

            string: compile(exact(string)),

            complex: compile(exact(complex)),
            float: compile(exact(float)),
            integer: compile(exact(integer)),

            operator: compile(exact(operator)),
            bracket: compile(exact(bracket)),
            special: compile(exact(special)),

            name: compile(exact(name)),

            comment: compile(exact(comment)),
            newline: compile(exact(newline)),

            order: ['whitespace', 'string', 'complex', 'float', 'integer', 'operator',
                    'bracket', 'special', 'name', 'comment', 'newline']
        }
    })();


    function decide(token) {
        var index;
        for (index = 0; index < regexes.order.length; index++) {
            if (token.match(regexes[regexes.order[index]])) {
                return regexes.order[index];
            }
        }
    }


    function tokenize(source) {
        var tokens, match, token, type, position;
        tokens = [];
        token = '';
        position = 0;
        while (match = regexes.token.exec(source)) {
            if (match.index != position + token.length) {
                console.error('error');
            }
            position = match.index;
            token = match[0];
            type = decide(token);
            console.log(type, token);
            switch (type) {
                case 'string':
                    tokens.push(new Token(Token.TYPES.STRING, token, 0, 0, 0));
                    console.info('str', token);
                    break;
                default:
                    break;
            }

        }
        console.log(tokens);
    }

    return {
        Token: Token,
        tokenize: tokenize
    }
})();


