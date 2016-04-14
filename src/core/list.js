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


var List = $Class('list', {
    constructor: function (initializer, size, cls) {
        PyObject.call(this, cls || List.cls);
        this.value = new Array(4);
        if (initializer) {
            if (!(initializer instanceof Array)) {
                raise(TypeError, 'invalid type of list initializer');
            }
            this.size = initializer.length;
        } else {
            this.size = size || 0;
        }
        this.grow();
        if (initializer) {
            for (var index = 0; index < initializer.length; index++) {
                this.value[index] = initializer[index];
            }
        }
    },

    check: function (index) {
        if (index < 0) {
            index = this.size - index;
        }
        if (index < 0 || index > this.size - 1) {
            raise(IndexError, 'index out of range');
        }
        return index;
    },

    grow: function () {
        while (this.value.length <= this.size) {
            var length = this.value.length * 2;
            while (length <= this.size) {
                length *= 2;
            }
            this.value.length = length;
        }
    },

    shrink: function () {
        if (this.value.length > 4 && this.value.length / 4 >= this.size) {
            var length = this.value.length / 2;
            while (length / 4 >= this.size && length > 4) {
                length /= 2;
            }
            this.value.length = length;
        }
    },

    get: function (index) {
        index = this.check(index);
        return this.value[index] || None;
    },

    set: function (index, item) {
        index = this.check(index);
        return this.value[index] = item;
    },

    append: function (item) {
        this.size++;
        this.grow();
        this.value[this.size - 1] = item;
        return item;
    },

    pop: function (index) {
        index = this.check(index);
        this.size--;
        if (index == null) {
            index = this.size;
        }
        var item = this.value[index];
        for (; index < this.size; index++) {
            this.value[index] = this.value[index + 1];
        }
        this.value[index] = null;
        this.shrink();
        return item;
    },

    clear: function () {
        this.value = new Array(4);
        this.size = 0;
    },

    slice: function (start, stop, step) {
        var index, list = new List();
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
                list.append(this.value[index]);
            }
        } else if (step < 0) {
            if (start >= this.size) {
                start = this.size - 1;
            }
            if (stop < 0) {
                stop = 0;
            }
            for (index = start; index > stop; index += step) {
                list.append(this.value[index]);
            }
        } else {
            raise(ValueError, 'slice step cannot be zero')
        }
        return list;
    },

    concat: function (list_or_array) {
        var list, index, size;
        if (list_or_array instanceof List) {
            size = list_or_array.size;
            list_or_array = list_or_array.value;
        } else if (list_or_array instanceof Array) {
            size = list_or_array.length;
        } else {
            raise(TypeError, 'invalid type of concatenation object');
        }
        list = new List(null, this.size + size);
        for (index = 0; index < this.size; index++) {
            list.value[index] = this.value[index];
        }
        for (index = 0; index < size; index++) {
            list.value[index + this.size] = list_or_array[index];
        }
        return list;
    },

    copy: function () {
        return this.concat([]);
    }
});


$.List = List;
