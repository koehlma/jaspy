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


def dict_new(cls):
    self = super(dict, cls).__new__(cls)
    self.__js_object__ = __js_object__()


def dict_getitem(self, key):
    key_hash = hash(key)
    bucket = self.__js_object__[str(key_hash)]
    for item in bucket:
        if item[0] == key:
            return item[1]


dict.__new__ = dict_new
dict.__getitem__ = dict_getitem
