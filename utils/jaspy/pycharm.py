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
import itertools
import logging

logger = logging.getLogger(__name__)


COMMANDS = {
    '501': 'cmd_version',

    '111': 'cmd_break_add',
    '112': 'cmd_break_remove',

    '122': 'cmd_exc_break_add',

    '101': 'cmd_run'
}


class PyCharmRemoteDebugger:
    def __init__(self, debugger, host='localhost', port=5678):
        self.debugger = debugger
        self.host = host
        self.port = port
        self.reader = None
        self.writer = None
        self.seq = itertools.count(2, 2)

    async def run(self):
        self.reader, self.writer = await asyncio.open_connection(self.host, self.port)

        self.writer.write(b'501\t1\tPY-143.1919.0\n')

        async for line in self.reader:
            try:
                cmd, seq, *args = line.decode('utf-8').strip().split('\t')
            except ValueError:
                self.send_error('invalid message format')
                continue
            try:
                getattr(self, COMMANDS[cmd])(int(seq), *args)
            except Exception as error:
                self.send_error('error executing command \'{}\''.format(error))

    def cmd_version(self, seq, version, platform='WINDOWS', breakpoint_id=None):
        print('PyCharm New Connection')
        print('Version:', version)
        print('Platform:', platform)
        if breakpoint_id == 'ID':
            self.send_error('breakpoint ids not supported')

    def cmd_break_add(self, seq, kind, filename, line, funcname, condition, expression):
        if kind == 'python-line':
            print(kind, filename, line, funcname, condition, expression)
        else:
            self.send_error('unknown breakpoint type')

    def send(self, cmd, *args, seq=None):
        if seq is None:
            seq = next(self.seq)
        message = '{}\t{}\t{}\n'.format(cmd, seq, '\t'.join(map(str, args)))
        self.writer.write(message.encode('utf-8'))

    def send_error(self, message):
        logger.warning(message)
        self.send('901', message)

    def start(self):
        return asyncio.ensure_future(self.run())
