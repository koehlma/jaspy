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


import dis
import types

import opcode


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
        print(const.co_name)
        dis.dis(const)
        for instruction in dis.Bytecode(const):
            print(instruction)
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
        raise Exception('invalid type', const)
    return '(' + ''.join(js) + ')'


EXAMPLE = '''
def hello(name='World'):
    print('Hello,', name + '!')

if int: hello()

hello('Python')

x = False
if x: hello('JS')

while x < 3:
    try:
        print(x)
        x += 1
        continue;
    finally:
        print('finally')
else:
    print('test')

while x < 4:
    break
else:
    print('jo')

try:
    try:
        a = +int
    except AttributeError:
        print('attribute error')
except TypeError:
    print('type error')


def test():
    try:
        a = c.a
    finally:
        return 'yeah'


print(test())


class Test():
    def __init__(self):
        print('init yolo')

    def __str__(self):
        return 'this is a test'

test = Test()
print(test)

a = None
if a:
    print('this should not be printed')

def abc():
    print(xyz)

try:
    abc()
except NameError:
    print('yes')

'''

"""
EXAMPLE = '''
a = 0
while a < 5000:
    append_body()
    a += 1
print(a)
'''
"""

EXAMPLE = '''
import dom

wrapper = dom.Element()
wrapper.css('background', '#FF0000')

p = wrapper.p
p.text = 'Hallo Welt!'
print(p)
print(p.text)

p = wrapper.p
p['style'] = 'background: #00FF00'
p.html = '<strong>Hallo Python!</strong>'


print(dom.get_body())

dom.get_body().append(wrapper)
'''

code = compile(EXAMPLE, 'example.py', 'exec')

dis.dis(code)

for instruction in dis.Bytecode(code):
    print(instruction)

for const in code.co_consts:
    if not isinstance(const, types.CodeType):
        continue
    dis.dis(const)
    for instruction in dis.Bytecode(const):
        print(instruction)

print(convert(code))
"""
import time
c = compile(EXAMPLE, 'example.py', 'exec')
start = time.time()
exec(c)
stop = time.time()
print((stop - start) * 1000)
"""
'''
co_consts = compile(EXAMPLE, 'example.py', 'exec').co_consts
dis.dis(co_consts[3])
'''

EXAMPLE = '''
var c;
var a = -3;
var b = -a;''' + '''
c = a + b + 10''' * 500

#print(EXAMPLE)

print()

def test():
    try:
        try:
            raise Exception
        finally:
            return 3
    except Exception:
        ...
    print('abc')

print(test())

