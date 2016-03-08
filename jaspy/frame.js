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

function Frame(code, options) {
    this.code = code;

    options = options || {};

    this.back = options.back || null;

    this.globals = options.globals || (this.back ? this.back.globals : {});
    this.builtins = options.builtins || (this.back ? this.back.builtins : builtins);

    this.position = options.position || 0;
}

Frame.prototype.get_line_number = function () {
    return this.code.get_line_number(this.position);
};


function PythonFrame(code, options) {
    var index;

    options = options || {};

    Frame.call(this, code, options);

    this.locals = options.locals || {};
    this.code.parse_args(options.args, options.kwargs, options.defaults, this.locals);

    this.namespace = options.namespace || null;

    this.stack = new Array(this.code.stacksize);
    this.level = 0;

    this.blocks = options.blocks || [];
    if (!options.blocks) {
        this.push_block(BLOCK_TYPES.BASE, 0);
    }

    this.state = options.state || 0;

    this.closure = options.closure || [];

    this.cells = {};
    for (index = 0; index < this.code.cellvars.length; index++) {
        this.cells[this.code.cellvars[index]] = new PyCell();
    }
    for (index = 0; index < this.code.freevars.length; index++) {
        this.cells[this.code.freevars[index]] = this.closure[index];
    }

    this.unwind_cause = null;

    this.previous = 0;
}
PythonFrame.prototype = new Frame;
PythonFrame.prototype.top_block = function () {
    return this.blocks[this.blocks.length - 1];
};
PythonFrame.prototype.push_block = function (type, target) {
    this.blocks.push({
        type: type,
        position: this.position,
        target: target,
        active: false,
        level: this.level
    });
};
PythonFrame.prototype.pop_block = function () {
    return this.blocks.pop();
};
PythonFrame.prototype.pop = function () {
    return this.stack[--this.level];
};
PythonFrame.prototype.popn = function (number) {
    this.level -= number;
    return this.stack.slice(this.level, this.level + number);
};
PythonFrame.prototype.top0 = function () {
    return this.stack[this.level - 1];
};
PythonFrame.prototype.top1 = function () {
    return this.stack[this.level - 2];
};
PythonFrame.prototype.topn = function (number) {
    return this.stack.slice(this.level - number, this.level);
};
PythonFrame.prototype.push = function (item) {
    assert(item instanceof PyObject);
    this.stack[this.level++] = item;
    if (this.level > this.code.stacksize) {
        error('stack overflow');
    }
};

PythonFrame.prototype.set_state = function (state) {
    this.position--;
    this.state = state;
};
PythonFrame.prototype.reset_state = function () {
    this.state = 0;
};

PythonFrame.prototype.print_block_stack = function () {
    for (var index = 0; index < this.blocks.length; index++) {
        console.log('Block ' + index + ':', this.blocks[index]);
    }
};

PythonFrame.prototype.unwind = function (cause) {
    if (cause != undefined) {
        this.unwind_cause = cause;
    }
    while (this.blocks.length > 0) {
        var block = this.blocks[this.blocks.length - 1];
        if (block.active) {
            this.blocks.pop();
            continue;
        }
        if (block.type == BLOCK_TYPES.FINALLY) {
            this.position = block.target;
            block.active = true;
            return;
        }
        switch (this.unwind_cause) {
            case UNWIND_CAUSES.BREAK:
                if (block.type == BLOCK_TYPES.LOOP) {
                    this.position = block.target;
                    this.blocks.pop();
                    return;
                } else {
                    this.blocks.pop();
                }
                break;
            case UNWIND_CAUSES.CONTINUE:
                if (block.type == BLOCK_TYPES.LOOP) {
                    this.position = block.position;
                    return;
                } else {
                    this.blocks.pop();
                }
                break;
            case UNWIND_CAUSES.EXCEPTION:
                if (block.type == BLOCK_TYPES.EXCEPT) {
                    this.position = block.target;
                    block.active = true;
                    return;
                } else if (block.type == BLOCK_TYPES.BASE) {
                    vm.frame = this.back;
                    return;
                } else {
                    this.blocks.pop()
                }
                break;
            case UNWIND_CAUSES.RETURN:
                if (block.type == BLOCK_TYPES.BASE) {
                    vm.frame = this.back;
                    return;
                } else {
                    this.blocks.pop();
                }
                break;
            default:
                error('unknown unwind cause ' + this.unwind_cause);
        }
    }
};
PythonFrame.prototype.raise = function () {
    this.push(vm.last_exception.exc_tb);
    this.push(vm.last_exception.exc_value);
    this.push(vm.last_exception.exc_type);
    this.unwind(UNWIND_CAUSES.EXCEPTION);
};
PythonFrame.prototype.get_line_number = function () {
    return this.code.get_line_number(this.previous);
};


function NativeFrame(code, options) {
    options = options || {};

    Frame.call(this, code, options);

    this.args = this.code.parse_args(options.args, options.kwargs, options.defaults);
}
NativeFrame.prototype = new Frame;
NativeFrame.prototype.run = function () {
    assert(!this.code.simple);
    var result;
    try {
        result = this.code.func.apply(null, this.args.concat([this.position, this]));
    } catch (error) {
        if (error instanceof PyObject) {
            raise(error.cls, error);
            vm.frame = this.back;
            return;
        }
        throw error;
    }
    if (result == undefined || result instanceof PyObject) {
        if (result instanceof PyObject && vm.return_value) {
            vm.return_value = result;
        }
        vm.frame = this.back;
    } else {
        this.position = result;
        return true;
    }
};
NativeFrame.prototype.store = function (name, value) {
    this[name] = value;
};
NativeFrame.prototype.load = function (name) {
    return this[name];
};