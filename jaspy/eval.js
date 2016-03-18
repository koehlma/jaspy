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

function execute(frame) {
    var slot, right, left, name, key, value, block, exc_type, exc_value, exc_tb, temp;
    var low, mid, high, args, kwargs, index, code, defaults, globals, func, instruction;

    while (vm.frame === frame) {
        if (!vm.return_value && frame.why != CAUSES.EXCEPTION && frame.state == 0) {
            frame.raise();
        }

        instruction = frame.code.instructions[frame.position++];

        if (DEBUG) {
            console.log('executing instruction', instruction);
        }

        switch (instruction.opcode) {
            case OPCODES.NOP:
                break;

            case OPCODES.POP_TOP:
                frame.pop();
                break;

            case OPCODES.ROT_TWO:
                temp = frame.popn(2);
                frame.push(temp[1]);
                frame.push(temp[0]);
                break;

            case OPCODES.ROT_THREE:
                temp = frame.popn(3);
                frame.push(temp[2]);
                frame.push(temp[1]);
                frame.push(temp[0]);
                break;

            case OPCODES.DUP_TOP:
                frame.push(frame.top0());
                break;

            case OPCODES.DUP_TOP_TWO:
                frame.push(frame.top1());
                frame.push(frame.top1());
                break;

            case OPCODES.GET_YIELD_FROM_ITER:
                if (frame.state === 0 && isiterable(frame.top0())) {
                    break;
                }
            case OPCODES.UNARY_POSITIVE:
            case OPCODES.UNARY_NEGATIVE:
            case OPCODES.UNARY_NOT:
            case OPCODES.UNARY_INVERT:
            case OPCODES.GET_ITER:
                switch (frame.state) {
                    case 0:
                        if (frame.pop().call(OPCODES_EXTRA[instruction.opcode])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type');
                        } else if (vm.return_value) {
                            frame.push(vm.return_value);
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
                switch (frame.state) {
                    case 0:
                        slot = OPCODES_EXTRA[instruction.opcode];
                        right = frame.top0();
                        left = frame.top1();
                        if (left.call('__' + slot + '__', [right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            slot = OPCODES_EXTRA[instruction.opcode];
                            right = frame.pop();
                            left = frame.pop();
                            if (right.call('__r' + slot + '__', [left])) {
                                return 2;
                            }
                        } else {
                            frame.popn(2);
                            if (vm.return_value) {
                                frame.push(vm.return_value);
                            }
                            break;
                        }
                    case 2:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type');
                        } else if (vm.return_value) {
                            frame.push(vm.return_value);
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
                switch (frame.state) {
                    case 0:
                        right = frame.pop();
                        left = frame.pop();
                        if (left.call(OPCODES_EXTRA[instruction.opcode], [right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type');
                        } else if (vm.return_value && instruction.opcode != OPCODES.DELETE_SUBSCR) {
                            frame.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.STORE_SUBSCR:
                switch (frame.state) {
                    case 0:
                        name = frame.pop();
                        left = frame.pop();
                        right = frame.pop();
                        if (left.call('__setitem__', [name, right])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                            raise(TypeError, 'unsupported operand type');
                        }
                        break;
                }
                break;

            case OPCODES.PRINT_EXPR:
                console.log(frame.pop());
                break;

            case OPCODES.BREAK_LOOP:
                frame.unwind(CAUSES.BREAK);
                break;

            case OPCODES.CONTINUE_LOOP:
                frame.unwind(CAUSES.CONTINUE);
                break;

            case OPCODES.SET_ADD:
                switch (frame.state) {
                    case 0:
                        value = frame.pop();
                        if (frame.peek(instruction.argument).call('add', [value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.LIST_APPEND:
                switch (frame.state) {
                    case 0:
                        value = frame.pop();
                        if (frame.peek(instruction.argument).call('append', [value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.MAP_ADD:
                switch (frame.state) {
                    case 0:
                        key = frame.pop();
                        value = frame.pop();
                        if (frame.peek(instruction.argument).call('__setitem__', [key, value])) {
                            return 1;
                        }
                    case 1:
                        break;
                }
                break;

            case OPCODES.RETURN_VALUE:
                vm.return_value = frame.pop();
                frame.unwind(CAUSES.RETURN);
                break;

            case OPCODES.YIELD_VALUE:
                switch (frame.state) {
                    case 0:
                        vm.return_value = frame.pop();
                        vm.frame = frame.back;
                        frame.why = CAUSES.YIELD;
                        return 1;
                    case 1:
                        frame.push(vm.return_value);
                        frame.why = CAUSES.RUN;
                        break;
                }
                break;

            case OPCODES.YIELD_FROM:
                error('opcode not implemented');
                break;

            case OPCODES.POP_BLOCK:
                frame.blocks.pop();
                break;

            case OPCODES.POP_EXCEPT:
                block = frame.blocks.pop();
                assert(block.type === BLOCK_TYPES.EXCEPT, 'invalid type of top block');
                while (frame.level > block.level + 3) {
                    frame.pop();
                }
                if (frame.level == block.level + 3) {
                    exc_type = frame.pop();
                    exc_value = frame.pop();
                    exc_tb = frame.pop();
                    raise(exc_type, exc_value, exc_tb);
                } else {
                    vm.return_value = None;
                    frame.why = CAUSES.RUN;
                }
                break;

            case OPCODES.END_FINALLY:
                frame.unwind();
                break;

            case OPCODES.LOAD_BUILD_CLASS:
                frame.push(build_class);
                break;

            case OPCODES.SETUP_WITH:
                switch (frame.state) {
                    case 0:
                        if (call(getattr, [frame.top0(), pack_str('__exit__')])) {
                            return 1;
                        }
                    case 1:
                        temp = frame.pop();
                        if (!vm.return_value) {
                            break;
                        }
                        frame.push(vm.return_value);
                        if (temp.call('__enter__')) {
                            return 2;
                        }
                    case 2:
                        if (!vm.return_value) {
                            frame.pop();
                            break;
                        }
                        frame.push(vm.return_value);
                        frame.push_block(BLOCK_TYPES.FINALLY, instruction.target);
                }
                break;

            case OPCODES.WITH_CLEANUP_START:
                switch (frame.state) {
                    case 0:
                        switch (frame.why) {
                            case CAUSES.EXCEPTION:
                                args = [frame.pop(), frame.pop(), frame.pop()];
                                break;
                            case CAUSES.RETURN:
                            case CAUSES.CONTINUE:
                            case CAUSES.BREAK:
                                args = [None, None, None];
                                break;
                            default:
                                args = [None, None, None];
                                frame.pop();
                        }
                        frame.return_value = vm.return_value;
                        vm.return_value = None;
                        if (call(frame.pop(), args)) {
                            return 1;
                        }
                    case 1:
                        if (!vm.return_value) {
                            break;
                        }
                        frame.push(vm.return_value);
                }
                break;

            case OPCODES.WITH_CLEANUP_FINISH:
                if (frame.pop().bool()) {
                    if (frame.why == CAUSES.EXCEPTION) {
                        frame.why = CAUSES.RUN;
                    }
                } else {
                    if (frame.why == CAUSES.EXCEPTION) {
                        frame.push(vm.last_exception.exc_tb);
                        frame.push(vm.last_exception.exc_value);
                        frame.push(vm.last_exception.exc_type);
                    }
                }
                if (frame.why == CAUSES.RETURN) {
                    vm.return_value = frame.return_value;
                }
                break;

            case OPCODES.STORE_FAST:
            case OPCODES.DELETE_FAST:
            case OPCODES.STORE_NAME:
            case OPCODES.DELETE_NAME:
                if (instruction.opcode === OPCODES.STORE_FAST) {
                    name = frame.code.varnames[instruction.argument];
                } else if (instruction.opcode === OPCODES.DELETE_FAST) {
                    name = frame.code.varnames[instruction.argument];
                } else {
                    name = frame.code.names[instruction.argument];
                }
                if (frame.namespace) {
                    switch (frame.state) {
                        case 0:
                            if (instruction.opcode === OPCODES.STORE_NAME) {
                                slot = '__setitem__';
                                args = [pack_str(name), frame.pop()];
                            } else {
                                slot = '__delitem__';
                                args = [pack_str(name)];
                            }
                            if (frame.namespace.call(slot, args)) {
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
                        frame.locals[name] = frame.pop();
                    } else if (name in frame.locals) {
                        delete frame.locals[name];
                    } else {
                        raise(NameError, 'name \'' + name + '\' is not defined');
                    }
                }
                break;

            case OPCODES.LOAD_FAST:
            case OPCODES.LOAD_NAME:
                if (instruction.opcode === OPCODES.LOAD_FAST) {
                    name = frame.code.varnames[instruction.argument];
                } else {
                    name = frame.code.names[instruction.argument];
                }
                if (frame.namespace) {
                    switch (frame.state) {
                        case 0:
                            if (frame.namespace.call('__getitem__', [pack_str(name)])) {
                                return 1;
                            }
                        case 1:
                            if (vm.return_value) {
                                frame.push(vm.return_value);
                            } else if (except(MethodNotFoundError) || except(KeyError)) {
                                if (name in frame.globals) {
                                    frame.push(frame.globals[name]);
                                } else if (name in frame.builtins) {
                                    frame.push(frame.builtins[name]);
                                } else {
                                    raise(NameError, 'name \'' + name + '\' is not defined');
                                }
                            }
                            break;
                    }
                } else {
                    if (name in frame.locals) {
                        frame.push(frame.locals[name]);
                    } else if (name in frame.globals) {
                        frame.push(frame.globals[name]);
                    } else if (name in frame.builtins) {
                        frame.push(frame.builtins[name]);
                    } else {
                        raise(NameError, 'name \'' + name + '\' is not defined');
                    }
                }
                break;

            case OPCODES.STORE_GLOBAL:
                name = frame.code.names[instruction.argument];
                frame.globals[name] = frame.pop();
                break;

            case OPCODES.DELETE_GLOBAL:
                name = frame.code.names[instruction.argument];
                if (name in frame.globals) {
                    delete frame.globals[name];
                } else {
                    raise(NameError, 'name \'' + name + '\' is not defined');
                }
                break;

            case OPCODES.LOAD_GLOBAL:
                name = frame.code.names[instruction.argument];
                if (name in frame.globals) {
                    frame.push(frame.globals[name]);
                } else if (name in frame.builtins) {
                    frame.push(frame.builtins[name]);
                } else {
                    raise(NameError, 'name \'' + name + '\' is not defined');
                }
                break;

            case OPCODES.STORE_ATTR:
            case OPCODES.DELETE_ATTR:
                name = frame.code.names[instruction.argument];
                switch (frame.state) {
                    case 0:
                        temp = frame.pop();
                        if (instruction.opcode === OPCODES.STORE_ATTR) {
                            slot = '__setattr__';
                            args = [pack_str(name), frame.pop()];
                        } else {
                            slot = '__delattr__';
                            args = [pack_str(name)];
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
                name = frame.code.names[instruction.argument];
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__getattribute__', [pack_str(name)])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            frame.pop();
                            frame.push(vm.return_value);
                            break;
                        }
                        if (except(AttributeError) || except(MethodNotFoundError)) {
                            if (frame.pop().call('__getattr__', [pack_str(name)])) {
                                return 2;
                            }
                        } else {
                            frame.pop();
                            break;
                        }
                    case 2:
                        if (except(MethodNotFoundError)) {
                            raise(TypeError, 'object does not support attribute access');
                        } else if (vm.return_value) {
                            frame.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.UNPACK_SEQUENCE:
                switch (frame.state) {
                    case 0:
                        if (call(unpack_sequence, [frame.pop(), pack_int(instruction.argument)])) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            if (vm.return_value.len() != instruction.argument) {
                                raise(TypeError, 'not enough values to unpack (expected ' + instruction.argument + ', got ' + vm.return_value.len() + ')');
                            } else {
                                for (index = vm.return_value.len() - 1; index >= 0; index--) {
                                    frame.push(vm.return_value.get(index));
                                }
                            }
                        }
                }
                break;

            case OPCODES.UNPACK_EX:
                switch (frame.state) {
                    case 0:
                        if (call(unpack_sequence, [frame.pop()])) {
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
                                frame.push(vm.return_value.get(index));
                            }
                            frame.push(new PyList(vm.return_value.array.slice(low, temp)));
                            for (index = low - 1; index >= 0; index--) {
                                frame.push(vm.return_value.get(index));
                            }
                        }
                }
                break;

            case OPCODES.BUILD_TUPLE:
                frame.push(pack_tuple(frame.popn(instruction.argument)));
                break;

            case OPCODES.BUILD_LIST:
                frame.push(new PyList(frame.popn(instruction.argument)));
                break;

            case OPCODES.BUILD_SET:
                error('opcode not implemented');
                break;

            case OPCODES.BUILD_MAP:
                frame.push(new PyDict());
                break;

            case OPCODES.IMPORT_NAME:
                switch (frame.state) {
                    case 0:
                        name = frame.code.names[instruction.argument];
                        if (!('__import__' in frame.builtins)) {
                            raise(ImportError, '__import__ not found');
                            break;
                        } else if (call(frame.builtins['__import__'], [pack_str(name), new PyDict(frame.globals), new PyDict(frame.locals)].concat(frame.popn(2).reverse()))) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            frame.push(vm.return_value);
                        }
                }
                break;

            case OPCODES.IMPORT_STAR:
                temp = frame.pop();
                for (name in temp.dict) {
                    if (name.indexOf('_') != 0 && temp.dict.hasOwnProperty(name)) {
                        frame.locals[name] = temp.dict[name];
                    }
                }
                break;

            case OPCODES.IMPORT_FROM:
                name = frame.code.names[instruction.argument];
                if (name in frame.top0().dict) {
                    frame.push(frame.top0().dict[name])
                } else {
                    raise(ImportError, 'cannot import name \'' + name + '\'');
                }
                break;

            case OPCODES.JUMP_FORWARD:
                frame.position = instruction.target;
                break;

            case OPCODES.JUMP_ABSOLUTE:
                frame.position = instruction.target;
                break;

            case OPCODES.COMPARE_OP:
                switch (instruction.argument) {
                    case COMPARE_OPS.EXC:
                        exc_type = frame.pop();
                        frame.push(issubclass(frame.pop(), exc_type) ? True : False);
                        break;
                    case COMPARE_OPS.LT:
                    case COMPARE_OPS.LE:
                    case COMPARE_OPS.GT:
                    case COMPARE_OPS.GE:
                    case COMPARE_OPS.EQ:
                    case COMPARE_OPS.NE:
                        switch (frame.state) {
                            case 0:
                                slot = COMPARE_SLOTS[instruction.argument];
                                right = frame.pop();
                                left = frame.pop();
                                if (left.call(slot, [right])) {
                                    return 1;
                                }
                            case 1:
                                if (vm.return_value === NotImplemented || except(MethodNotFoundError)) {
                                    raise(TypeError, 'unsupported boolean operator');
                                } else if (vm.return_value) {
                                    frame.push(vm.return_value);
                                }
                                break;
                        }
                        break;

                    case COMPARE_OPS.IS:
                    case COMPARE_OPS.NIS:
                        right = frame.pop();
                        left = frame.pop();
                        if (right.is(left)) {
                            frame.push(instruction.argument == COMPARE_OPS.IS ? True : False)
                        } else {
                            frame.push(instruction.argument == COMPARE_OPS.NIS ? False : True)
                        }
                        break;

                    default:
                        error('unsupported comparison operator');
                }
                break;

            case OPCODES.POP_JUMP_IF_TRUE:
                if (frame.top0().cls === py_int) {
                    if (frame.pop().bool()) {
                        frame.position = instruction.target;
                    }
                    break;
                }
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (frame.pop().call('__len__')) {
                                return 2;
                            }
                        }
                    case 2:
                        if (!vm.return_value) {
                            break;
                        }
                        if (except(MethodNotFoundError)) {
                            frame.position = instruction.target;
                            break;
                        } else if (vm.return_value) {
                            if (vm.return_value instanceof PyInt) {
                                if (vm.return_value.bool()) {
                                    frame.position = instruction.target;
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
                if (frame.top0().cls === py_bool || frame.top0().cls === py_int) {
                    if (!frame.pop().bool()) {
                        frame.position = instruction.target;
                    }
                    break;
                }
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (frame.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            frame.pop();
                            break;
                        }
                    case 2:
                        frame.pop();
                        if (!except(MethodNotFoundError)) {
                            if (vm.return_value instanceof PyInt) {
                                if (!vm.return_value.bool()) {
                                    frame.position = instruction.target;
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
                if (frame.top0().cls === py_int) {
                    if (frame.top0().bool()) {
                        frame.position = instruction.target;
                    } else {
                        frame.pop();
                    }
                    break;
                }
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (frame.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            frame.pop();
                            break;
                        }
                    case 2:
                        if (except(MethodNotFoundError)) {
                            frame.position = instruction.target;
                        } else if (vm.return_value) {
                            if (vm.return_value instanceof PyInt) {
                                if (vm.return_value.bool()) {
                                    frame.position = instruction.target;
                                } else {
                                    frame.pop();
                                }
                            } else {
                                frame.pop();
                                raise(TypeError, 'invalid result type of boolean conversion');
                            }
                        } else {
                            frame.pop();
                        }
                        break;
                }
                break;

            case OPCODES.JUMP_IF_FALSE_OR_POP:
                if (frame.top0().cls === py_int) {
                    if (!frame.top0().bool()) {
                        frame.position = instruction.target;
                    } else {
                        frame.pop();
                    }
                    break;
                }
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__bool__')) {
                            return 1;
                        }
                    case 1:
                        if (except(MethodNotFoundError)) {
                            if (frame.top0().call('__len__')) {
                                return 2;
                            }
                        } else if (!vm.return_value) {
                            frame.pop();
                            frame.raise();
                            break;
                        }
                    case 2:
                        if (!except(MethodNotFoundError)) {
                            if (vm.return_value instanceof PyInt) {
                                if (!vm.return_value.bool()) {
                                    frame.position = instruction.target;
                                } else {
                                    frame.pop();
                                }
                            } else if (vm.return_value) {
                                frame.pop();
                                raise(TypeError, 'invalid result type of boolean conversion');
                                frame.raise();
                            } else {
                                frame.pop();
                                frame.raise();
                            }
                        }
                        break;
                }
                break;

            case OPCODES.FOR_ITER:
                switch (frame.state) {
                    case 0:
                        if (frame.top0().call('__next__')) {
                            return 1;
                        }
                    case 1:
                        if (!vm.return_value) {
                            frame.pop();
                            if (except(MethodNotFoundError)) {
                                raise(TypeError, 'object does not support iteration');
                            } else if (except(StopIteration)) {
                                frame.position = instruction.target;
                                break;
                            }
                        } else {
                            frame.push(vm.return_value);
                        }
                        break;
                }
                break;


            case OPCODES.SETUP_LOOP:
            case OPCODES.SETUP_EXCEPT:
            case OPCODES.SETUP_FINALLY:
                frame.push_block(OPCODES_EXTRA[instruction.opcode], instruction.target);
                break;

            case OPCODES.LOAD_CLOSURE:
                if (instruction.argument < frame.code.cellvars.length) {
                    frame.push(frame.cells[frame.code.cellvars[instruction.argument]]);
                } else {
                    frame.push(frame.cells[frame.code.freevars[instruction.argument]]);
                }
                break;

            case OPCODES.LOAD_DEREF:
                if (instruction.argument < frame.code.cellvars.length) {
                    frame.push(frame.cells[frame.code.cellvars[instruction.argument]].get());
                } else {
                    frame.push(frame.cells[frame.code.freevars[instruction.argument]].get());
                }
                break;

            case OPCODES.LOAD_CLASSDEREF:
                error('opcode not implemented');
                break;

            case OPCODES.STORE_DEREF:
                if (instruction.argument < frame.code.cellvars.length) {
                    frame.cells[frame.code.cellvars[instruction.argument]].set(frame.pop());
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
                exc_value = frame.pop();
                raise(exc_value.cls, exc_value);
                break;

            case OPCODES.LOAD_CONST:
                frame.push(frame.code.constants[instruction.argument]);
                break;

            case OPCODES.CALL_FUNCTION:
                switch (frame.state) {
                    case 0:
                        low = instruction.argument & 0xFF;
                        high = instruction.argument >> 8;
                        kwargs = {};
                        for (index = 0; index < high; index++) {
                            value = frame.pop();
                            kwargs[frame.pop().value] = value;
                        }
                        args = frame.popn(low);
                        if (call(frame.pop(), args, kwargs)) {
                            return 1;
                        }
                    case 1:
                        if (vm.return_value) {
                            frame.push(vm.return_value);
                        }
                        break;
                }
                break;

            case OPCODES.CALL_FUNCTION_VAR:
                switch (frame.state) {
                    case 0:
                        if (call(unpack_sequence, [frame.pop()])) {
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
                            value = frame.pop();
                            kwargs[frame.pop().value] = value;
                        }
                        args = frame.popn(low).concat(vm.return_value.array);
                        if (call(frame.pop(), args, kwargs)) {
                            return 2;
                        }
                    case 3:
                        if (vm.return_value) {
                            frame.push(vm.return_value);
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
                name = frame.pop();
                code = frame.pop();
                var options = {defaults: {}, annotations: {}, globals: frame.globals};
                if (instruction.opcode == OPCODES.MAKE_CLOSURE) {
                    options.closure = frame.pop();
                }
                if (high) {
                    temp = frame.pop();
                    for (index = 0; index < high - 1; index++) {
                        options.annotations[unpack_str(temp.get(index))] = frame.pop();
                    }
                }
                for (index = 0; index < mid; index++) {
                    value = frame.pop();
                    options.defaults[frame.pop().value] = value;
                }
                for (index = 0; index < low; index++) {
                    options.defaults[code.code.signature.argnames[index]] = frame.pop();
                }
                frame.push(new PyFunction(unpack_str(name), code.code, options));
                break;

            case OPCODES.BUILD_SLICE:
                frame.push(new_slice.apply(null, frame.popn(instruction.argument)));
                break;

            default:
                error('unknown opcode occoured ' + instruction.opcode);
                break;
        }
        frame.state = 0;
    }
};
