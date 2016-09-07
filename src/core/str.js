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


var STR_REPR_REGEX = /[\\\n\r\t\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xa0\xad]/g;

var STR_CASE = {LOWER: -1, UPPER: 1, NONE: 0};

var STR_C_REGEX = /%(\([^)]+\))?([#0\- +]+)?([0-9]*|\*)?(\.[0-9]*|\*)?([a-zA-Z%])/g;
var STR_SPLIT_REGEX = /[^\s]/g;

function str_repr_replace(char) {
    char = char.charCodeAt(0);
    switch (char) {
        case 9:
            return '\\t';
        case 10:
            return '\\n';
        case 13:
            return '\\r';
        case 92:
            return '\\\\';
        default:
            return '\\x' + ('0' + char.toString(16)).substr(-2);
    }
}

function char_get_case(char) {
    if (char.toLowerCase() === char.toUpperCase()) {
        return STR_CASE.NONE;
    } else if (char.toLowerCase() === char) {
        return STR_CASE.LOWER;
    } else {
        return STR_CASE.UPPER;
    }
}


var Str = $Class('str', {
    constructor: function (value, cls) {
        PyObject.call(this, cls || Str.cls);
        this.value = Str.unpack(value, '');
    },

    to_bool: function () {
        return this.value === '' ? False : True;
    },

    to_string: function () {
        return this.value;
    },

    repr: function () {
        var result = this.value.replace(STR_REPR_REGEX, str_repr_replace);
        if (result.indexOf('"') < 0) {
            if (result.indexOf('\'') < 0) {
                return new Str('\'' + result + '\'');
            } else {
                return new Str('"' + result + '"');
            }
        } else {
            return new Str('\'' + result.replace(/'/g, '\\\'') + '\'');
        }
    },

    concat: function (other) {
        other = Str.unpack(other);
        return new Str(this.value + other);
    },

    contains: function (sub) {
        sub = Str.unpack(sub);
        if (sub.length == 0) {
            return True;
        }
        return Bool.pack(this.value.indexOf(sub) > 1);
    },

    equals: function (other) {
        if (other instanceof Str) {
            other = other.value;
        }
        return other === this.value ? True : False;
    },

    hash: function () {
        // TODO: implement Dict and hashing
        raise(NotImplemented);
    },

    is: function (other) {
        if (other instanceof PyObject && other.__class__ !== Str.cls) {
            return false;
        }
        return this.equals(other);
    },

    format: function (spec) {
        // TODO: implement string formatting
        raise(NotImplemented);
    },

    slice: function (range) {
        var position, stop, step, result;
        if (range instanceof Int) {
            range = Int.unpack(range);
            if (range < 0) {
                range += this.value.length;
            }
            if (range > 0 && range < this.value.length) {
                return new Str(this.value.charAt(range));
            }
            raise(IndexError, 'string index out of range');
        } else if (range instanceof Slice) {
            range = range.normalize(this.value.length);
            stop = range.stop;
            step = range.step;
            result = '';
            if (step == 1 && stop >= range.start) {
                result = this.value.substring(range.start, stop);
            } else if (step > 0) {
                if (stop >= range.start) {
                    for (position = range.start; position < stop; position += step) {
                        result += this.value.charAt(position);
                    }
                }
            } else {
                if (stop <= range.start) {
                    for (position = range.start; position > stop; position += step) {
                        result += this.value.charAt(position);
                    }
                }
            }
            return new Str(result);
        }
        raise(TypeError, 'string indices must be integers');
    },

    iter: function () {
        // TODO: implement iterator
        raise(NotImplemented);
    },

    mod: function () {
        var match;
        while (match = STR_C_REGEX.exec(this.value)) {
            console.log(match);
        }
        // TODO: implement
        raise(NotImplemented);
    },

    repeat: function (count) {
        var result, extension;
        count = Int.unpack(count);
        if (count < 1) {
            return Str.EMPTY;
        }
        result = '';
        extension = this.value;
        while (count > 1) {
            if ((count & 1)) {
                result += extension;
            }
            count >>= 1;
            extension += extension;
        }
        return new Str(result + extension);
    },

    toString: function () {
        return this.value;
    },


    __hash__: function () {
        return siphash(this);
    },

    __repr__: function () {
        return this.repr()
    },


    /* Python Methods */

    capitalize: function () {
        if (this.value.length == 0) {
            return Str.EMPTY;
        }
        return new Str(this.value.charAt(0).toUpperCase() + this.value.substring(1).toLowerCase());
    },

    casefold: function () {
        // UNICODE: complicated unicode case folding
        raise(NotImplemented);
    },

    center: function (width, fillchar) {
        var result;
        width = Int.unpack(width);
        if (width <= this.value.length) {
            return this;
        }
        fillchar = Str.ensure(fillchar, ' ');
        result = fillchar.repeat((width - this.value.length) / 2);
        result += this.value + result;
        if (result.length < width) {
            result += fillchar;
        }
        return new Str(result);
    },

    count: function (sub, start, stop) {
        var substring, counter, position;
        start = Int.unpack(start, 0);
        stop = Int.unpack(stop, this.value.length);
        sub = Str.unpack(sub);
        substring = this.slice(new Slice(start, stop)).value;
        if (sub.length == 0) {
            if (start == this.value.length) {
                return Int.ONE;
            } else if (substring.length == 0) {
                return Int.ZERO;
            }
            return Int.pack(substring.length + 1);
        }
        counter = 0;
        position = 0;
        while (position < substring.length) {
            position = substring.indexOf(sub, position);
            if (position >= 0) {
                counter++;
                position += sub.length;
            } else {
                break;
            }
        }
        return Int.pack(counter);
    },

    encode: function (encoding, errors) {
        var encoder, result;
        encoding = Str.unpack(encoding, 'utf-8');
        errors = Str.unpack(errors, 'strict');
        if (errors != 'strict') {
            // UNICODE: implement other error modes
            raise(NotImplemented, 'unicode error handlers are not supported');
        }
        if (!TextEncoder) {
            // Polyfill: https://github.com/inexorabletash/text-encoding
            raise(RuntimeError, 'browser does not support encoding, please use a polyfill');
        }
        try {
            encoder = new TextEncoder(encoding);
        } catch (error) {
            raise(LookupError, 'unknown encoding: ' + encoding);
        }
        try {
            result = encoder.encode(this.value);
        } catch (error) {
            console.log(error);
            raise(UnicodeEncodeError, 'unable to decode bytes object, data is not valid');
        }
        return new Bytes(result);
    },

    endswith: function (suffixes, start, stop) {
        var index, suffix;
        var substring = this.slice(new Slice(start, stop)).value;
        if (suffixes instanceof Tuple) {
            suffixes = suffixes.array;
        } else if (!(suffixes instanceof Array)) {
            suffixes = [suffixes];
        }
        for (index = 0; index < suffixes.length; index++) {
            suffix = Str.unpack(suffixes[index]);
            if (suffix.length <= substring.length && substring.substr(substring.length - suffix.length) === suffix) {
                return True;
            }
        }
        return False;
    },

    expandtabs: function (tabsize) {
        var position, column, result, char;
        tabsize = Int.unpack(tabsize, 8);
        if (tabsize == 1) {
            return new Str(this.value.replace(/\t/g, ' '));
        }
        column = 0;
        result = '';
        for (position = 0; position < this.value.length; position++) {
            char = this.value.charAt(position);
            switch (char) {
                case '\t':
                    do {
                        result += ' ';
                        column++;
                    } while (column % tabsize > 0);
                    break;
                case '\r':
                case '\n':
                    result += char;
                    column = 0;
                    break;
                default:
                    result += char;
                    column++;
            }
        }
        return new Str(result);
    },

    find: function (sub, start, stop) {
        sub = Str.unpack(sub);
        return new Int(this.slice(new Slice(start, stop)).value.indexOf(sub));
    },

    // format: not supported in native mode

    // format_map: not supported in native mode

    index: function (sub, start, stop) {
        var result = this.find(sub, start, stop);
        if (result < 0) {
            raise(ValueError, 'substring not found')
        }
        return result;
    },

    isalnum: function () {
        return /^\w+$/.test(this.value) ? True : False;
    },

    isalpha: function () {
        return /^[a-z]+$/i.test(this.value) ? True : False;
    },

    isdecimal: function () {
        // UNICODE: this is not correct in case of unicode characters
        return /^\d+$/.test(this.value) ? True : False;
    },

    isdigit: function () {
        // UNICODE: this is not correct in case of unicode characters
        return /^\d+$/.test(this.value) ? True : False;
    },

    isidentifier: function () {
        // UNICODE: implement this together with the parser
        raise(NotImplemented);
    },

    islower: function () {
        return char_get_case(this.value) === STR_CASE.LOWER && !/^\s*$/.test(this.value) ? True : False;
    },

    isnumeric: function () {
        // UNICODE: this is not correct in case of unicode characters
        return /^\d+$/.test(this.value) ? True : False;
    },

    isprintable: function () {
        // UNICODE: this is not correct in case of unicode characters
        return this.value.search(STR_REPR_REGEX) < 0 ? True : False;
    },

    isspace: function () {
        // UNICODE: this is not correct in case of unicode characters
        return /^\s+$/.test(this.value) ? True : False;
    },

    istitle: function () {
        var position, current, previous;
        if (/^\s*$/.test(this.value)) {
            return False;
        }
        previous = char_get_case(this.value.charAt(0));
        for (position = 1; position < this.value.length; position++) {
            current = char_get_case(this.value.charAt(position));
            if ((current == STR_CASE.UPPER && previous) || (current == STR_CASE.LOWER && !previous)) {
                return False;
            }
            previous = current;
        }
        return True;
    },

    isupper: function () {
        return char_get_case(this.value) === STR_CASE.UPPER && !/^\s*$/.test(this.value) ? True : False;
    },

    // join: not supported in native mode

    ljust: function (width, fillchar) {
        var result;
        width = Int.unpack(width);
        if (width <= this.value.length) {
            return this;
        }
        fillchar = Str.ensure(fillchar, ' ');
        return new Str(this.value + fillchar.repeat(width - this.value.length).value);
    },

    lower: function () {
        return new Str(this.value.toLowerCase());
    },

    lstrip: function(chars) {
        if (!chars || chars === None) {
            return new Str(this.value.replace(/^\s+/, ''))
        }
        chars = Str.unpack(chars).replace(/\\/g, '\\\\').replace(/]/g, '\\]');
        return new Str(this.value.replace(new RegExp('^[' + chars + ']*'), ''));
    },

    partition: function (sep) {
        var index;
        sep = Str.unpack(sep);
        if (sep == '') {
            raise(ValueError, 'empty separator')
        }
        index = this.value.indexOf(sep);
        if (index < 0) {
            return new Tuple([this, Str.EMPTY, Str.EMPTY]);
        }
        return new Tuple([new Str(this.value.substring(0, index)), new Str(sep),
                          new Str(this.value.substring(index + sep.length))]);
    },

    replace: function (old_str, new_str, count) {
        count = Int.unpack(count, -1);
        // TODO: implement
        raise(NotImplemented);
    },

    rfind: function (sub, start, stop) {
        sub = Str.unpack(sub);
        return new Int(this.slice(new Slice(start, stop)).value.lastIndexOf(sub));
    },

    rindex: function (sub, start, stop) {
        var result = this.rfind(sub, start, stop);
        if (result < 0) {
            raise(ValueError, 'substring not found')
        }
        return result;
    },

    rjust: function (width, fillchar) {
        var result;
        width = Int.unpack(width);
        if (width <= this.value.length) {
            return this;
        }
        fillchar = Str.ensure(fillchar, ' ');
        return new Str(fillchar.repeat(width - this.value.length).value + this.value);
    },

    rpartition: function (sep) {
        var index;
        sep = Str.unpack(sep);
        if (sep == '') {
            raise(ValueError, 'empty separator')
        }
        index = this.value.lastIndexOf(sep);
        if (index < 0) {
            return new Tuple([this, Str.EMPTY, Str.EMPTY]);
        }
        return new Tuple([new Str(this.value.substring(0, index)), new Str(sep),
                          new Str(this.value.substring(index + sep.length))]);
    },

    rsplit: function (sep, maxsplit) {
        sep = Str.unpack(sep);
        maxsplit = Int.unpack(maxsplit, -1);
        // TODO: implement
        raise(NotImplemented);
    },

    rstrip: function (chars) {
        if (!chars || chars === None) {
            return new Str(this.value.replace(/\s+$/, ''))
        }
        chars = Str.unpack(chars).replace(/\\/g, '\\\\').replace(/]/g, '\\]');
        return new Str(this.value.replace(new RegExp('[' + chars + ']*$'), ''));
    },

    split: function (sep, maxsplit) {
        var match, previous, next;
        var result = new List();
        maxsplit = Int.unpack(maxsplit, -1);
        if (maxsplit < 0) {
            maxsplit = Infinity;
        }
        if (!sep || sep === None) {
            while (match = STR_SPLIT_REGEX.exec(this.value)) {
                if (maxsplit > 0) {
                    result.append(new Str(match[0]));
                } else if (maxsplit == 0) {
                    result.append(new Str(this.value.substring(match.index)));
                }
                maxsplit--;
            }
        } else {
            sep = Str.unpack(sep);
            if (sep == '') {
                raise(ValueError, 'empty separator');
            }
            previous = 0;
            while ((next = this.value.indexOf(sep, previous)) >= 0 && maxsplit-- > 0) {
                result.append(new Str(this.value.substring(previous, next)));
                previous = next + sep.length;
            }
            result.append(new Str(this.value.substring(previous)));
        }
        return result;
    },

    splitlines: function (keepends) {
        // TODO: implement
        raise(NotImplemented);
    },

    startswith: function (prefixes, start, stop) {
        var index, prefix;
        var substring = this.slice(new Slice(start, stop)).value;
        if (prefixes instanceof Tuple) {
            prefixes = prefixes.array;
        } else if (!(prefixes instanceof Array)) {
            prefixes = [prefixes];
        }
        for (index = 0; index < prefixes.length; index++) {
            prefix = Str.unpack(prefixes[index]);
            if (prefix.length <= substring.length && substring.substr(0, prefix.length) === prefix) {
                return True;
            }
        }
        return False;
    },

    strip: function (chars) {
        return this.lstrip(chars).rstrip(chars);
    },

    swapcase: function () {
        var index, char;
        var result = [];
        for (index = 0; index < this.value.length; index++) {
            char = this.value.charAt(index);
            switch (char_get_case(char)) {
                case STR_CASE.UPPER:
                    result.push(char.toLowerCase());
                    break;
                default:
                    result.push(char.toUpperCase());
            }
        }
        return new Str(result.join(''));
    },

    title: function () {
        // TODO: implement
        raise(NotImplemented);
    },

    translate: function (table) {
        // TODO: implement
        raise(NotImplemented);
    },

    upper: function () {
        return new Str(this.value.toUpperCase());
    },

    zfill: function (width) {
        var prefix;
        width = Int.unpack(width);
        prefix =  Str.ZERO.repeat(width - this.value.length);
        switch (this.value.charAt(0)) {
            case '+':
            case '-':
                return new Str(this.value.charAt(0) + prefix + this.value.substring(1));
            default:
                return new Str(prefix + this.value);
        }
    }
});


Str.prototype.valueOf = Str.prototype.toString;

Str.prototype.__add__ = Str.prototype.concat;


Str.pack = function (value) {
    return new Str(value);
};

Str.unpack = function (object, fallback) {
    if ((object === None || !object) && fallback !== undefined) {
        return fallback;
    }
    if (object instanceof Str) {
        return object.value;
    } else if (typeof object == 'string') {
        return object;
    } else {
        raise(TypeError, 'unable to unpack string from object');
    }
};

Str.ensure = function (string, fallback) {
    if (fallback && (string === None || !string)) {
        return new Str(fallback);
    }
    return new Str(string.valueOf());
};

Str.EMPTY = new Str('');
Str.ZERO = new Str('0');


function is_string(object) {
    return typeof object == 'string' || object instanceof Str;
}


$.Str = Str;
