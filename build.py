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

import os

import metadata

from preprocessor import process


__path__ = os.path.dirname(__file__)
os.chdir(__path__)

INCLUDE_BIGINT = True
INCLUDE_TEXT_ENCODING = False


if __name__ == '__main__':
    namespace = {'DEBUG': False}
    namespace['modules'] = lambda: ''
    namespace['metadata'] = metadata
    source = process('jaspy/__init__.js', namespace)

    if INCLUDE_BIGINT:
        with open('libs/biginteger/BigInteger.js') as biginteger:
            source = biginteger.read() + source

    if INCLUDE_TEXT_ENCODING:
        with open('libs/text-encoding/lib/encoding.js') as text_encoding:
            source = text_encoding.read() + source

    if not os.path.exists('build'):
        os.mkdir('build')

    with open('build/jaspy.js', 'w') as output:
        output.write(source)
