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
import os.path

import aiohttp
import aiohttp.web

from .debugger import Debugger
from .converter import compile_and_convert


class Server:
    def __init__(self, jaspy_js, modules_dir, host='localhost', port=8080, root_dir='.'):
        self.jaspy_js = jaspy_js
        self.modules_dir = modules_dir

        self.host = host
        self.port = port

        self.root_dir = root_dir

        self.application = aiohttp.web.Application()
        self.router = self.application.router
        self.router.add_route('GET', '/debugger', self.debugger)
        self.router.add_route('GET', '/load/{name}', self.load)
        self.router.add_route('GET', '/jaspy.js', self.jaspy)
        self.router.add_static('/modules', self.modules_dir)
        self.router.add_static('/', self.root_dir)

    async def debugger(self, request):
        websocket = aiohttp.web.WebSocketResponse()
        await websocket.prepare(request)

        debugger = Debugger(websocket)
        await debugger.handle()

        return websocket

    async def load(self, request):
        name = request.match_info['name']
        url = os.path.join(self.root_dir, '/'.join(name.split('.')))
        if os.path.isdir(url):
            url = os.path.join(url, '__init__.py')
        else:
            url = '{}.py'.format(url)
        source = compile_and_convert(url)
        text = 'jaspy.module(%r, %s);' % (name, source)
        return aiohttp.web.Response(text=text, content_type='application/javascript')

    def jaspy(self, request):
        with open(self.jaspy_js, 'r') as jaspy_js_file:
            text = jaspy_js_file.read()
        return aiohttp.web.Response(text=text, content_type='application/javascript')

    def start(self):
        loop = asyncio.get_event_loop()
        coro = loop.create_server(self.application.make_handler(), self.host, self.port)
        asyncio.ensure_future(coro)
