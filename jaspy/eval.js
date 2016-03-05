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

PythonFrame.prototype.step = function () {
    var slot, right, left, name, value, block, exc_type, exc_value, exc_tb, temp;
    var low, mid, high, args, kwargs, index, code, defaults, globals, func;
    var instruction = this.fetch();
    if (DEBUG) {
        console.log('executing instruction', instruction);
    }
    switch (instruction.opcode) {
        case OPCODES.NOP:
            break;

        case OPCODES.POP_TOP:
            this.pop();
            break;
        case OPCODES.ROT_TWO:
            temp = this.popn(2);
            this.push(temp[1]);
            this.push(temp[0]);
            break;
        case OPCODES.ROT_THREE:
            temp = this.popn(3);
            this.push(temp[2]);
            this.push(temp[1]);
            this.push(temp[0]);
            break;
        case OPCODES.DUP_TOP:
            this.push(this.top0());
            break;
        case OPCODES.DUP_TOP_TWO:
            this.push(this.top1());
            this.push(this.top1());
            break;

        case OPCODES.GET_YIELD_FROM_ITER:
            if (this.state === 0 && isiterable(this.top0())) {
                break;
            }
        case OPCODES.UNARY_POSITIVE:
        case OPCODES.UNARY_NEGATIVE:
        case OPCODES.UNARY_NOT:
        case OPCODES.UNARY_INVERT:
        case OPCODES.GET_ITER:
            switch (this.state) {
                case 0:
                    if (this.pop().call_method(OPCODES_EXTRA[instruction.opcode])) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                        raise(TypeError, 'unsupported operand type');
                        this.raise();
                    } else if (vm.return_value) {
                        this.push(vm.return_value);
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.BINARY_POWER:
        case OPCODES.BINARY_MULTIPLY:
        case OPCODES.BINARY_MATRIX_MULTIPLY:
        case OPCODES.BINARY_FLOOR_DIVIDE:
        case OPCODES.BINARY_TRUE_DIVIDE:
        case OPCODES.BINARY_MODULO:
        case OPCODES.BINARY_ADD:
        case OPCODES.BINARY_SUBTRACT:
        case OPCODES.BINARY_SUBSCR:
        case OPCODES.BINARY_LSHIFT:
        case OPCODES.BINARY_RSHIFT:
        case OPCODES.BINARY_AND:
        case OPCODES.BINARY_XOR:
        case OPCODES.BINARY_OR:
            switch (this.state) {
                case 0:
                    slot = OPCODES_EXTRA[instruction.opcode];
                    right = this.top0();
                    left = this.top1();
                    if (left.call_method('__' + slot + '__', [right])) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                        slot = OPCODES_EXTRA[instruction.opcode];
                        right = this.pop();
                        left = this.pop();
                        if (right.call_method('__r' + slot + '__', [left])) {
                            this.state = 2;
                            this.position--;
                        }
                    } else if (vm.return_value) {
                        this.popn(2);
                        this.push(vm.return_value);
                        break;
                    } else {
                        this.popn(2);
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                        raise(TypeError, 'unsupported operand type');
                        this.raise();
                    } else if (vm.return_value) {
                        this.push(vm.return_value);
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.INPLACE_POWER:
        case OPCODES.INPLACE_MULTIPLY:
        case OPCODES.INPLACE_MATRIX_MULTIPLY:
        case OPCODES.INPLACE_FLOOR_DIVIDE:
        case OPCODES.INPLACE_TRUE_DIVIDE:
        case OPCODES.INPLACE_MODULO:
        case OPCODES.INPLACE_ADD:
        case OPCODES.INPLACE_SUBTRACT:
        case OPCODES.INPLACE_LSHIFT:
        case OPCODES.INPLACE_RSHIFT:
        case OPCODES.INPLACE_AND:
        case OPCODES.INPLACE_XOR:
        case OPCODES.INPLACE_OR:
        case OPCODES.DELETE_SUBSCR:
            switch (this.state) {
                case 0:
                    slot = OPCODES_EXTRA[instruction.opcode];
                    right = this.pop();
                    left = this.pop();
                    if (left.call_method(slot, [right])) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                        raise(TypeError, 'unsupported operand type');
                        this.raise();
                    } else if (vm.return_value) {
                        if (instruction.opcode != OPCODES.DELETE_SUBSCR) {
                            this.push(vm.return_value);
                        }
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.STORE_SUBSCR:
            switch (this.state) {
                case 0:
                    name = this.pop();
                    left = this.pop();
                    right = this.pop();
                    if (left.call_method('__setitem__', [name, right])) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                        raise(TypeError, 'unsupported operand type');
                        this.raise();
                    } else if (!vm.return_value) {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.PRINT_EXPR:
            console.log(this.pop());
            break;

        case OPCODES.BREAK_LOOP:
            this.unwind(UNWIND_CAUSES.BREAK);
            break;

        case OPCODES.CONTINUE_LOOP:
            this.unwind(UNWIND_CAUSES.CONTINUE);
            break;

        case OPCODES.SET_ADD:
            error('opcode not implemented');
            break;

        case OPCODES.LIST_APPEND:
            error('opcode not implemented');
            break;

        case OPCODES.MAP_ADD:
            error('opcode not implemented');
            break;

        case OPCODES.RETURN_VALUE:
            vm.return_value = this.pop();
            this.unwind(UNWIND_CAUSES.RETURN);
            break;

        case OPCODES.YIELD_VALUE:
            error('opcode not implemented');
            vm.return_value = this.pop();
            vm.frame = this.back;
            break;

        case OPCODES.YIELD_FROM:
            error('opcode not implemented');
            break;

        case OPCODES.POP_BLOCK:
            this.blocks.pop();
            break;

        case OPCODES.POP_EXCEPT:
            block = this.blocks.pop();
            assert(block.type === BLOCK_TYPES.EXCEPT);
            while (this.stack.length > block.level + 3) {
                this.pop();
            }
            if (this.stack.length == block.level + 3) {
                exc_type = this.pop();
                exc_value = this.pop();
                exc_tb = this.pop();
                raise(exc_type, exc_value, exc_tb);
            } else {
                vm.return_value = None;
            }
            break;

        case OPCODES.END_FINALLY:
            this.unwind();
            break;

        case OPCODES.LOAD_BUILD_CLASS:
            this.push(build_class);
            break;

        case OPCODES.SETUP_WITH:
            error('opcode not implemented');
            break;

        case OPCODES.WITH_CLEANUP_START:
            error('opcode not implemented');
            break;

        case OPCODES.WITH_CLEANUP_FINISH:
            error('opcode not implemented');
            break;

        case OPCODES.STORE_FAST:
        case OPCODES.DELETE_FAST:
        case OPCODES.STORE_NAME:
        case OPCODES.DELETE_NAME:
            if (instruction.opcode === OPCODES.STORE_FAST) {
                name = this.code.varnames[instruction.argument];
                instruction.opcode = OPCODES.STORE_NAME;
            } else if (instruction.opcode === OPCODES.DELETE_FAST) {
                name = this.code.varnames[instruction.argument];
                instruction.opcode = OPCODES.DELETE_NAME;
            } else {
                name = this.code.names[instruction.argument];
            }
            if (this.namespace) {
                switch (this.state) {
                    case 0:
                        if (instruction.opcode === OPCODES.STORE_NAME) {
                            slot = '__setitem__';
                            args = [pack_str(name), this.pop()];
                        } else {
                            slot = '__delitem__';
                            args = [pack_str(name)];
                        }
                        if (this.namespace.call_method(slot, args)) {
                            this.state = 1;
                            this.position -= 3;
                            break;
                        }
                    case 1:
                        this.state = 0;
                        if (except(MethodNotFoundError)) {
                            raise(TypeError, 'invalid namespace');
                            this.raise();
                        } else if (!vm.return_value) {
                            this.raise();
                        }
                        break;
                }
            } else {
                if (instruction.opcode === OPCODES.STORE_NAME) {
                    this.locals[name] = this.pop();
                } else if (name in this.locals) {
                    delete this.locals[name];
                } else {
                    raise(NameError, 'name \'' + name + '\' is not defined');
                    this.raise();
                }
            }
            break;

        case OPCODES.LOAD_FAST:
        case OPCODES.LOAD_NAME:
            if (instruction.opcode === OPCODES.LOAD_FAST) {
                name = this.code.varnames[instruction.argument];
            } else {
                name = this.code.names[instruction.argument];
            }
            if (this.namespace) {
                switch (this.state) {
                    case 0:
                        if (this.namespace.call_method('__getitem__', [pack_str(name)])) {
                            this.state = 1;
                            this.position -= 3;
                        }
                    case 1:
                        this.state = 0;
                        if (vm.return_value) {
                            this.push(vm.return_value);
                        } else if (except(MethodNotFoundError) || except(KeyError)) {
                            if (name in this.globals) {
                                this.push(this.globals[name]);
                            } else if (name in this.builtins) {
                                this.push(this.builtins[name]);
                            } else {
                                raise(NameError, 'name \'' + name + '\' is not defined');
                                this.raise();
                            }
                        } else {
                            this.raise();
                        }
                        break;
                }
            } else {
                if (name in this.locals) {
                    this.push(this.locals[name]);
                } else if (name in this.globals) {
                    this.push(this.globals[name]);
                } else if (name in this.builtins) {
                    this.push(this.builtins[name]);
                } else {
                    raise(NameError, 'name \'' + name + '\' is not defined');
                    this.raise();
                }
            }
            break;

        case OPCODES.STORE_GLOBAL:
            name = this.code.names[instruction.argument];
            this.globals[name] = this.pop();
            break;

        case OPCODES.DELETE_GLOBAL:
            name = this.code.names[instruction.argument];
            if (name in this.globals) {
                delete this.globals[name];
            } else {
                raise(NameError, 'name \'' + name + '\' is not defined');
                this.raise();
            }
            break;

        case OPCODES.LOAD_GLOBAL:
            name = this.code.names[instruction.argument];
            if (name in this.globals) {
                this.push(this.globals[name]);
            } else if (name in this.builtins) {
                this.push(this.builtins[name]);
            } else {
                raise(NameError, 'name \'' + name + '\' is not defined');
                this.raise();
            }
            break;

        case OPCODES.STORE_ATTR:
        case OPCODES.DELETE_ATTR:
            name = this.code.names[instruction.argument];
            switch (this.state) {
                case 0:
                    temp = this.pop();
                    if (instruction.opcode === OPCODES.STORE_ATTR) {
                        slot = '__setattr__';
                        args = [pack_str(name), this.pop()];
                    } else {
                        slot = '__delattr__';
                        args = [pack_str(name)];
                    }
                    if (temp.call_method(slot, args)) {
                        this.state = 1;
                        this.position -= 3;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        if (instruction.opcode === OPCODES.STORE_ATTR) {
                            raise(TypeError, 'object does not support attribute assignment');
                        } else {
                            raise(TypeError, 'object does not support attribute deletion');
                        }
                        this.raise();
                    } else if (!vm.return_value) {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.LOAD_ATTR:
            name = this.code.names[instruction.argument];
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__getattribute__', [pack_str(name)])) {
                        this.state = 1;
                        this.position -= 3;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value) {
                        this.pop();
                        this.push(vm.return_value);
                        break;
                    }
                    if (except(AttributeError) || except(MethodNotFoundError)) {
                        if (this.pop().call_method('__getattr__', [pack_str(name)])) {
                            this.state = 2;
                            this.position -= 3;
                            break;
                        }
                    } else {
                        this.pop();
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        raise(TypeError, 'object does not support attribute access');
                        this.raise();
                    } else if (vm.return_value) {
                        this.push(vm.return_value);
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.UNPACK_SEQUENCE:
            error('opcode not implemented');
            break;

        case OPCODES.UNPACK_EX:
            error('opcode not implemented');
            break;

        case OPCODES.BUILD_TUPLE:
            this.push(pack_tuple(this.popn(instruction.argument)));
            break;

        case OPCODES.BUILD_LIST:
            this.push(pack_list(this.popn(instruction.argument)));
            break;

        case OPCODES.BUILD_SET:
            error('opcode not implemented');
            break;

        case OPCODES.BUILD_MAP:
            this.push(new PyDict());
            break;

        case OPCODES.IMPORT_NAME:
            name = this.code.names[instruction.argument];
            this.popn(2);
            if (name in modules) {
                this.push(new PyModule(modules[name].namespace));
            } else {
                raise(ImportError);
                this.raise();
            }
            break;

        case OPCODES.IMPORT_STAR:
            error('opcode not implemented');
            break;

        case OPCODES.IMPORT_FROM:
            error('opcode not implemented');
            break;

        case OPCODES.JUMP_FORWARD:
            this.position += instruction.argument;
            break;

        case OPCODES.JUMP_ABSOLUTE:
            this.position = instruction.argument;
            break;

        case OPCODES.COMPARE_OP:
            switch (instruction.argument) {
                case COMPARE_OPS.EXC:
                    exc_type = this.pop();
                    this.push(this.pop().is_subclass_of(exc_type) ? True : False);
                    break;
                case COMPARE_OPS.LT:
                case COMPARE_OPS.LE:
                case COMPARE_OPS.GT:
                case COMPARE_OPS.GE:
                case COMPARE_OPS.EQ:
                case COMPARE_OPS.NE:
                    switch (this.state) {
                        case 0:
                            slot = COMPARE_SLOTS[instruction.argument];
                            right = this.pop();
                            left = this.pop();
                            if (left.call_method(slot, [right])) {
                                this.state = 1;
                                this.position -= 3;
                                break;
                            }
                        case 1:
                            if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                                raise(TypeError, 'unsupported boolean operator');
                                this.raise();
                            } else if (vm.return_value) {
                                this.push(vm.return_value);
                            } else {
                                this.raise();
                            }
                            break;
                    }
                    break;

                case COMPARE_OPS.IS:
                case COMPARE_OPS.NIS:
                default:
                    error('unsupported comparison operator');
            }
            break;

        case OPCODES.POP_JUMP_IF_TRUE:
            if (this.top0().cls === py_int) {
                if (this.pop().bool()) {
                    this.position = instruction.argument;
                }
                break;
            }
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__bool__')) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        if (this.top0().call_method('__len__')) {
                            this.state = 2;
                            this.position--;
                            break;
                        }
                    } else if (!vm.return_value) {
                        this.pop();
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    this.pop();
                    if (except(MethodNotFoundError)) {
                        this.position = instruction.argument;
                    } else if (vm.return_value) {
                        if (vm.return_value instanceof PyInt) {
                            if (vm.return_value.bool()) {
                                this.position = instruction.argument;
                            }
                        } else {
                            raise(TypeError, 'invalid result type of boolean conversion');
                            this.raise();
                        }
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.POP_JUMP_IF_FALSE:
            if (this.top0().cls === py_bool || this.top0().cls === py_int) {
                if (!this.pop().bool()) {
                    this.position = instruction.argument;
                }
                break;
            }
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__bool__')) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        if (this.top0().call_method('__len__')) {
                            this.state = 2;
                            this.position--;
                            break;
                        }
                    } else if (!vm.return_value) {
                        this.pop();
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    this.pop();
                    if (!except(MethodNotFoundError)) {
                        if (vm.return_value instanceof PyInt) {
                            if (!vm.return_value.bool()) {
                                this.position = instruction.argument;
                            }
                        } else if (vm.return_value) {
                            raise(TypeError, 'invalid result type of boolean conversion');
                            this.raise();
                        } else {
                            this.raise();
                        }
                    }
                    break;
            }
            break;

        case OPCODES.JUMP_IF_TRUE_OR_POP:
            if (this.top0().cls === py_int) {
                if (this.top0().bool()) {
                    this.position = instruction.argument;
                } else {
                    this.pop();
                }
                break;
            }
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__bool__')) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        if (this.top0().call_method('__len__')) {
                            this.state = 2;
                            this.position--;
                            break;
                        }
                    } else if (!vm.return_value) {
                        this.pop();
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        this.position = instruction.argument;
                    } else if (vm.return_value) {
                        if (vm.return_value instanceof PyInt) {
                            if (vm.return_value.bool()) {
                                this.position = instruction.argument;
                            } else {
                                this.pop();
                            }
                        } else {
                            this.pop();
                            raise(TypeError, 'invalid result type of boolean conversion');
                            this.raise();
                        }
                    } else {
                        this.pop();
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.JUMP_IF_FALSE_OR_POP:
            if (this.top0().cls === py_int) {
                if (!this.top0().bool()) {
                    this.position = instruction.argument;
                } else {
                    this.pop();
                }
                break;
            }
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__bool__')) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        if (this.top0().call_method('__len__')) {
                            this.state = 2;
                            this.position--;
                            break;
                        }
                    } else if (!vm.return_value) {
                        this.pop();
                        this.raise();
                        break;
                    }
                case 2:
                    this.state = 0;
                    if (!except(MethodNotFoundError)) {
                        if (vm.return_value instanceof PyInt) {
                            if (!vm.return_value.bool()) {
                                this.position = instruction.argument;
                            } else {
                                this.pop();
                            }
                        } else if (vm.return_value) {
                            this.pop();
                            raise(TypeError, 'invalid result type of boolean conversion');
                            this.raise();
                        } else {
                            this.pop();
                            this.raise();
                        }
                    }
                    break;
            }
            break;

        case OPCODES.FOR_ITER:
            switch (this.state) {
                case 0:
                    if (this.top0().call_method('__next__')) {
                        this.state = 1;
                        this.position--;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (except(MethodNotFoundError)) {
                        this.pop();
                        raise(TypeError, 'object does not support iteration');
                        this.raise();
                    } else if (except(StopIteration)) {
                        this.pop();
                        this.position += instruction.argument;
                    } else if (vm.return_value) {
                        this.push(vm.return_value);
                    } else {
                        this.pop();
                        this.raise();
                    }
                    break;
            }
            break;


        case OPCODES.SETUP_LOOP:
        case OPCODES.SETUP_EXCEPT:
        case OPCODES.SETUP_FINALLY:
            temp = OPCODES_EXTRA[instruction.opcode];
            this.push_block(temp, instruction.argument);
            break;

        case OPCODES.LOAD_CLOSURE:
            if (instruction.argument < this.code.cellvars.length) {
                this.push(this.cells[this.code.cellvars[instruction.argument]]);
            } else {
                this.push(this.cells[this.code.freevars[instruction.argument]]);
            }
            break;

        case OPCODES.LOAD_DEREF:
            if (instruction.argument < this.code.cellvars.length) {
                this.push(this.cells[this.code.cellvars[instruction.argument]].get());
            } else {
                this.push(this.cells[this.code.freevars[instruction.argument]].get());
            }
            break;

        case OPCODES.LOAD_CLASSDEREF:
            error('opcode not implemented');
            break;

        case OPCODES.STORE_DEREF:
            if (instruction.argument < this.code.cellvars.length) {
                this.cells[this.code.cellvars[instruction.argument]].set(this.pop());
            } else {
                error('load free variable closure not implemented');
            }
            break;

        case OPCODES.DELETE_DEREF:
            error('opcode not implemented');
            break;

        case OPCODES.RAISE_VARARGS:
            if (instruction.argument != 1) {
                error('unsupported raise format');
            }
            exc_value = this.pop();
            raise(exc_value.cls, exc_value);
            this.raise();
            break;

        case OPCODES.LOAD_CONST:
            this.push(this.code.constants[instruction.argument]);
            break;

        case OPCODES.CALL_FUNCTION:
            switch (this.state) {
                case 0:
                    low = instruction.argument & 0xFF;
                    high = instruction.argument >> 8;
                    kwargs = {};
                    for (index = 0; index < high; index++) {
                        value = this.pop();
                        kwargs[this.pop().value] = value;
                    }
                    args = this.popn(low);
                    if (call_object(this.pop(), args, kwargs)) {
                        this.state = 1;
                        this.position -= 3;
                        break;
                    }
                case 1:
                    this.state = 0;
                    if (vm.return_value) {
                        this.push(vm.return_value);
                    } else {
                        this.raise();
                    }
                    break;
            }
            break;

        case OPCODES.CALL_FUNCTION_VAR:
            error('opcode is not supported');
            break;

        case OPCODES.CALL_FUNCTION_KW:
            error('opcode is not supported');
            break;

        case OPCODES.CALL_FUNCTION_VAR_KW:
            error('opcode is not supported');
            break;

        case OPCODES.MAKE_FUNCTION:
        case OPCODES.MAKE_CLOSURE:
            low = instruction.argument & 0xFF;
            mid = (instruction.argument >> 8) & 0xFF;
            high = (instruction.argument >> 16) & 0x7FFF;
            name = this.pop();
            code = this.pop();
            if (high) {
                error('annotations not supported');
            }
            defaults = {};
            for (index = 0; index < mid; index++) {
                value = this.pop();
                defaults[this.pop().value] = value;
            }
            for (index = 0; index < low; index++) {
                defaults[code.value.signature.argnames[index]] = this.pop();
            }
            globals = this.globals;
            func = new PyObject(py_function);
            func.namespace['__name__'] = pack_str(name);
            func.namespace['__code__'] = code;
            func.defaults = defaults;
            if (instruction.opcode == OPCODES.MAKE_CLOSURE) {
                func.namespace['__closure__'] = this.pop();
            }
            this.push(func);
            break;

        case OPCODES.BUILD_SLICE:
            error('opcode is not supported');
            break;

        default:
            error('unknown opcode ' + instruction.opcode);
            break;
    }
};
