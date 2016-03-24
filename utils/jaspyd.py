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

import argparse
import asyncio
import os.path

import jaspy


__dir__ = os.path.dirname(__file__)
default_jaspy_js = os.path.join(__dir__, '..', 'build', 'jaspy.js')
default_modules_dir = os.path.join(__dir__, '..', 'modules')


parser = argparse.ArgumentParser()
parser.add_argument('--host', default='localhost')
parser.add_argument('--port', default=8080, type=int)
parser.add_argument('--root-directory', default='.')
parser.add_argument('--jaspy-js', default=default_jaspy_js)
parser.add_argument('--modules-directory', default=default_modules_dir)

arguments = parser.parse_args()

root_directory = os.path.abspath(arguments.root_directory)

server = jaspy.Server(arguments.jaspy_js, arguments.modules_directory,
                      arguments.host, arguments.port, root_directory)

server.start()

asyncio.get_event_loop().run_forever()





"""
import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('root_directory')
    parser.add_argument('-i', '--interactive')
"""
"""
Remote Debugging Protocol
=========================

Message-Format:

    ["$CMD", $ARGS...]


Commands:
HELLO(version)

GET_VARIABLE(identifier)
GET_FRAME(identifier)
GET_THREADS()


EVAL(bytecode)
"""
"""
commands = {
    'HELLO': [str],

}

import abc

import json



import asyncio

import aiohttp

from aiohttp import web


sessions = []


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
                    pprint.pprint(json.loads(message.data))
        finally:
            sessions.remove(self)


class DebuggerListener(abc.ABC):
    def on_threads(self):
        pass

    def on_pause(self):
        pass

    def on_locals(self):
        pass


PATH = '/home/maximilian/Entwicklung/SocialCUBE/libs/jaspy/example/'

class PyCharmRemoteDebugger(DebuggerListener):
    def __init__(self, host, port, debugger=None):
        self.host = host
        self.port = port
        self.reader = None
        self.writer = None
        self.commands = {
            '501': self._cmd_version,

            '111': self._cmd_break_add,
            '112': self._cmd_break_remove,

            '122': self._cmd_dummy,

            '101': self._cmd_run
        }
        self.debugger = debugger

    def on_threads(self):
        pass

    def on_pause(self):
        pass

    async def run(self):
        self.reader, self.writer = await asyncio.open_connection(self.host, self.port)

        self.writer.write(b'501\t1\tPY-143.1919.0\n')

        while True:
            line = await self.reader.readline()

            if not line:
                break

            cmd, seq, *parts = line.decode('utf-8').strip().split('\t')
            print('PyCharm-Debugger:', cmd, seq, parts)
            self.commands[cmd](int(seq), *parts)

    def start(self):
        loop = asyncio.get_event_loop()
        return loop.create_task(self.run())

    def _cmd_version(self, seq, version, platform):
        print(seq, version, platform)

    def _cmd_break_add(self, seq, kind, filename, line, name, condition, expression):
        filename = filename.replace(PATH, '')
        print(seq, kind, filename, line, name, condition, expression)
        self.debugger.break_add(filename, int(line))

    def _cmd_break_remove(self, seq, kind, filename, line):
        filename = filename.replace(PATH, '')
        print(seq, kind, filename, line)
        self.debugger.break_remove(filename, int(line))

    def _cmd_run(self, _):
        self.debugger.run()

    def _cmd_dummy(self, *args):
        pass

    def on_pause(self, thread_id, frames):
        pass




async def endpoint_import(request):
    print(request)
    return web.Response(body=b'Import Endpoint')


import json
import pprint


async def endpoint_debug(request):
    websocket = web.WebSocketResponse()
    await websocket.prepare(request)

    debugger = Debugger(websocket)
    await debugger.handle()

    return websocket







from ptpython.repl import embed

loop = asyncio.get_event_loop()
loop.create_task(embed(globals(), locals(), title='Jaspy Debugger', patch_stdout=True,
                       return_asyncio_coroutine=True,
                       history_filename='/home/maximilian/.jaspy.history'))


#remote = PyDevRemote('localhost', 1234)
#loop.create_task(remote.run())


app = web.Application()
app.router.add_route('GET', '/import', endpoint_import)
app.router.add_route('GET', '/debug', endpoint_debug)
app.router.add_static('/', '.')

loop.run_until_complete(loop.create_server(app.make_handler(), host='localhost', port=8080))
loop.run_forever()
"""