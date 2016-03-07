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

function disassemble(code) {
    var instruction, opcode, high, low, argument, index;

    var instructions = [];
    var table = {};
    var start = 0;

    while (start < code.bytecode.length) {
        instruction = {start: start};
        table[start] = instruction;

        opcode = code.bytecode.charCodeAt(start++);
        if (opcode >= OPCODES_ARGUMENT) {
            low = code.bytecode.charCodeAt(start++);
            high = code.bytecode.charCodeAt(start++);
            argument = high << 8 | low;
        }
        if (opcode === OPCODES.EXTENDED_ARG) {
            opcode = code.bytecode.charCodeAt(start++);
            low = code.bytecode.charCodeAt(start++);
            high = code.bytecode.charCodeAt(start++);
            argument = (argument << 16) | (high << 8) | low;
        }
        instruction.position = instructions.length;
        instruction.end = start;
        instruction.opcode = opcode;
        instruction.argument = argument;
        instructions.push(instruction);
    }

    for (index = 0; index < instructions.length; index++) {
        instruction = instructions[index];
        switch (instruction.opcode) {
            case OPCODES.JUMP_FORWARD:
                instruction.opcode = OPCODES.JUMP_ABSOLUTE;
            case OPCODES.FOR_ITER:
            case OPCODES.SETUP_EXCEPT:
            case OPCODES.SETUP_FINALLY:
            case OPCODES.SETUP_LOOP:
            case OPCODES.SETUP_WITH:
                instruction.target = table[instruction.end + instruction.argument].position;
                break;

            case OPCODES.JUMP_IF_FALSE_OR_POP:
            case OPCODES.JUMP_IF_TRUE_OR_POP:
            case OPCODES.POP_JUMP_IF_FALSE:
            case OPCODES.POP_JUMP_IF_TRUE:
            case OPCODES.JUMP_ABSOLUTE:
                instruction.target = table[instruction.argument].position;
                break;
        }
    }

    return instructions;
}


$.disassemble = disassemble;
