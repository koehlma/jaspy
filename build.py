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

import re
import os

INCLUDE_REGEX = re.compile('^(\s*)//\s*#include\s*(.+)\s*$', re.MULTILINE)


os.chdir(os.path.join(os.path.dirname(__file__), 'jaspy'))

with open('__init__.js') as init:
    source = init.read()


CONSTANTS = {
    'BIGINT': True,
    'BIGINT_INCLUDE': False
}

if CONSTANTS['BIGINT'] and CONSTANTS['BIGINT_INCLUDE']:
    with open('../libs/biginteger/BigInteger.js') as bigint:
        source = bigint.read() + source

match = INCLUDE_REGEX.search(source)
while match:
    indentation = match.group(1).count(' ') * ' '
    name = eval(match.group(2), CONSTANTS)
    with open(name) as include:
        inject = ''.join((indentation + line for line in include))
        source = source[:match.start()] + inject + source[match.end():]
    match = INCLUDE_REGEX.search(source)

with open('../build/jaspy.js', 'w') as output:
    output.write(source)
