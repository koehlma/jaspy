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

from urllib.parse import quote
from xml.sax.saxutils import escape


class Commands(enum.IntEnum):
    VERSION = 501
    RETURN = 502
    ERROR = 901

    RUN = 101

    THREAD_CREATE = 103
    THREAD_KILL = 104
    THREAD_SUSPEND = 105
    THREAD_RUN = 106

    STEP_INTO = 107
    STEP_OVER = 108
    STEP_RETURN = 109

    ADD_BREAK = 111
    REMOVE_BREAK = 112

    ADD_EXCEPTION_BREAK = 122
    REMOVE_EXCEPTION_BREAK = 123

    GET_VARIABLE = 110

    def make(self, sequence_number, *arguments):
        payload = quote('\t'.join(map(str, arguments)), '/<>_=" \t')
        return '{}\t{}\t{}\n'.format(self, sequence_number, payload)


VERSION_CMD = Commands.VERSION.make(1, 'PY-143.1919.0')

XML_THREAD = '<thread id="{}" name="{}" />'
XML_THREAD_SUSPEND = '<thread id="{}">{}</thread>'

XML_FRAME = '<frame id="{}" name="{}" file="{}" line="{}" />'


def make_xml_value(value):
    return escape(str(value), {'"': '&quot;'})


class PyDevRemote:
    def __init__(self, debugger, host='localhost', port=5678):
        self.debugger = debugger
        self.host = host
        self.port = port
        self.reader = None
        self.writer = None

        self.debugger.on_thread_created += self.thread_created

        self.sequence_counter = itertools.count(2, 2)

    async def run(self):
        self.reader, self.writer = await asyncio.open_connection(self.host, self.port)

        self.writer.write(VERSION_CMD)

        async for line in self.reader:
            try:
                cmd, seq, *args = line.decode('utf-8').strip().split('\t')
                cmd, seq = int(cmd), int(seq)
            except ValueError:
                self.send_error('invalid message format')
                continue
            try:
                getattr(self, Commands(cmd).name.lower())(int(seq), *args)
            except Exception as error:
                self.send_error('error executing command \'{}\''.format(error))

    def start(self):
        return asyncio.ensure_future(self.run())

    def send(self, command, *arguments, sequence_number=None):
        if sequence_number is None:
            sequence_number = next(self.sequence_counter)
        self.writer.write(command.make(sequence_number, *arguments).encode('uft-8'))

    def thread_created(self, session, seq, thread_name, thread_id):
        name = quote(make_xml_value(thread_name))
        self.send(Commands.THREAD_CREATE, XML_THREAD.format(name, thread_id))

    def send_error(self, message):
        self.send(Commands.ERROR, message)

    """"

    def cmd_version(self, seq, version, platform='WINDOWS', breakpoint_id=None):
        print('PyCharm New Connection')
        print('Version:', version)
        print('Platform:', platform)
        if breakpoint_id == 'ID':
            self.send_error('breakpoint ids not supported')

    def cmd_break_add(self, seq, kind, filename, line, funcname, condition, expression):
        if kind == 'python-line':
            self.debugger.add_line_break(filename, line)
            print(kind, filename, line, funcname, condition, expression)
        else:
            self.send_error('unknown breakpoint type')

    def cmd_thread_suspend(self, seq, thread_id):
        self.debugger.suspend(int(thread_id))

    def cmd_run(self, seq):
        self.debugger.run()

    def on_hello(self, *args):
        pass

    def on_error(self, *args):
        pass

    def on_success(self, *args):
        pass

    def on_suspended(self, debugger, seq, thread_id, frames):
        payload = [
            '<xml>',
            '<thread id="{}" stop_reason="105" message="None">'.format(thread_id)
        ]
        for number, frame in enumerate(frames):
            payload.append(('<frame id="{}" name="{name}" file="{file}" line="{line}" />'
                            ).format(number, **frame))
        payload.append('</thread></xml>')
        self.send(105, quote(''.join(payload), ))

    def on_thread_created(self, debugger, seq, thread_name, thread_id):
        name = quote(make_xml_value(thread_name))
        payload = '<xml><thread name="{}" id="{}" /></xml>'.format(name, thread_id)
        self.send(103, quote(payload, '/<>_=" \t'))

    def on_thread_finished(self, debugger, seq, thread_id):
        self.send(104, thread_id)
    """








