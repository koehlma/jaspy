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
import os

from pygments.token import Token

from prompt_toolkit.styles import style_from_dict
from prompt_toolkit.shortcuts import print_tokens

from ptpython.repl import embed

from . import event
from .debugger import sessions


INFO = Token.Info
SUCCESS = Token.Success
WARNING = Token.Warning
ERROR = Token.Error

style = style_from_dict({
    Token.Info: '#5555FF',
    Token.Success: '#00FF00',
    Token.Warning: '#FF5500',
    Token.Error: '#FF0000',
    Token.Trace: '#888888'
}, include_defaults=True)


class InteractiveConsole:
    def __init__(self, history=os.path.expanduser('~/.jaspy.history')):
        self.namespace = {'sessions': sessions}
        self.history = history
        self.cli = None
        event.register('session_created', self.on_session_created)
        event.register('session_closed', self.on_session_closed)

    def start(self):
        coro = embed(self.namespace, self.namespace, title='Jaspy Console',
                     patch_stdout=True, history_filename=self.history,
                     return_asyncio_coroutine=True)

        loop = asyncio.get_event_loop()
        loop.create_task(coro)
        self.cli = coro.gi_frame.f_locals['cli']

    def print_tokens(self, tokens):
        def printer():
            print_tokens(tokens, style=style)
        self.cli.run_in_terminal(printer)

    def print_message(self, message, kind=SUCCESS):
        self.print_tokens([(kind, '<<< ' + message + os.linesep)])

    def on_session_created(self, debugger):
        self.print_message('Remote debugging session created!')
        debugger.register_listener(self)

    def on_session_closed(self, debugger):
        self.print_message('Remote debugging session closed!', WARNING)
        debugger.unregister_listener(self)

    def on_hello(self, debugger, seq):
        self.namespace['debugger'] = debugger
        self.print_message('Remote debugger has been started!', INFO)
        self.print_message('debugger = {}'.format(debugger), INFO)

    def on_suspended(self, debugger, seq, thread_id, frames):
        self.print_message('Thread {} has been suspended!'.format(thread_id))
        tokens = [(Token.Trace, '| Traceback (most recent call first):' + os.linesep)]
        self.print_tokens(tokens)
        for index, frame in enumerate(frames):
            message = (
                '|   Frame {} [{name}]:{linesep}'
                '|     File: {file}{linesep}'
                '|     Line: {line}{linesep}'
            ).format(index, linesep=os.linesep, **frame)
            self.print_tokens([(Token.Trace, message)])
