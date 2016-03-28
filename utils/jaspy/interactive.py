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

from . import debugger


INFO = Token.Info
SUCCESS = Token.Success
WARNING = Token.Warning
ERROR = Token.Error

style = style_from_dict({
    Token.Info: '#5555FF',
    Token.Success: '#00FF00',
    Token.Warning: '#FF5500',
    Token.Error: '#FF0000',
    Token.Trace: '#888888',
    Token.Variable: '#FF8888'
}, include_defaults=True)


FRAME_TEMPLATE = ('|   Frame {} [{name}]:{linesep}'
                  '|     File: {file}{linesep}'
                  '|     Line: {line}{linesep}')

VARIABLE_HEADER = 'Received variable {} from thread {} frame {}!'


def format_variable_path(path):
    if not path:
        return '<locals>'
    parts = []
    for component in path:
        if isinstance(component, str):
            if parts: parts.append('.')
            parts.append(component)
        else:
            parts.append('[' + str(component) + ']')
    return ''.join(parts)


class InteractiveConsole:
    def __init__(self, server, history=os.path.expanduser('~/.jaspy.history')):
        self.server = server
        self.namespace = {'sessions': debugger.sessions}
        self.history = history
        self.cli = None
        self.running = False

        debugger.session_created += self.on_session_created
        debugger.session_closed += self.on_session_closed

        self.server.on_running += self.on_server_running

    def start(self):
        self.running = True

        coroutine = embed(self.namespace, self.namespace, title='Jaspy Console',
                          patch_stdout=True, history_filename=self.history,
                          return_asyncio_coroutine=True)

        # HACK: nasty hack to gain access to the command line interface wrapper
        self.cli = coroutine.gi_frame.f_locals['cli']

        future = asyncio.ensure_future(coroutine)
        future.add_done_callback(self.on_closed)
        return future

    def print_tokens(self, tokens):
        if self.running:
            def printer():
                print_tokens(tokens, style=style)
            self.cli.run_in_terminal(printer)

    def print_message(self, message, kind=SUCCESS):
        self.print_tokens([(kind, '<<< ' + message + os.linesep)])

    def on_closed(self, future):
        self.running = False

    def on_server_running(self, server):
        msg = 'Sever is running on http://{}:{}/!'.format(server.host, server.port)
        self.print_message(msg, INFO)

    def on_session_created(self, session):
        self.print_message('Remote debugging session created!')
        self.print_message('debugger = {}'.format(session), INFO)

        self.namespace['debugger'] = session

        session.on_error += self.on_error
        session.on_success += self.on_success

        session.on_running += self.on_running

        session.on_thread_suspended += self.on_thread_suspended

        session.on_locals += self.on_locals

        session.on_console_log += self.on_console_log
        session.on_console_error += self.on_console_error

    def on_session_closed(self, session):
        self.print_message('Remote debugging session closed!', WARNING)

    def on_thread_suspended(self, session, seq, thread_id, frames):
        self.print_message('Thread {} has been suspended!'.format(thread_id))
        tokens = [(Token.Trace, '| Traceback (most recent call first):' + os.linesep)]
        self.print_tokens(tokens)
        for index, frame in enumerate(frames):
            message = FRAME_TEMPLATE.format(index, linesep=os.linesep, **frame)
            self.print_tokens([(Token.Trace, message)])

    def on_error(self, session, seq, message):
        self.print_message('Error: ' + message, ERROR)

    def on_success(self, session, seq, message):
        self.print_message('Success: ' + message, SUCCESS)

    def on_running(self, session, seq, module_name, argv):
        self.print_message('Program is running!')

    def on_variable(self, session, seq, thread_id, frame_id, path, result):
        header = VARIABLE_HEADER.format(format_variable_path(path), thread_id, frame_id)
        self.print_message(header)
        tokens = []
        for name in sorted(result.keys()):
            info = result[name]
            tokens.extend([
                (Token.Trace, '| '),
                (Token.Variable, name),
                (Token.Normal, ' = '),
                (Token.Trace, '{%s} ' % info['type']),
                (Token.Normal, info['value'] + os.linesep)
            ])
        self.print_tokens(tokens)

    def on_console_log(self, session, seq, *strings):
        self.print_tokens([(Token.Trace, ' '.join(strings) + os.linesep)])

    def on_console_error(self, session, seq, *strings):
        self.print_tokens([(Token.Warning, ' '.join(strings) + os.linesep)])

    def on_locals(self, session, seq, result):
        self.print_message('Received local frame variables!')
        tokens = []
        for name in sorted(result.keys()):
            info = result[name]
            tokens.extend([
                (Token.Trace, '| '),
                (Token.Variable, name),
                (Token.Normal, ' = '),
                (Token.Trace, '{%s} ' % info['type']),
                (Token.Normal, info['value'] + os.linesep)
            ])
        self.print_tokens(tokens)


