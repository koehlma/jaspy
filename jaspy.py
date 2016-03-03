# -*- coding: utf-8 -*-

# Copyright (C) 2016, Maximilian Köhl <mail@koehlma.de>
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License version 3 as published by
# the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

import argparse
import os.path
import types


def convert(const):
    js = []
    if const is None or isinstance(const, bool):
        js.append('jaspy.%r' % const)
    elif isinstance(const, int):
        js.append('jaspy.new_int(%r)' % const)
    elif isinstance(const, float):
        js.append('jaspy.new_float(%r)' % const)
    elif isinstance(const, str):
        js.append('jaspy.new_str(%r)' % const)
    elif isinstance(const, bytes):
        js.append('jaspy.new_bytes(%r)' % ', '.join(map(int, const)))
    elif isinstance(const, tuple):
        js.append('jaspy.new_tuple([%s])' % ', '.join(map(convert, const)))
    elif isinstance(const, types.CodeType):
        js.append('jaspy.new_code(new jaspy.PythonCode(\'%s\', {' % repr(const.co_code)[2:-1])
        js.append('name: %r,' % const.co_name)
        js.append('filename: %r,' % const.co_filename)
        js.append('constants: [%s],' % ', '.join(map(convert, const.co_consts)))
        js.append('flags: %r,' % const.co_flags)
        js.append('names: [%s],' % ', '.join(map(repr, const.co_names)))
        js.append('argcount: %r,' % const.co_argcount)
        js.append('kwargcount: %r,' % const.co_kwonlyargcount)
        js.append('varnames: [%s],' % ', '.join(map(repr, const.co_varnames)))
        js.append('freevars: [%s],' % ', '.join(map(repr, const.co_freevars)))
        js.append('cellvars: [%s],' % ', '.join(map(repr, const.co_cellvars)))
        js.append('firstline: %r,' % const.co_firstlineno)
        js.append('lnotab: \'%s\'' % repr(const.co_lnotab)[2:-1])
        js.append('}))')
    else:
        raise TypeError('invalid type of constant', const)
    return '(' + ''.join(js) + ')'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('module', type=argparse.FileType('r'))

    arguments = parser.parse_args()

    filename = os.path.basename(arguments.module.name)
    code = compile(arguments.module.read(), filename, 'exec')
    source = convert(code)
    name = os.path.basename(arguments.module.name).partition('.')[0]

    with open(arguments.module.name + '.js', 'w') as output:
        output.write('jaspy.define_module(%r, %s);' % (name, source))


if __name__ == '__main__':
    main()
