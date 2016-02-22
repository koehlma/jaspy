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

import json
import opcode
import string
import types


with open('opcodes.tpl.js', 'r') as opcodes_template:
    opcodes_source = opcodes_template.read()

with open('js/jaspy/opcodes.js', 'w') as opcodes_js:
    opcodes_js.write(string.Template(opcodes_source).substitute({
        'opcodes': ',\n'.join('    %s: %d' % (name, code)
                              for name, code in sorted(opcode.opmap.items()))[4:]
    }))

print(opcode.opmap)

import dis
"""
a = -3
x = 3
y = True
h = 'Hello World!'
k = (1, 3, True, None, False)

i = x.__add__

def test(x=3):
    print(h)

""""""
z = x + a + 5
z = z << 5
x = 5 & 3
"""

"""
def __build_class__(function, name, *bases, metaclass=None):
    pass

class str(__js_str__, __js_int__, metaclass=__js_type__):
    pass
"""


code = compile('''
a = object()

def __build_class__(function, name, *bases, metaclass=None, **keywords):
    namespace = None
    __js_namespace__(namespace, function)


class Test():
    pass
''', 'example.py', 'exec')

print(code.co_code)

import inspect


def convert(obj):
    if isinstance(obj, types.CodeType):
        co_code = []
        print(obj.co_name)
        for instruction in dis.Bytecode(obj):
            print(instruction)
            co_code.append((instruction.opcode, instruction.arg))
        return {
            'co_argcount': obj.co_argcount,
            'co_kwonlyargcount': obj.co_kwonlyargcount,
            'co_code': co_code,
            'co_consts': list(map(convert, obj.co_consts)),
            'co_filename': obj.co_filename,
            'co_firstlineno': obj.co_firstlineno,
            'co_flags': obj.co_flags,
            'co_lnotab': list(obj.co_lnotab),
            'co_name': obj.co_name,
            'co_names': obj.co_names,
            'co_nlocals': obj.co_nlocals,
            'co_stacksize': obj.co_stacksize,
            'co_varnames': obj.co_varnames,
            'co_freevars': obj.co_freevars,
            'co_cellvars': obj.co_cellvars,
        }
    return obj


import json
print(json.dumps(convert(code)))

