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

var DEBUG = false;

var TRACEBACK_ON_EXCEPTION = true;

var CODE_FLAGS = {
    OPTIMIZED: 1 << 0,
    NEWLOCALS: 1 << 1,
    NESTED: 1 << 4,
    GENERATOR: 1 << 5,
    NOFREE: 1 << 6,

    STAR_ARGS: 1 << 2,
    STAR_KWARGS: 1 << 3,

    PYTHON: 1 << 10,
    NATIVE: 1 << 11
};

var BLOCK_TYPES = {
    BASE: 0,
    LOOP: 1,
    EXCEPT: 2,
    FINALLY: 3
};

var UNWIND_CAUSES = {
    RETURN: 0,
    EXCEPTION: 1,
    BREAK: 2,
    CONTINUE: 3
};

var COMPARE_OPS = {
    LT: 0,
    LE: 1,
    EQ: 2,
    NE: 3,
    GT: 4,
    GE: 5,
    IN: 6,
    NIN: 7,
    IS: 8,
    NIS: 9,
    EXC: 10
};

var COMPARE_SLOTS = [
    '__lt__',
    '__le__',
    '__eq__',
    '__ne__',
    '__gt__',
    '__ge__',
    '__contains__',
    '__contains__'
];

var OPCODES = {
    BEFORE_ASYNC_WITH: 52,
    BINARY_ADD: 23,
    BINARY_AND: 64,
    BINARY_FLOOR_DIVIDE: 26,
    BINARY_LSHIFT: 62,
    BINARY_MATRIX_MULTIPLY: 16,
    BINARY_MODULO: 22,
    BINARY_MULTIPLY: 20,
    BINARY_OR: 66,
    BINARY_POWER: 19,
    BINARY_RSHIFT: 63,
    BINARY_SUBSCR: 25,
    BINARY_SUBTRACT: 24,
    BINARY_TRUE_DIVIDE: 27,
    BINARY_XOR: 65,
    BREAK_LOOP: 80,
    BUILD_LIST: 103,
    BUILD_LIST_UNPACK: 149,
    BUILD_MAP: 105,
    BUILD_MAP_UNPACK: 150,
    BUILD_MAP_UNPACK_WITH_CALL: 151,
    BUILD_SET: 104,
    BUILD_SET_UNPACK: 153,
    BUILD_SLICE: 133,
    BUILD_TUPLE: 102,
    BUILD_TUPLE_UNPACK: 152,
    CALL_FUNCTION: 131,
    CALL_FUNCTION_KW: 141,
    CALL_FUNCTION_VAR: 140,
    CALL_FUNCTION_VAR_KW: 142,
    COMPARE_OP: 107,
    CONTINUE_LOOP: 119,
    DELETE_ATTR: 96,
    DELETE_DEREF: 138,
    DELETE_FAST: 126,
    DELETE_GLOBAL: 98,
    DELETE_NAME: 91,
    DELETE_SUBSCR: 61,
    DUP_TOP: 4,
    DUP_TOP_TWO: 5,
    END_FINALLY: 88,
    EXTENDED_ARG: 144,
    FOR_ITER: 93,
    GET_AITER: 50,
    GET_ANEXT: 51,
    GET_AWAITABLE: 73,
    GET_ITER: 68,
    GET_YIELD_FROM_ITER: 69,
    IMPORT_FROM: 109,
    IMPORT_NAME: 108,
    IMPORT_STAR: 84,
    INPLACE_ADD: 55,
    INPLACE_AND: 77,
    INPLACE_FLOOR_DIVIDE: 28,
    INPLACE_LSHIFT: 75,
    INPLACE_MATRIX_MULTIPLY: 17,
    INPLACE_MODULO: 59,
    INPLACE_MULTIPLY: 57,
    INPLACE_OR: 79,
    INPLACE_POWER: 67,
    INPLACE_RSHIFT: 76,
    INPLACE_SUBTRACT: 56,
    INPLACE_TRUE_DIVIDE: 29,
    INPLACE_XOR: 78,
    JUMP_ABSOLUTE: 113,
    JUMP_FORWARD: 110,
    JUMP_IF_FALSE_OR_POP: 111,
    JUMP_IF_TRUE_OR_POP: 112,
    LIST_APPEND: 145,
    LOAD_ATTR: 106,
    LOAD_BUILD_CLASS: 71,
    LOAD_CLASSDEREF: 148,
    LOAD_CLOSURE: 135,
    LOAD_CONST: 100,
    LOAD_DEREF: 136,
    LOAD_FAST: 124,
    LOAD_GLOBAL: 116,
    LOAD_NAME: 101,
    MAKE_CLOSURE: 134,
    MAKE_FUNCTION: 132,
    MAP_ADD: 147,
    NOP: 9,
    POP_BLOCK: 87,
    POP_EXCEPT: 89,
    POP_JUMP_IF_FALSE: 114,
    POP_JUMP_IF_TRUE: 115,
    POP_TOP: 1,
    PRINT_EXPR: 70,
    RAISE_VARARGS: 130,
    RETURN_VALUE: 83,
    ROT_THREE: 3,
    ROT_TWO: 2,
    SETUP_ASYNC_WITH: 154,
    SETUP_EXCEPT: 121,
    SETUP_FINALLY: 122,
    SETUP_LOOP: 120,
    SETUP_WITH: 143,
    SET_ADD: 146,
    STORE_ATTR: 95,
    STORE_DEREF: 137,
    STORE_FAST: 125,
    STORE_GLOBAL: 97,
    STORE_NAME: 90,
    STORE_SUBSCR: 60,
    UNARY_INVERT: 15,
    UNARY_NEGATIVE: 11,
    UNARY_NOT: 12,
    UNARY_POSITIVE: 10,
    UNPACK_EX: 94,
    UNPACK_SEQUENCE: 92,
    WITH_CLEANUP_FINISH: 82,
    WITH_CLEANUP_START: 81,
    YIELD_FROM: 72,
    YIELD_VALUE: 86
};

