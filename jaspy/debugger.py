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

import asyncio
import enum
import itertools
import json

import aiohttp

from . import converter
from .event import Event


class Commands(enum.Enum):
    RUN = 'run'

    THREAD_SUSPEND = 'suspend_thread'
    THREAD_RESUME = 'resume_thread'
    THREAD_KILL = 'kill_thread'

    STEP_OVER = 'step_over'
    STEP_INTO = 'step_into'
    STEP_OUT = 'step_out'

    GET_THREADS = 'get_threads'
    GET_LOCALS = 'get_locals'

    ADD_BREAK = 'add_break'
    REMOVE_BREAK = 'remove_break'

    RUN_IN_FRAME = 'run_in_frame'
    RUN_IN_THREAD = 'run_in_thread'

    ADD_EXCEPTION_BREAK = 'add_exception_break'
    REMOVE_EXCEPTION_BREAK = 'remove_exception_break'

    JS_EVAL = 'js_eval'
    JS_DEBUGGER = 'js_debugger'

    def make(self, sequence_number, *arguments):
        return json.dumps({'cmd': self.value, 'seq': sequence_number, 'args': arguments})


class Events(enum.Enum):
    HELLO = 'hello'

    SUCCESS = 'success'
    ERROR = 'error'

    RUNNING = 'running'

    THREAD_CREATED = 'thread_created'
    THREAD_SUSPENDED = 'thread_suspended'
    THREAD_RESUMED = 'thread_resumed'
    THREAD_FINISHED = 'thread_finished'

    BREAK_ADDED = 'break_added'
    BREAK_REMOVED = 'break_removed'

    EXCEPTION_BREAK_ADDED = 'exception_break_added'
    EXCEPTION_BREAK_REMOVED = 'exception_break_removed'

    THREADS = 'threads'
    LOCALS = 'locals'

    CONSOLE_LOG = 'console_log'
    CONSOLE_ERROR = 'console_error'


sessions = []

session_created = Event()
session_closed = Event()


class Debugger:
    def __init__(self, websocket):
        self.websocket = websocket

        self.on_hello = Event()

        self.on_success = Event()
        self.on_error = Event()

        self.on_running = Event()

        self.on_thread_created = Event()
        self.on_thread_suspended = Event()
        self.on_thread_resumed = Event()
        self.on_thread_finished = Event()

        self.on_break_added = Event()
        self.on_break_removed = Event()

        self.on_exception_break_added = Event()
        self.on_exception_break_removed = Event()

        self.on_threads = Event()
        self.on_locals = Event()

        self.on_console_log = Event()
        self.on_console_error = Event()

        self.events = {
            Events.HELLO: self.on_hello,

            Events.SUCCESS: self.on_success,
            Events.ERROR: self.on_error,

            Events.RUNNING: self.on_running,

            Events.THREAD_CREATED: self.on_thread_created,
            Events.THREAD_SUSPENDED: self.on_thread_suspended,
            Events.THREAD_RESUMED: self.on_thread_resumed,
            Events.THREAD_FINISHED: self.on_thread_finished,

            Events.BREAK_ADDED: self.on_break_added,
            Events.BREAK_REMOVED: self.on_break_removed,

            Events.EXCEPTION_BREAK_ADDED: self.on_exception_break_added,
            Events.EXCEPTION_BREAK_REMOVED: self.on_exception_break_added,

            Events.THREADS: self.on_threads,
            Events.LOCALS: self.on_locals,

            Events.CONSOLE_LOG: self.on_console_log,
            Events.CONSOLE_ERROR: self.on_console_error
        }

        self.futures = {}

        self.sequence_counter = itertools.count(1, 2)

    def send(self, command, *arguments, sequence_number=None):
        if sequence_number is None:
            sequence_number = next(self.sequence_counter)
        self.websocket.send_str(command.make(sequence_number, *arguments))
        return sequence_number

    def run(self):
        self.send(Commands.RUN)

    def suspend_thread(self, thread_id):
        self.send(Commands.THREAD_SUSPEND, thread_id)

    def resume_thread(self, thread_id):
        self.send(Commands.THREAD_RESUME, thread_id)

    def kill_thread(self, thread_id):
        self.send(Commands.THREAD_KILL, thread_id)

    def step_over(self, thread_id):
        self.send(Commands.STEP_OVER, thread_id)

    def step_into(self, thread_id):
        self.send(Commands.STEP_INTO, thread_id)

    def step_out(self, thread_id):
        self.send(Commands.STEP_OUT, thread_id)

    def get_threads(self):
        self.send(Commands.GET_THREADS)

    def add_break(self, filename, line, condition=None, expression=None):
        self.send(Commands.ADD_BREAK, filename, line, condition, expression)

    def remove_break(self, filename, line):
        self.send(Commands.REMOVE_BREAK, filename, line)

    def add_exception_break(self, name, on_termination=False, on_raise=True):
        self.send(Commands.ADD_EXCEPTION_BREAK, name, on_termination, on_raise)

    def remove_exception_break(self, name):
        self.send(Commands.REMOVE_EXCEPTION_BREAK, name)

    def js_eval(self, source):
        self.send(Commands.JS_EVAL, source)

    def js_debugger(self):
        self.send(Commands.JS_DEBUGGER)

    def exec_in_frame(self, thread_id, frame_id, source):
        code = converter.convert(compile(source, '<debugger>', 'exec'))
        return self.send(Commands.RUN_IN_FRAME, thread_id, frame_id, code)

    def eval_in_frame(self, thread_id, frame_id, source):
        code = converter.convert(compile(source, '<debugger>', 'eval'))
        return self.send(Commands.RUN_IN_FRAME, thread_id, frame_id, code)

    def run_in_thread(self, source):
        code = converter.convert(compile(source, '<debugger>', 'exec'))
        return self.send(Commands.RUN_IN_THREAD, code)

    def get_locals(self, thread_id, frame_id):
        seq = self.send(Commands.GET_LOCALS, thread_id, frame_id)
        self.futures[seq] = asyncio.Future()
        return self.futures[seq]

    async def debug(self):
        sessions.append(self)
        try:
            session_created.emit(self)
            async for message in self.websocket:
                if message.tp == aiohttp.MsgType.text:
                    data = json.loads(message.data)
                    seq = int(data['seq'])
                    if seq in self.futures:
                        self.futures[seq].set_result((data['event'], data['args']))
                        del self.futures[seq]
                    event = self.events[Events(data['event'])]
                    event.emit(self, seq, *data['args'])
        finally:
            sessions.remove(self)
            session_closed.emit(self)
