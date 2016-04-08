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


var Frame = Class.extend({
    constructor: function (code, options) {
        this.code = code;

        options = options || {};

        this.back = options.back || null;

        this.locals = {};
        this.globals = options.globals || (this.back ? this.back.globals : {});
        this.builtins = options.builtins || (this.back ? this.back.builtins : builtins);

        this.state = options.state || 0;

        // << if ENABLE_THREADING
            this.thread = this.back ? this.back.thread : threading.thread;
        // >>

        // << if ENABLE_DEBUGGER
            this.debug_line = -1;
            this.debug_break = false;

            this.debug_step_over = false;
            this.debug_step_into = false;
            this.debug_step_out = false;

            this.debug_future = null;

            this.debug_internal = options.debug_internal || false;
        // >>
    }
});


var PythonFrame = Frame.extend({
    constructor: function (code, options) {
        var index;

        options = options || {};

        Frame.call(this, code, options);

        this.locals = options.locals || {};

        this.code.parse_args(options.args, options.kwargs, options.defaults, this.locals);

        this.namespace = options.namespace || null;

        this.stack = new Array(this.code.stacksize);
        this.level = 0;

        this.blocks = options.blocks || [];
        if (!this.blocks.length) {
            this.push_block(BLOCK_TYPES.BASE, 0);
        }

        this.position = options.position || 0;

        this.closure = options.closure || [];

        this.cells = {};
        for (index = 0; index < this.code.cellvars.length; index++) {
            this.cells[this.code.cellvars[index]] = new Cell();
        }
        for (index = 0; index < this.code.freevars.length; index++) {
            this.cells[this.code.freevars[index]] = this.closure[index];
        }

        this.why = null;
    },

    top_block: function () {
        return this.blocks[this.blocks.length - 1];
    },

    push_block: function (type, target) {
        this.blocks.push({
            type: type,
            position: this.position,
            target: target,
            active: false,
            level: this.level
        });
    },

    pop_block: function () {
        return this.blocks.pop();
    },

    pop: function () {
        return this.stack[--this.level];
    },

    popn: function (number) {
        this.level -= number;
        return this.stack.slice(this.level, this.level + number);
    },

    top0: function () {
        return this.stack[this.level - 1];
    },

    top1: function () {
        return this.stack[this.level - 2];
    },

    topn: function (number) {
        return this.stack.slice(this.level - number, this.level);
    },

    peek: function (number) {
        return this.stack[this.level - number];
    },

    push: function (item) {
        assert(item instanceof PyObject, 'tried to push non python object on stack');
        this.stack[this.level++] = item;
        if (this.level > this.code.stacksize) {
            error('stack overflow');
        }
    },

    set_state: function (state) {
        this.position--;
        this.state = state;
    },

    print_block_stack: function () {
        for (var index = 0; index < this.blocks.length; index++) {
            console.log('Block ' + index + ':', this.blocks[index]);
        }
    },

    unwind: function (cause) {
        if (cause != undefined) {
            this.why = cause;
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
            switch (this.why) {
                case CAUSES.BREAK:
                    if (block.type == BLOCK_TYPES.LOOP) {
                        this.position = block.target;
                        this.blocks.pop();
                        return;
                    } else {
                        this.blocks.pop();
                    }
                    break;
                case CAUSES.CONTINUE:
                    if (block.type == BLOCK_TYPES.LOOP) {
                        this.position = block.position;
                        return;
                    } else {
                        this.blocks.pop();
                    }
                    break;
                case CAUSES.EXCEPTION:
                    if (block.type == BLOCK_TYPES.EXCEPT) {
                        this.position = block.target;
                        block.active = true;
                        return;
                    } else if (block.type == BLOCK_TYPES.BASE) {
                        vm.frame = this.back;
                        // << if ENABLE_THREADING
                            if (!vm.frame) {
                                threading.finished();
                            }
                        // >>
                        return;
                    } else {
                        this.blocks.pop()
                    }
                    break;
                case CAUSES.RETURN:
                    if (block.type == BLOCK_TYPES.BASE) {
                        vm.frame = this.back;
                        // << if ENABLE_DEBUGGER
                            debugging.trace_return(this);
                        // >>
                        // << if ENABLE_THREADING
                            if (!vm.frame) {
                                threading.finished();
                            }
                        // >>
                        return;
                    } else {
                        this.blocks.pop();
                    }
                    break;
                default:
                    error('unknown unwind cause ' + this.why);
            }
        }
    },

    raise: function () {
        this.push(vm.last_exception.exc_tb);
        this.push(vm.last_exception.exc_value);
        this.push(vm.last_exception.exc_type);
        this.unwind(CAUSES.EXCEPTION);
    },

    get_line_number: function () {
        return this.code.get_line_number(this.position - 1);
    }
});


var NativeFrame = Frame.extend({
    constructor: function (code, options) {
        options = options || {};
        Frame.call(this, code, options);
        this.args = this.code.parse_args(options.args, options.kwargs, options.defaults);
    },

    get_line_number: function () {
        return this.state;
    }
});




$.Frame = Frame;
$.PythonFrame = PythonFrame;
$.NativeFrame = NativeFrame;
