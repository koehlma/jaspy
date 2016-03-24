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

    breakpoints: {},

    id: 0,

    step: function () {
        var line;

        if (debugging.connected) {
            if (vm.frame.code.filename in debugging.breakpoints) {
                line = vm.frame.get_line_number();
                if (line != vm.frame.debug_line && line in debugging.breakpoints[vm.frame.code.filename]) {
                    threading.thread.debug_break = true;
                }
                vm.frame.debug_line = line;
            }
            if (threading.thread.debug_break) {
                var frame = vm.frame;
                var frames = [];
                while (frame) {
                    var locals = {};
                    frames.push({
                        'file': frame.code.filename,
                        'name': frame.code.name,
                        'line': frame.get_line_number()
                    });
                    frame = frame.back;
                }
                debug_send_message('pause', [threading.thread.identifier, frames]);
                threading.drop();
                return true;
            }
        }
    },

    trace_call: function () {
        //debugging.websocket.send('call');
    },


    trace_raise: function (exc_type, exc_value, exc_tb) {
        console.log('trace exception');
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
        'run': function (seq, thread_id) {
            if (thread_id == 0) {
                main(debugging.module, debugging.argv);
            } else {
                threading.registry[thread_id].debug_break = false;
                threading.registry[thread_id].enqueue();
                threading.resume();
            }
        },

        'suspend': function (id, thread_id) {
            threading.registry[thread_id].debug_break = true;
        },

        'kill': function (id, thread_id) {
            var thread = threading.registry[thread_id];
            thread.restore();
            raise(SystemExit, 'thread has been killed by debugger', null, true);
            thread.save();
        },

        'get_threads': function (seq) {
            var identifier;
            var result = [];
            for (identifier in threading.registry) {
                if (threading.registry.hasOwnProperty(identifier)) {
                    result.push(parseInt(identifier));
                }
            }
            debugging.send_message('threads', [result], seq);
        },

        'get_locals': function (id, thread_id, frame_id) {
            var name;
            var locals = {};
            var frame = threading.registry[thread_id].frame;
            while (frame_id > 0) {
                frame = frame.back;
                frame_id--;
            }
            if (!frame) {
                debugging.send_message('error', ['invalid frame number'], id);
            }
            if (frame instanceof PythonFrame) {
                for (name in frame.locals) {
                    if (frame.locals.hasOwnProperty(name)) {
                        locals[name] = {
                            'type': frame.locals[name].cls.name,
                            'repr': frame.locals[name].repr()
                        }
                    }
                }
            } else {
                for (name in frame) {
                    if (frame.hasOwnProperty(name)) {
                        locals[name] = {
                            'type': typeof frame[name],
                            'repr': frame[name].toString()
                        }
                    }
                }
            }

            debugging.send_message('locals', [thread_id, frame_id, locals], id);
        },




        'break_add': function (id, filename, line) {
            if (!(filename in debugging.breakpoints)) {
                debugging.breakpoints[filename] = {};
            }
            debugging.breakpoints[filename][line] = true;
        },

        'break_remove': function (seq, filename, line) {
            delete debugging.breakpoints[filename][line];
        },


        'js_eval': function (id, code) {
            eval(code);
        },

        'js_debugger': function (id) {
            debugger;
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
