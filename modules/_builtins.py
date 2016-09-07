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
Implementation of non-trivial Python builtin functions.

https://docs.python.org/3/library/functions.html
"""


NULL = object()


def all(iterable):
    for element in iterable:
        if not element:
            return False
    return True


def any(iterable):
    for element in iterable:
        if element:
            return True
    return False


def next(iterator, default=NULL):
    if default is NULL:
        return iterator.__next__()
    else:
        try:
            return iterator.__next__()
        except StopIteration:
            return default


def _counter(start=0):
    while True:
        yield start
        start += 1


def enumerate(iterable, start=0):
    return zip(_counter(start), iterable)


def filter(function, iterable):
    if function is None:
        return (item for item in iterable if item)
    else:
        return (item for item in iterable if function(item))


def map(function, *iterables):
    return (function(*args) for args in zip(*iterables))


def pow(x, y, z=None):
    return x ** y if z is None else (x ** y) % z


def sum(iterable, start=0):
    for item in iterable:
        start += item
    return start


def zip(*iterables):
    iterators = [iter(iterable) for iterable in iterables]
    while iterators:
        result = []
        for iterator in iterators:
            try:
                result.append(iterator.__next__())
            except StopIteration:
                return
        yield tuple(result)
