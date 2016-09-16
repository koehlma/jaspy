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
import os

from jaspy import metadata
from jaspy.converter import convert
from jaspy.preprocessor import process


__path__ = os.path.dirname(__file__)
if __path__:
    os.chdir(__path__)


with open(os.path.join(__path__, 'modules', '_builtins.py')) as builtins:
    code = compile(builtins.read(), '<builtins>', 'exec')
    source = convert(code)
    builtins_source = 'jaspy.module(%r, %s);' % ('_builtins', source)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--debug', action='store_true', default=False)
    parser.add_argument('--debug-instructions', action='store_true', default=False)
    # TODO: disable DEBUG_EXCEPTIONS when production ready
    parser.add_argument('--debug-exceptions', action='store_true', default=True)
    parser.add_argument('--debug-threading', action='store_true', default=False)

    parser.add_argument('--exclude-bigint', action='store_true', default=False)
    parser.add_argument('--exclude-siphash', action='store_true', default=False)

    parser.add_argument('--include-encoding', action='store_true', default=False)

    parser.add_argument('--disable-debugger', action='store_true', default=False)
    parser.add_argument('--disable-threading', action='store_true', default=False)

    parser.add_argument('--threading-limit', type=int, default=5000)

    parser.add_argument('--modules', nargs='*')

    arguments = parser.parse_args()

    libs = []
    if not arguments.exclude_bigint:
        libs.append('biginteger/BigInteger.js')
    if not arguments.exclude_siphash:
        libs.append('siphash/lib/siphash.js')
    if arguments.include_encoding:
        libs.append('text-encoding/lib/encoding.js')

    namespace = {
        'DEBUG': arguments.debug,
        'DEBUG_INSTRUCTIONS': arguments.debug_instructions,
        'DEBUG_EXCEPTIONS': arguments.debug_exceptions,
        'DEBUG_THREADING': arguments.debug_threading,

        'ENABLE_DEBUGGER': not arguments.disable_debugger,
        'ENABLE_THREADING': not arguments.disable_threading,

        'THREADING_LIMIT': arguments.threading_limit,

        'UNICODE_SUPPORT': True,

        'modules': arguments.modules or [],

        'metadata': metadata,

        'libs': libs,

        '_builtins': builtins_source
    }

    if not os.path.exists('build'):
        os.mkdir('build')

    with open('build/jaspy.js', 'w') as output:
        output.write(process('src/__init__.js', namespace))

