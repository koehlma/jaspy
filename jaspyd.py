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

commands = {
    'HELLO': [str],

}

import json



import asyncio

import aiohttp

from aiohttp import web


sessions = []


class Debugger:
    def __init__(self, websocket):
        self.websocket = websocket
        self.identifier = 0

    def send(self, cmd, *args, identifier=None):
        if identifier is None:
            identifier = self.identifier
            self.identifier += 1
        self.websocket.send_str(json.dumps({'cmd': cmd, 'args': args, 'id': identifier}))

    def run(self):
        self.send('run')

    def suspend(self, thread_id):
        self.send('suspend', thread_id)


async def endpoint_import(request):
    print(request)
    return web.Response(body=b'Import Endpoint')


async def endpoint_debug(request):
    websocket = web.WebSocketResponse()
    await websocket.prepare(request)

    debugger = Debugger(websocket)

    sessions.append(debugger)

    async for message in websocket:
        if message.tp == aiohttp.MsgType.text:
            print(message.data)

    sessions.remove(debugger)

    return websocket






from ptpython.repl import embed

loop = asyncio.get_event_loop()
loop.create_task(embed(globals(), locals(), title='Jaspy Debugger', patch_stdout=True,
                 return_asyncio_coroutine=True))

app = web.Application()
app.router.add_route('GET', '/import', endpoint_import)
app.router.add_route('GET', '/debug', endpoint_debug)
app.router.add_static('/', '.')

loop.run_until_complete(loop.create_server(app.make_handler(), host='localhost', port=8080))
loop.run_forever()
