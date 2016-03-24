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

import json

import aiohttp

sessions = []


EVENTS = {
    'emit_threads': 'on_threads',
    'emit_pause': 'on_pause'
}


class Debugger:
    def __init__(self, websocket):
        self.websocket = websocket
        self.identifier = 0
        self.listeners = []

    def send(self, cmd, *args, identifier=None):
        if identifier is None:
            identifier = self.identifier
            self.identifier += 1
        message = {'cmd': cmd, 'args': args, 'id': identifier}
        self.websocket.send_str(json.dumps(message))

    def run(self, thread_id=0):
        self.send('run', thread_id)

    def suspend(self, thread_id):
        self.send('suspend', thread_id)

    def kill(self, thread_id):
        self.send('kill', thread_id)

    def break_add(self, filename, line):
        self.send('break_add', filename, line)

    def break_remove(self, filename, line):
        self.send('break_remove', filename, line)

    def exc_break_add(self, exc_qualname):
        self.send('exc_break_add', exc_qualname)

    def exc_break_remove(self, exc_qualname):
        self.send('exc_break_remove', exc_qualname)

    def register_listener(self, listener):
        self.listeners.append(listener)

    def unregister_listener(self, listener):
        self.listeners.remove(listener)

    async def handle(self):
        sessions.append(self)

        try:
            async for message in self.websocket:
                if message.tp == aiohttp.MsgType.text:
                    data = json.loads(message.data)
                    event = EVENTS[data['cmd']]
                    for listener in self.listeners:
                        getattr(listener, event)(int(data['seq']), *data['args'])
        finally:
            sessions.remove(self)