var OPCODES_EXTRA = (function () {
    var map = new Array(200);
    map[OPCODES.UNARY_POSITIVE] = '__pos__';
    map[OPCODES.UNARY_NEGATIVE] = '__neg__';
    map[OPCODES.UNARY_NOT] = '__not__';
    map[OPCODES.UNARY_INVERT] = '__invert__';
    map[OPCODES.GET_ITER] = '__iter__';
    map[OPCODES.GET_YIELD_FROM_ITER] = '__iter__';

    map[OPCODES.BINARY_POWER] = 'pow';
    map[OPCODES.BINARY_MULTIPLY] = 'mul';
    map[OPCODES.BINARY_MATRIX_MULTIPLY] = 'matmul';
    map[OPCODES.BINARY_FLOOR_DIVIDE] = 'floordiv';
    map[OPCODES.BINARY_TRUE_DIVIDE] = 'truediv';
    map[OPCODES.BINARY_MODULO] = 'mod';
    map[OPCODES.BINARY_ADD] = 'add';
    map[OPCODES.BINARY_SUBTRACT] = 'sub';
    map[OPCODES.BINARY_SUBSCR] = 'getitem';
    map[OPCODES.BINARY_LSHIFT] = 'lshift';
    map[OPCODES.BINARY_RSHIFT] = 'rshift';
    map[OPCODES.BINARY_AND] = 'and';
    map[OPCODES.BINARY_XOR] = 'xor';
    map[OPCODES.BINARY_OR] = 'or';

    map[OPCODES.INPLACE_POWER] = '__ipow__';
    map[OPCODES.INPLACE_MULTIPLY] = '__imul__';
    map[OPCODES.INPLACE_MATRIX_MULTIPLY] = '__imatmul__';
    map[OPCODES.INPLACE_FLOOR_DIVIDE] = '__ifloordiv__';
    map[OPCODES.INPLACE_TRUE_DIVIDE] = '__itruediv__';
    map[OPCODES.INPLACE_MODULO] = '__imod__';
    map[OPCODES.INPLACE_ADD] = '__iadd__';
    map[OPCODES.INPLACE_SUBTRACT] = '__isub__';
    map[OPCODES.INPLACE_LSHIFT] = '__ilshift__';
    map[OPCODES.INPLACE_RSHIFT] = '__irshift__';
    map[OPCODES.INPLACE_AND] = '__iand__';
    map[OPCODES.INPLACE_XOR] = '__ixor__';
    map[OPCODES.INPLACE_OR] = '__ior__';
    map[OPCODES.DELETE_SUBSCR] = '__delitem__';

    map[OPCODES.STORE_SUBSCR] = '__setitem__';

    map[OPCODES.SETUP_LOOP] = BLOCK_TYPES.LOOP;
    map[OPCODES.SETUP_EXCEPT] = BLOCK_TYPES.EXCEPT;
    map[OPCODES.SETUP_FINALLY] = BLOCK_TYPES.FINALLY;

    return map;
})();

var OPCODES_ARGUMENT = 90;


$.CODE_FLAGS = CODE_FLAGS;
