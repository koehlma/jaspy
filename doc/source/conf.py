#!/usr/bin/env python3
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
import sys

__dir__ = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(__dir__, '..', '..'))

from jaspy import metadata

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.doctest',
    'sphinx.ext.intersphinx',
    'sphinx.ext.todo',
    'sphinx.ext.mathjax',
    'sphinx.ext.viewcode',
]

templates_path = ['_templates']

source_suffix = '.rst'

master_doc = 'index'

project = 'Jaspy'
copyright = '2016, Maximilian Köhl'
author = 'Maximilian Köhl'

version = metadata.__version__
release = metadata.__version__

language = None

exclude_patterns = []

pygments_style = 'sphinx'

todo_include_todos = False

html_static_path = ['_static']

intersphinx_mapping = {'python': ('https://docs.python.org/3.5', None)}
