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
import re

macro_regex = re.compile(r'(?P<include>^(\s*)//\s*#include\s*(?P<path>.+?)\s*$)|'
                         r'(?P<eval>/\*\s*\{\{(?P<cmd>.+?)\}\}\s*\*/)', re.MULTILINE)


class Preprocessor:
    def __init__(self):
        self.locals = {}

    def eval(self, cmd):
        return eval(cmd, self.locals)

    def process(self, filename):
        with open(filename, 'r') as input_file:
            source = input_file.read()
        root = os.path.dirname(filename)
        match = macro_regex.search(source)
        while match:
            fields = match.groupdict()
            if match.lastgroup == 'include':
                filename = os.path.join(root, self.eval(fields['path']))
                result = self.process(filename)
            elif match.lastgroup == 'eval':
                result = str(self.eval(fields['cmd']))
            else:
                result = ''
            source = source[:match.start()] + result + source[match.end():]
            match = macro_regex.search(source)
        return source
