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


var debugging = {
    enabled: false,
    connected: false,

    module: null,
    argv: null,

    websocket: null,

    id: 0,

    step: function () {
        if (debugging.connected) {
            if (threading.thread.debug_break) {
                debug_send_message('PAUSE', [threading.thread.identifier]);
                threading.drop();
                return true;
            }
        }
    },

    trace_call: function () {
        //debugging.websocket.send('call');
    },

    send_message: function (cmd, args, id) {
        id = id == undefined ? debugging.id++ : id;
        debugging.websocket.send(JSON.stringify({'cmd': cmd, 'id': id, 'args': args}));
    },

    send_hello: function () {
        debugging.send_message('hello');
    },

    onmessage: function (event) {
        var message = JSON.parse(event.data);
        debugging.commands[message.cmd].apply(null, [message.id].concat(message.args));
    },

    commands: {
        'run': function () {
            main(debugging.module, debugging.argv);
        },

        'get_threads': function (id) {
            var identifier;
            var result = [];
            for (identifier in threading.registry) {
                if (threading.registry.hasOwnProperty(identifier)) {
                    result.push(identifier);
                }
            }
            debugging.send_message('get_threads', [result], id);
        },

        'thread_suspend': function (id, identifier) {
            threading.registry[identifier].debug_break = true;
        },

        'thread_run': function (id, identifier) {
            threading.registry[identifier].debug_break = false;
            threading.registry[identifier].enqueue();
            threading.resume();
        },

        'EXCEPTION_BREAK_ADD': function () {

        },

        'EXCEPTION_BREAK_REMOVE': function () {

        },

        'BREAK_ADD': function () {

        },

        'BREAK_REMOVE': function () {

        },

        'THREAD_RUN': function () {

        },

        'GET_THREADS': function () {

        }


    }
};


function debug_send_message(cmd, args, id) {

    debugging.websocket.send(JSON.stringify({'cmd': cmd, 'id': id, 'args': args}));
}



function debug_ws_onopen(event) {
    debugging.connected = true;
    debugging.send_hello();
}

function debug_ws_onmessage(event) {
    console.log('[debugger] message: ' + event);
}

function debug_ws_onerror(error) {
    debugging.connected = false;
    alert('Jaspy Debugger: Connection error \'' + error.message + '\'!');
}

function debug_ws_onclose(event) {
    debugging.connected = false;
    alert('Jaspy Debugger: Connection has been closed!');
}

function debug_patch_console() {
}

function debug(module, argv, url, options) {
    if (debugging.enabled) {
        raise(RuntimeError, 'debugger has already been started');
    }
    debugging.enabled = true;
    debugging.module = module;
    debugging.argv = argv;
    debugging.websocket = new WebSocket(url);
    debugging.websocket.onopen = debug_ws_onopen;
    debugging.websocket.onerror = debug_ws_onerror;
    debugging.websocket.onmessage = debugging.onmessage;
    debugging.websocket.onclose = debug_ws_onclose;

    options = options || {};
}


$.debug = debug;
