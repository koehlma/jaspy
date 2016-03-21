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

"""
This script provides a preprocessor for JavaScript.

// << if {PYTHON_EXPRESSION}
// >>

// << for {PYTHON_EXPRESSION}
// >>

// << while {PYTHON_EXPRESSION}
// >>

// #define LABEL {PYTHON_EXPRESSION}
// #include {PYTHON_EXPRESSION}

/* {{ {PYTHON_EXPRESSION} }} */
/* >>

<< */
"""

import collections
import os
import re


node_regex = re.compile(
    r'(?P<block_start>//\s*<<\s*(?P<block_kind>if|for|while)\s*(?P<block_expr>.+))|'
    r'(?P<block_else>//\s*--\s*else\s*)|'
    r'(?P<block_end>//\s*>>)|'

    r'(?P<define>//\s*#define\s*(?P<define_name>.+?)'
    r'(?P<define_args>\(.*\))?\s+(?P<define_expr>.+))|'

    r'(?P<include>//\s*#include\s*(?P<include_expr>.+))|'

    r'(?P<eval>/\*\s*\{\{(?P<eval_expr>.+?)\}\}\s*\*/)|'
    r'(?P<inline>\'\$\$(?P<inline_expr>.+)\$\$\')|'

    r'(?P<exec>/\*\s*<<(?P<exec_code>(.|\n)*)>>\s*\*/)')


class Context:
    def __init__(self, namespace=None):
        self.namespace = namespace or {}
        self.output = []

    def __setitem__(self, name, value):
        self.namespace[name] = value

    def __getitem__(self, name):
        return self.namespace[name]

    def emit(self, text):
        self.output.append(text)

    def eval(self, expr):
        return eval(expr, self.namespace)

    def exec(self, code):
        return exec(code, self.namespace)

    def include(self, path):
        old_file = self.namespace.get('__file__', '')
        old_directory = self.namespace.get('__directory__', '')
        self.namespace['__file__'] = os.path.join(old_directory, path)
        self.namespace['__directory__'] = os.path.dirname(self.namespace['__file__'])
        with open(self.namespace['__file__'], 'r') as input_file:
            root = parse(input_file.read())
        root.evaluate(self)
        self.namespace['__file__'] = old_file
        self.namespace['__directory__'] = old_directory


class Node:
    def evaluate(self, context):
        raise NotImplementedError()


class Block(Node):
    def __init__(self, expr=None):
        self.expr = expr
        self.children = []

    def append(self, item):
        self.children.append(item)

    def evaluate(self, context):
        for child in self.children:
            child.evaluate(context)


class Root(Block):
    pass


class If(Block):
    def __init__(self, expr=None):
        super().__init__(expr)
        self.alternative = None

    def evaluate(self, context):
        if context.eval(self.expr):
            super().evaluate(context)
        elif self.alternative:
            self.alternative.evaluate(context)


class Else(Block):
    pass


class For(Block):
    def evaluate(self, context):
        def iteration():
            super(For, self).evaluate(context)

        code = 'for {}: __for_{}__()'.format(self.expr, id(self))

        context['__for_{}__'.format(id(self))] = iteration
        context.exec(code)


class While(Block):
    def evaluate(self, context):
        while context.eval(self.expr):
            super().evaluate(context)


block_table = {'if': If, 'for': For, 'while': While}


class Define(Node):
    def __init__(self, name, args, expr):
        self.name = name
        self.args = args
        self.expr = expr

    def evaluate(self, context):
        if self.args:
            code = 'def {}{}: return {}'.format(self.name, self.args, self.expr)
            context.exec(code)
        else:
            context[self.name] = context.eval(self.expr)


class Include(Node):
    def __init__(self, expr):
        self.expr = expr

    def evaluate(self, context):
        context.include(context.eval(self.expr))


class Code(Node):
    def __init__(self, code):
        self.code = code

    def evaluate(self, context):
        context.emit(self.code)


class Eval(Node):
    def __init__(self, expr):
        self.expr = expr

    def evaluate(self, context):
        context.emit(str(context.eval(self.expr)))


class Exec(Node):
    def __init__(self, code):
        indentation = 0
        lines = code.splitlines()
        for line in lines:
            if not line.strip():
                continue
            indentation = len(line) - len(line.lstrip())
            break
        self.code = '\n'.join(map(lambda l: l[indentation:], lines))

    def evaluate(self, context):
        context.exec(self.code)


def parse_block_start(blocks, match):
    groups = match.groupdict()
    if len(blocks) < 1:
        raise Exception('block stack underflow at char {}'.format(match.start()))
    blocks.append(block_table[groups['block_kind']](groups['block_expr'].strip()))
    blocks[-2].append(blocks[-1])


def parse_block_else(blocks, _):
    if not isinstance(blocks[-1], If):
        raise Exception('else block outside of if block')
    if_block = blocks.pop()
    if_block.alternative = Else()
    blocks.append(if_block.alternative)


def parse_block_end(blocks, match):
    if len(blocks) <= 1:
        raise Exception('block stack underflow at char {}'.format(match.start()))
    blocks.pop()


def parse_define(blocks, match):
    groups = match.groupdict()
    name = groups['define_name'].strip()
    blocks[-1].append(Define(name, groups['define_args'], groups['define_expr'].strip()))


def parse_include(blocks, match):
    groups = match.groupdict()
    blocks[-1].append(Include(groups['include_expr'].strip()))


def parse_inline(blocks, match):
    groups = match.groupdict()
    blocks[-1].append(Eval(groups['inline_expr'].strip()))


def parse_eval(blocks, match):
    groups = match.groupdict()
    blocks[-1].append(Eval(groups['eval_expr'].strip()))


def parse_exec(blocks, match):
    groups = match.groupdict()
    blocks[-1].append(Exec(groups['exec_code']))


parse_table = {'block_start': parse_block_start, 'block_end': parse_block_end,
               'define': parse_define, 'include': parse_include, 'inline': parse_inline,
               'eval': parse_eval, 'exec': parse_exec, 'block_else': parse_block_else}


def parse(source):
    blocks = collections.deque([Root()])
    offset = 0
    for match in node_regex.finditer(source):
        blocks[-1].append(Code(source[offset:match.start()]))
        offset = match.end()
        parse_table[match.lastgroup](blocks, match)
    blocks[-1].append(Code(source[offset:]))
    if len(blocks) != 1:
        raise Exception('unbalanced block stack at EOF')
    return blocks[0]


def process(filename, namespace=None):
    context = Context(namespace)
    context.include(filename)
    return ''.join(context.output)
