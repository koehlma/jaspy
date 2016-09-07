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


/* <<
import opcode
>> */

// << if DEBUG_INSTRUCTIONS
    var OP_NAMES = {};
    // << for name, code in opcode.opmap.items()
        OP_NAMES['$$code$$'] = '/* {{ name }} */';
    // >>
// >>


PythonFrame.prototype.execute = function() {
    var slot, right, left, name, key, value, block, exc_type, exc_value, exc_tb, temp;
    var low, mid, high, args, kwargs, index, code, defaults, globals, func, instruction;

    while (vm.frame === this) {
        if (!vm.return_value && this.why != CAUSES.EXCEPTION && this.state == 0) {
            this.raise();
        }

        // << if ENABLE_THREADING
            if (threading.step()) {
                return;
            }
        // >>

        // << if ENABLE_DEBUGGER
            var line = this.get_line_number();
            if (line != this.debug_line) {
                debugging.trace_line(this, line);
                this.debug_line = line;
            }

            if (debugging.step()) {
                return;
            }
        // >>

        instruction = this.code.instructions[this.position++];

        // << if DEBUG_INSTRUCTIONS
            console.log('[execute] executing instruction ' + OP_NAMES[instruction.opcode] + '(' + instruction.argument + ') at position ' + instruction.position + ' with state ' + this.state + ' in ' + this.code.name+ '[' + this.code.filename + ']');
        // >>

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
                        if (this.pop().call(OPCODES_EXTRA[instruction.opcode])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type (unary operator)');
                        } else if (vm.return_value) {
                            this.push(vm.return_value);
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
                        if (left.call('__' + slot + '__', [right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            slot = OPCODES_EXTRA[instruction.opcode];
                            right = this.pop();
                            left = this.pop();
                            if (right.call('__r' + slot + '__', [left])) {
                                return 2;
                            }
                        } else {
                            this.popn(2);
                            if (vm.return_value) {
                                this.push(vm.return_value);
                            }
                            break;
                        }
                    case 2:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type (binary operator)');
                        } else if (vm.return_value) {
                            this.push(vm.return_value);
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
                        right = this.pop();
                        left = this.pop();
                        if (left.call(OPCODES_EXTRA[instruction.opcode], [right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type (inplace operator)');
                        } else if (vm.return_value && instruction.opcode != OPCODES.DELETE_SUBSCR) {
                            this.push(vm.return_value);
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
                        if (left.call('__setitem__', [name, right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type (setitem)');
                        }
                        break;
                }
                break;

            case OPCODES.PRINT_EXPR:
                console.log(this.pop());
                break;

            case OPCODES.BREAK_LOOP:
                this.unwind(CAUSES.BREAK);
                break;

            case OPCODES.CONTINUE_LOOP:
                this.unwind(CAUSES.CONTINUE);
                break;

            case OPCODES.SET_ADD:
                switch (this.state) {
                    case 0:
                        value = this.pop();
                        if (this.peek(instruction.argument).call('add', [value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.LIST_APPEND:
                switch (this.state) {
                    case 0:
                        value = this.pop();
                        if (this.peek(instruction.argument).call('append', [value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.MAP_ADD:
                switch (this.state) {
                    case 0:
                        key = this.pop();
                        value = this.pop();
                        if (this.peek(instruction.argument).call('__setitem__', [key, value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.RETURN_VALUE:
                vm.return_value = this.pop();
                this.unwind(CAUSES.RETURN);
                break;

            case OPCODES.YIELD_VALUE:
                switch (this.state) {
                    case 0:
                        vm.return_value = this.pop();
                        vm.frame = this.back;
                        this.why = CAUSES.YIELD;
                        return 1;
                    case 1:
                        this.push(vm.return_value);
                        this.why = CAUSES.RUN;
                        break;
                }
                break;

            case OPCODES.YIELD_FROM:
                error('opcode not implemented');
                break;

            case OPCODES.POP_BLOCK:
                this.blocks.pop();
                break;

            case OPCODES.POP_EXCEPT:
                block = this.blocks.pop();
                assert(block.type === BLOCK_TYPES.EXCEPT, 'invalid type of top block');
                while (this.level > block.level + 3) {
                    this.pop();
                }
                if (this.level == block.level + 3) {
                    exc_type = this.pop();
                    exc_value = this.pop();
                    exc_tb = this.pop();
                    raise(exc_type, exc_value, exc_tb);
                } else {
                    vm.return_value = None;
                    this.why = CAUSES.RUN;
                }
                break;

            case OPCODES.END_FINALLY:
                this.unwind();
                break;

            case OPCODES.LOAD_BUILD_CLASS:
                this.push(build_class);
                break;

            case OPCODES.SETUP_WITH:
                switch (this.state) {
                    case 0:
                        if (call(getattr, [this.top0(), Str.pack('__exit__')])) {
                            return 1;
                        }
                    case 1:
                        temp = this.pop();
                        if (!vm.return_value) {
                            break;
                        }
                        this.push(vm.return_value);
                        if (temp.call('__enter__')) {
                            return 2;
                        }
                    case 2:
                        if (!vm.return_value) {
                            this.pop();
                            break;
                        }
                        this.push(vm.return_value);
                        this.push_block(BLOCK_TYPES.FINALLY, instruction.target);
                }
                break;

            case OPCODES.WITH_CLEANUP_START:
                switch (this.state) {
                    case 0:
                        switch (this.why) {
                            case CAUSES.EXCEPTION:
                                args = [this.pop(), this.pop(), this.pop()];
                                break;
                            case CAUSES.RETURN:
                            case CAUSES.CONTINUE:
                            case CAUSES.BREAK:
                                args = [None, None, None];
                                break;
                            default:
                                args = [None, None, None];
                                this.pop();
                        }
                        this.return_value = vm.return_value;
                        vm.return_value = None;
                        if (call(this.pop(), args)) {
                            return 1;
                        }
                    case 1:
                        if (!vm.return_value) {
                            break;
                        }
                        this.push(vm.return_value);
                }
                break;

            case OPCODES.WITH_CLEANUP_FINISH:
                if (this.pop().to_bool()) {
                    if (this.why == CAUSES.EXCEPTION) {
                        this.why = CAUSES.RUN;
                    }
                } else {
                    if (this.why == CAUSES.EXCEPTION) {
                        this.push(vm.last_exception.exc_tb);
                        this.push(vm.last_exception.exc_value);
                        this.push(vm.last_exception.exc_type);
                    }
                }
                if (this.why == CAUSES.RETURN) {
                    vm.return_value = this.return_value;
                }
                break;

            case OPCODES.STORE_FAST:
            case OPCODES.DELETE_FAST:
            case OPCODES.STORE_NAME:
            case OPCODES.DELETE_NAME:
                if (instruction.opcode === OPCODES.STORE_FAST) {
                    name = this.code.varnames[instruction.argument];
                } else if (instruction.opcode === OPCODES.DELETE_FAST) {
                    name = this.code.varnames[instruction.argument];
                } else {
                    name = this.code.names[instruction.argument];
                }
                if (this.namespace) {
                    switch (this.state) {
                        case 0:
                            if (instruction.opcode === OPCODES.STORE_NAME) {
                                slot = '__setitem__';
                                args = [Str.pack(name), this.pop()];
                            } else {
                                slot = '__delitem__';
                                args = [Str.pack(name)];
                            }
                            if (this.namespace.call(slot, args)) {
                                return 1;
                            }
                        case 1:
                            if (except(MethodNotFoundError)) {
                                raise(TypeError, 'invalid namespace');
                            }
                            break;
                    }
                } else {
                    if (instruction.opcode === OPCODES.STORE_NAME || instruction.opcode === OPCODES.STORE_FAST) {
                        this.locals[name] = this.pop();
                    } else if (name in this.locals) {
                        delete this.locals[name];
                    } else {
                        raise(NameError, 'name \'' + name + '\' is not defined');
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
                            if (this.namespace.call('__getitem__', [Str.pack(name)])) {
                                return 1;
                            }
                        case 1:
                            if (vm.return_value) {
                                this.push(vm.return_value);
                            } else if (except(MethodNotFoundError) || except(KeyError)) {
                                if (name in this.globals) {
                                    this.push(this.globals[name]);
                                } else if (name in this.builtins) {
                                    this.push(this.builtins[name]);
                                } else {
                                    raise(NameError, 'name \'' + name + '\' is not defined');
                                }
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
                            args = [Str.pack(name), this.pop()];
                        } else {
                            slot = '__delattr__';
                            args = [Str.pack(name)];
                        }
                        if (temp.call(slot, args)) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (instruction.opcode === OPCODES.STORE_ATTR) {
                                raise(TypeError, 'object does not support attribute assignment');
                            } else {
                                raise(TypeError, 'object does not support attribute deletion');
                            }
                        }
                        break;
                }
                break;

            case OPCODES.LOAD_ATTR:
                name = this.code.names[instruction.argument];
                switch (this.state) {
                    case 0:
                        if (this.top0().call('__getattribute__', [Str.pack(name)])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            this.pop();
                            this.push(vm.return_value);
                            break;
                        }
                        if (except(AttributeError) || except(MethodNotFoundError)) {
                            if (this.pop().call('__getattr__', [Str.pack(name)])) {
                                return 2;
                            }
                        } else {
                            this.pop();
                            break;
                        }
                    case 2:
                        if (except(MethodNotFoundError)) {
                            raise(TypeError, 'object does not support attribute access');
                        } else if (vm.return_value) {
                            this.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.UNPACK_SEQUENCE:
                switch (this.state) {
                    case 0:
                        if (call(unpack_sequence, [this.pop(), Int.pack(instruction.argument)])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            if (vm.return_value.len() != instruction.argument) {
                                raise(TypeError, 'not enough values to unpack (expected ' + instruction.argument + ', got ' + vm.return_value.len() + ')');
                            } else {
                                for (index = vm.return_value.len() - 1; index >= 0; index--) {
                                    this.push(vm.return_value.get(index));
                                }
                            }
                        }
                }
                break;

            case OPCODES.UNPACK_EX:
                switch (this.state) {
                    case 0:
                        if (call(unpack_sequence, [this.pop()])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            low = instruction.argument & 0xFF;
                            high = instruction.argument >> 8;
                            if (vm.return_value.len() < low + high) {
                                raise(TypeError, 'not enough values to unpack (expected at least' + (low + high) + ', got ' + vm.return_value.len() + ')');
                            }
                            temp = vm.return_value.len() - high;
                            for (index = vm.return_value.len() - 1; index >= temp; index--) {
                                this.push(vm.return_value.get(index));
                            }
                            this.push(new List(vm.return_value.array.slice(low, temp)));
                            for (index = low - 1; index >= 0; index--) {
                                this.push(vm.return_value.get(index));
                            }
                        }
                }
                break;

            case OPCODES.BUILD_TUPLE:
                this.push(pack_tuple(this.popn(instruction.argument)));
                break;

            case OPCODES.BUILD_LIST:
                this.push(new List(this.popn(instruction.argument)));
                break;

            case OPCODES.BUILD_SET:
                error('opcode not implemented');
                break;

            case OPCODES.BUILD_MAP:
                switch (this.state) {
                    case 0:
                        this.build_map_dict = new Dict();
                        this.build_map_items = this.popn(instruction.argument * 2);
                        this.build_map_index = 0;
                    case 1:
                        if (vm.return_value) {
                            if (this.build_map_index < this.build_map_items.length) {
                                this.build_map_dict.call('__setitem__', [this.build_map_items[this.build_map_index++], this.build_map_items[this.build_map_index++]])
                                return 1;
                            }
                            this.push(this.build_map_dict);
                        }
                        this.build_map_dict = null;
                        this.build_map_items = null;
                        this.build_map_index = null;
                }
                break;

            case OPCODES.IMPORT_NAME:
                switch (this.state) {
                    case 0:
                        name = this.code.names[instruction.argument];
                        if (!('__import__' in this.builtins)) {
                            raise(ImportError, '__import__ not found');
                            break;
                        } else if (call(this.builtins['__import__'], [Str.pack(name), new Dict(this.globals), new Dict(this.locals)].concat(this.popn(2).reverse()))) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            this.push(vm.return_value);
                        }
                }
                break;

            case OPCODES.IMPORT_STAR:
                temp = this.pop();
                for (name in temp.__dict__) {
                    if (name.indexOf('_') != 0 && temp.__dict__.hasOwnProperty(name)) {
                        this.locals[name] = temp.__dict__[name];
                    }
                }
                break;

            case OPCODES.IMPORT_FROM:
                name = this.code.names[instruction.argument];
                if (name in this.top0().__dict__) {
                    this.push(this.top0().__dict__[name])
                } else {
                    raise(ImportError, 'cannot import name \'' + name + '\'');
                }
                break;

            case OPCODES.JUMP_FORWARD:
                this.position = instruction.target;
                break;

            case OPCODES.JUMP_ABSOLUTE:
                this.position = instruction.target;
                break;

            case OPCODES.COMPARE_OP:
                switch (instruction.argument) {
                    case COMPARE_OPS.EXC:
                        exc_type = this.pop();
                        this.push(issubclass(this.pop(), exc_type) ? True : False);
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
                                if (left.call(slot, [right])) {
                                    return 1;
                                }
                            case 1:
                                if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                                    console.log(left, right, slot);
                                    debugger;
                                    raise(TypeError, 'unsupported boolean operator');
                                } else if (vm.return_value) {
                                    this.push(vm.return_value);
                                }
                                break;
                        }
                        break;

                    case COMPARE_OPS.IS:
                    case COMPARE_OPS.NIS:
                        left = this.pop();
                        right = this.pop();
                        if (right.is(left)) {
                            this.push(instruction.argument == COMPARE_OPS.IS ? True : False)
                        } else {
                            this.push(instruction.argument == COMPARE_OPS.NIS ? True : False)
                        }
                        break;

                    case COMPARE_OPS.IN:
                    case COMPARE_OPS.NIN:
                        switch (this.state) {
                            case 0:
                                right = this.pop();
                                left = this.pop();
                                if (right.call('__contains__', [left])) {
                                    return 1;
                                }
                            case 1:
                                if (vm.return_value) {
                                    if (vm.return_value.to_bool()) {
                                        this.push(instruction.argument == COMPARE_OPS.IN ? True : False)
                                    } else {
                                        this.push(instruction.argument == COMPARE_OPS.NIN ? True : False)
                                    }
                                }
                        }
                        break;

                    default:
                        error('unsupported comparison operator');
                }
                break;

            case OPCODES.POP_JUMP_IF_TRUE:
                if (this.top0().__class__ === Int.__class__) {
                    if (this.pop().to_bool()) {
                        this.position = instruction.target;
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (this.pop().call('__len__')) {
                                return 2;
                            }
                        }
                    case 2:
                        if (!vm.return_value) {
                            break;
                        }
                        if (except(MethodNotFoundError)) {
                            this.position = instruction.target;
                            break;
                        } else if (vm.return_value) {
                            if (vm.return_value instanceof Int) {
                                if (vm.return_value.to_bool()) {
                                    this.position = instruction.target;
                                    break;
                                }
                            } else {
                                raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        }
                        break;
                }
                break;

            case OPCODES.POP_JUMP_IF_FALSE:
                if (this.top0().__class__ === py_bool || this.top0().__class__ === Int.__class__) {
                    if (!this.pop().to_bool()) {
                        this.position = instruction.target;
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (this.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            this.pop();
                            break;
                        }
                    case 2:
                        this.pop();
                        if (!except(MethodNotFoundError)) {
                            if (vm.return_value instanceof Int) {
                                if (!vm.return_value.to_bool()) {
                                    this.position = instruction.target;
                                    break;
                                }
                            } else if (vm.return_value) {
                                raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        }
                        break;
                }
                break;

            case OPCODES.JUMP_IF_TRUE_OR_POP:
                if (this.top0().__class__ === Int.__class__) {
                    if (this.top0().to_bool()) {
                        this.position = instruction.target;
                    } else {
                        this.pop();
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (this.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            this.pop();
                            break;
                        }
                    case 2:
                        if (except(MethodNotFoundError)) {
                            this.position = instruction.target;
                        } else if (vm.return_value) {
                            if (vm.return_value instanceof Int) {
                                if (vm.return_value.to_bool()) {
                                    this.position = instruction.target;
                                } else {
                                    this.pop();
                                }
                            } else {
                                this.pop();
                                raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        } else {
                            this.pop();
                        }
                        break;
                }
                break;

            case OPCODES.JUMP_IF_FALSE_OR_POP:
                if (this.top0().__class__ === Int.__class__) {
                    if (!this.top0().to_bool()) {
                        this.position = instruction.target;
                    } else {
                        this.pop();
                    }
                    break;
                }
                switch (this.state) {
                    case 0:
                        if (this.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (this.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            this.pop();
                            this.raise();
                            break;
                        }
                    case 2:
                        if (!except(MethodNotFoundError)) {
                            if (vm.return_value instanceof Int) {
                                if (!vm.return_value.to_bool()) {
                                    this.position = instruction.target;
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
                        if (this.top0().call('__next__')) {
                            return 1;
                        }
                    case 1:
                        if (!vm.return_value) {
                            this.pop();
                            if (except(MethodNotFoundError)) {
                                raise(TypeError, 'object does not support iteration');
                            } else if (except(StopIteration)) {
                                this.position = instruction.target;
                                break;
                            }
                        } else {
                            this.push(vm.return_value);
                        }
                        break;
                }
                break;


            case OPCODES.SETUP_LOOP:
            case OPCODES.SETUP_EXCEPT:
            case OPCODES.SETUP_FINALLY:
                this.push_block(OPCODES_EXTRA[instruction.opcode], instruction.target);
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
                raise(exc_value.__class__, exc_value);
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
                        if (call(this.pop(), args, kwargs)) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            this.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.CALL_FUNCTION_VAR:
                switch (this.state) {
                    case 0:
                        if (call(unpack_sequence, [this.pop()])) {
                            return 1;
                        }
                    case 1:
                        if (!vm.return_value) {
                            break;
                        }
                        low = instruction.argument & 0xFF;
                        high = instruction.argument >> 8;
                        kwargs = {};
                        for (index = 0; index < high; index++) {
                            value = this.pop();
                            kwargs[this.pop().value] = value;
                        }
                        args = this.popn(low).concat(vm.return_value.array);
                        if (call(this.pop(), args, kwargs)) {
                            return 2;
                        }
                    case 3:
                        if (vm.return_value) {
                            this.push(vm.return_value);
                        }
                        break;
                }
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
                var options = {defaults: {}, annotations: {}, globals: this.globals};
                if (instruction.opcode == OPCODES.MAKE_CLOSURE) {
                    options.closure = this.pop();
                }
                if (high) {
                    temp = this.pop();
                    for (index = 0; index < high - 1; index++) {
                        options.annotations[Str.unpack(temp.get(index))] = this.pop();
                    }
                }
                for (index = 0; index < mid; index++) {
                    value = this.pop();
                    options.defaults[this.pop().value] = value;
                }
                for (index = 0; index < low; index++) {
                    options.defaults[code.signature.argnames[code.signature.poscount - low + index]] = this.pop();
                }
                this.push(new Func(Str.unpack(name), code, options));
                break;

            case OPCODES.BUILD_SLICE:
                this.push(new_slice.apply(null, this.popn(instruction.argument)));
                break;

            default:
                error('unknown opcode occoured ' + instruction.opcode);
                break;
        }
        this.state = 0;
    }
};


NativeFrame.prototype.execute = function () {
    // << if ENABLE_THREADING
        if (threading.step()) {
            return;
        }
    // >>

    // << if ENABLE_DEBUGGER
        if (debugging.step()) {
            return;
        }
    // >>

    assert(!this.code.simple, 'native frames\'s code is simple');
    var result;
    try {
        result = this.code.func.apply(null, this.args.concat([this.state, this]));
    } catch (error) {
        if (!(error instanceof PyObject)) {
            error = pack_error(error);
        }
        raise(error.__class__, error, undefined, true);
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
    }
    if (result == undefined || result instanceof PyObject) {
        if (vm.return_value) {
            if (result instanceof PyObject) {
                vm.return_value = result;
            } else {
                vm.return_value = None;
            }
        }
        vm.frame = this.back;
        // << if ENABLE_DEBUGGER
            debugging.trace_return(this);
        // >>
        // << if ENABLE_THREADING
            if (!vm.frame) {
                threading.finished();
            }
        // >>
    } else {
        this.state = result;
    }
};
