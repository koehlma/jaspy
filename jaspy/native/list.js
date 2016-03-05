/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function PyList(initializer, size, cls) {
    PyObject.call(this, cls || py_list);
    this.array = new Array(4);
    if (initializer) {
        this.size = initializer.length;
    } else {
        this.size = size || 0;
    }
    this.grow();
    if (initializer) {
        for (var index = 0; index < initializer.length; index++) {
            this.array[index] = initializer[index];
        }
    }
}
PyList.prototype = new PyObject;
PyList.prototype.check = function (index) {
    if (index < 0) {
        index = this.size - index;
    }
    if (index < 0 || index > this.size - 1) {
        raise(IndexError, 'index out of range');
    }
    return index;
};
PyList.prototype.grow = function () {
    while (this.array.length <= this.size) {
        var length = this.array.length * 2;
        while (length <= this.size) {
            length *= 2;
        }
        this.array.length = length;
    }
};
PyList.prototype.shrink = function () {
    if (this.array.length > 4 && this.array.length / 4 >= this.size) {
        var length = this.array.length / 2;
        while (length / 4 >= this.size && length > 4) {
            length /= 2;
        }
        this.array.length = length;
    }
};
PyList.prototype.get = function (index) {
    index = this.check(index);
    return this.array[index] || None;
};
PyList.prototype.set = function (index, item) {
    index = this.check(index);
    return this.array[index] = item;
};
PyList.prototype.append = function (item) {
    this.size++;
    this.grow();
    this.array[this.size - 1] = item;
    return item;
};
PyList.prototype.pop = function (index) {
    index = this.check(index);
    this.size--;
    if (index == null) {
        index = this.size;
    }
    var item = this.array[index];
    for (; index < this.size; index++) {
        this.array[index] = this.array[index + 1];
    }
    this.array[index] = null;
    this.shrink();
    return item;
};
PyList.prototype.clear = function () {
    this.array = new Array(4);
    this.size = 0;
};
PyList.prototype.slice = function (start, stop, step) {
    var index, list = new PyList();
    if (start == undefined) {
        start = 0;
    } else if (start < 0) {
        start = this.size + start;
    }
    if (stop == undefined) {
        stop = this.size;
    } else if (stop < 0) {
        stop = this.size + stop;
    }
    step = step || 1;
    if (step > 0) {
        if (start < 0) {
            start = 0;
        }
        if (stop > this.size) {
            stop = this.size;
        }
        for (index = start; index < stop; index += step) {
            list.append(this.array[index]);
        }
    } else if (step < 0) {
        if (start >= this.size) {
            start = this.size - 1;
        }
        if (stop < 0) {
            stop = 0;
        }
        for (index = start; index > stop; index += step) {
            list.append(this.array[index]);
        }
    } else {
        raise(ValueError, 'slice step cannot be zero')
    }
    return list;
};
PyList.prototype.concat = function (list_or_array) {
    var list, index, size;
    if (list_or_array instanceof PyList) {
        size = list_or_array.size;
        list_or_array = list_or_array.array;
    } else if (list_or_array instanceof Array) {
        size = list_or_array.length;
    } else {
        raise(TypeError, 'invalid type of concatenation object');
    }
    list = new PyList(null, this.size + size);
    for (index = 0; index < this.size; index++) {
        list.array[index] = this.array[index];
    }
    for (index = 0; index < size; index++) {
        list.array[index + this.size] = list_or_array[index];
    }
    return list;
};
PyList.prototype.copy = function () {
    return this.concat([]);
};