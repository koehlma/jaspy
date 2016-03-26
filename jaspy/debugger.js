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

/**
 * Implements a debugger for Jaspy. The Debugger requires the threading module.
 *
 *  - line breakpoints specified by filename and line number
 *  - exception breakpoints specified by qualified exception name
 *      - on raise: break directly when exception is raised
 *      - on termination: break after thread has been terminated (post mortem)
 *  - step over — step forward to next line in the current or outer frame
 *  - step out — step to the next step in the outer frame
 *  - step into — stop into new child frame on function call and step over otherwise
 *
 */


var debugging = {
    enabled: false,
    connected: false,

    module: null,
    argv: null,

    websocket: null,

    line_breakpoints: {},
    exception_breakpoints: {},

    console_patched: false,

    sequence_counter: 0,


    run: function () {
        main(debugging.module, debugging.argv);
        debugging.emit('running', [debugging.module.name, debugging.argv]);
    },

    add_break: function (filename, line, condition, expression) {
        if (!(filename in this.line_breakpoints)) {
            debugging.line_breakpoints[filename] = {};
        }
        debugging.line_breakpoints[filename][line] = {
            condition: condition, expression: expression
        };
        debugging.emit('break_added', [filename, line, condition, expression]);
    },

    remove_break: function (filename, line) {
        delete debugging.line_breakpoints[filename][line];
        debugging.emit('break_removed', [filename, line]);
    },

    add_exception_break: function (name, on_termination, on_raise) {
        debugging.exception_breakpoints[name] = {
            on_termination: on_termination, on_raise: on_raise
        };
        debugging.emit('exception_break_added', [name, on_termination, on_raise]);
    },

    remove_exception_break: function (name) {
        delete debugging.exception_breakpoints[name];
        debugging.emit('exception_break_removed', [name])
    },

    suspend_thread: function (thread_id) {
        threading.get_thread(thread_id).frame.debug_break = true;
    },

    resume_thread: function (thread_id) {
        var thread = threading.get_thread(thread_id);
        debugging.resume(thread);
    },

    kill_thread: function (thread_id) {
        var thread = threading.get_thread(thread_id);
        thread.restore();
        raise(SystemExit, 'thread has been killed by debugger', null, true);
        thread.save();
    },

    step_over: function (thread_id) {
        var thread = threading.get_thread(thread_id);
        if (!thread.debug_suspended) {
            throw new Error('Thread ' + thread_id + ' not suspended by debugger!');
        }
        thread.frame.debug_step_over = true;
        debugging.resume(thread);
    },

    step_into: function (thread_id) {
        var thread = threading.get_thread(thread_id);
        if (!thread.debug_suspended) {
            throw new Error('Thread ' + thread_id + ' not suspended by debugger!');
        }
        thread.frame.debug_step_into = true;
        debugging.resume(thread);
    },

    step_out: function (thread_id) {
        var thread = threading.get_thread(thread_id);
        if (!thread.debug_suspended) {
            throw new Error('Thread ' + thread_id + ' not suspended by debugger!');
        }
        thread.frame.debug_step_out = true;
        debugging.resume(thread);
    },


    connect: function (url) {
        debugging.websocket = new WebSocket(url);
        debugging.websocket.onopen = debugging.onopen;
        debugging.websocket.onerror = debugging.onerror;
        debugging.websocket.onmessage = debugging.onmessage;
        debugging.websocket.onclose = debugging.onclose;
    },

    onopen: function (event) {
        debugging.connected = true;
        debugging.emit_hello();
        debugging.emit_thread_created(threading.main);
    },

    onerror: function (event) {
        debugging.connected = false;
        alert('Connection to remote debugger has been aborted!');
    },

    onmessage: function (event) {
        var message = JSON.parse(event.data);
        try {
            debugging.commands[message.cmd].apply(null, [message.seq].concat(message.args));
        } catch (error) {
            debugging.emit_error(error.message, message.seq);
        }
    },

    onclose: function (event) {
        debugging.connected = false;
        alert('Connection to remote debugger has been closed!');
    },


    trace_line: function (frame, line) {
        if (frame.debug_step_over || frame.debug_step_into) {
            frame.debug_break = true;
            frame.debug_step_over = false;
            frame.debug_step_into = false;
        } else if (frame.code.filename in debugging.line_breakpoints) {
            // TODO: evaluate condition and expression
            if (debugging.line_breakpoints[frame.code.filename][line]) {
                frame.debug_break = true;
            }
        }
    },

    trace_call: function (frame) {
        if (frame.back && frame.back.debug_step_into) {
            frame.debug_break = true;
            frame.debug_step_into = false;
        }
    },

    trace_return: function (frame) {
        if (frame.back && (frame.debug_step_out || frame.debug_step_over)) {
            frame.back.debug_break = true;
            frame.debug_step_out = false;
            frame.debug_step_over = false;
        }
    },

    trace_raise: function (exc_type, exc_value, exc_tb) {
        // TODO: implement
    },

    trace_thread_created: function (thread) {
        debugging.emit_thread_created(thread);
    },

    trace_thread_finished: function (thread) {
        debugging.emit_thread_finished(thread);
    },

    trace_console_log: function () {
        var index;
        var strings = [];
        for (index = 0; index < arguments.length; index++) {
            strings.push(arguments[index].toString());
        }
        debugging.emit('console_log', strings);
    },

    trace_console_error: function () {
        var index;
        var strings = [];
        for (index = 0; index < arguments.length; index++) {
            strings.push(arguments[index].toString());
        }
        debugging.emit('console_error', strings);
    },


    suspend: function () {
        var frame, frames;
        threading.thread.debug_suspended = true;
        frame = vm.frame;
        frames = [];
        while (frame) {
            frames.push({
                'file': frame.code.filename,
                'line': frame.get_line_number(),
                'name': frame.code.name
            });
            frame = frame.back;
        }
        debugging.emit('thread_suspended', [threading.thread.identifier, frames]);
        threading.drop();
    },

    resume: function (thread) {
        if (!thread.debug_suspended) {
            throw new Error('Unable to resume thread not suspended by debugger!');
        }
        thread.debug_suspended = false;
        thread.enqueue();
        threading.resume();
        debugging.emit('thread_resumed', [thread.identifier]);
    },

    step: function () {
        if (debugging.connected) {
            if (vm.frame.debug_break) {
                vm.frame.debug_break = false;
                debugging.suspend();
                return true;
            }
        }
    },


    emit: function (cmd, args, seq) {
        if (debugging.connected) {
            seq = seq == undefined ? debugging.sequence_counter++ : seq;
            debugging.websocket.send(JSON.stringify({'event': cmd, 'seq': seq, 'args': args || []}));
        }
    },

    emit_hello: function () {
        debugging.emit('hello');
    },

    emit_error: function (message, seq) {
        debugging.emit('error', [massage], seq);
    },

    emit_thread_created: function (thread) {
        debugging.emit('thread_created', [thread.name, thread.identifier]);
    },

    emit_thread_finished: function (thread) {
        debugging.emit('thread_finished', [thread.identifier]);
    },


    commands: {
        run: function (seq) {
            if (threading.main.frame) {
                throw new Error('Main thread is already running!');
            }
            debugging.run();
        },

        resume_thread: function (seq, thread_id) {
            debugging.resume_thread(thread_id);
        },

        suspend_thread: function (seq, thread_id) {
            debugging.suspend_thread(thread_id);
        },

        kill_thread: function (seq, thread_id) {
            debugging.kill_thread(thread_id);
        },

        step_over: function (seq, thread_id) {
            debugging.step_over(thread_id);
        },

        step_into: function (seq, thread_id) {
            debugging.step_into(thread_id);
        },

        step_out: function (seq, thread_id) {
            debugging.step_out(thread_id);
        },




        'get_threads': function (seq) {
            var identifier;
            var result = [];
            for (identifier in threading.registry) {
                if (threading.registry.hasOwnProperty(identifier)) {
                    result.push(parseInt(identifier));
                }
            }
            debugging.emit('threads', [result], seq);
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
                debugging.emit('error', ['invalid frame number'], id);
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

            debugging.emit('locals', [thread_id, frame_id, locals], id);
        },

        get_variable: function (seq, thread_id, frame_id, path) {
            var index, name, value;
            var thread = threading.get_thread(thread_id);
            var frame = thread.get_frame(frame_id);
            var current = frame.locals;
            for (index = 0; index < path.length; index++) {
                name = path[index];
                if (name in current) {
                    if (current instanceof PyObject) {
                        current = current.get(name);
                    } else {
                        current = current[name];
                    }
                } else {
                    throw new Error('Unable to find variable ' + path.join('.') + '!');
                }
            }
            var result = {};
            if (current instanceof Object) {
                for (name in current) {
                    if (current.hasOwnProperty(name)) {
                        value = current[name];
                        result[name] = {
                            'type': value.cls.name,
                            'value': value.toString()
                        };
                    }
                }
            }
            debugging.emit('variable', [thread_id, frame_id, path, result], seq);
            console.info(path, current);
        },

        /*

        step_over: function (seq, thread_id, frame_number) {
            var thread = threading.get_thread(thread_id);
            var frame = thread.get_frame(frame_number || 0);
            if (!thread.debug_suspended) {
                console.error('tried to step over in running thread');
                return;
            }
            frame.debug_step_over = true;
            debugging.resume(thread);
        },*/

        eval: function (seq, thread_id, frame_number, source) {
            var code = eval(source);
            var thread = threading.get_thread(thread_id);
            var frame = thread.get_frame(frame_number);
            thread.restore();
            vm.frame = new PythonFrame(code.code, {
                back: vm.frame, locals: frame.locals, globals: frame.globals,
                namespace: frame.namespace
            });
            thread.save();
        },

        exec: function (seq, source) {
            var code = eval(source);
            (new Thread(new PythonFrame(code.code))).enqueue();
            threading.resume();
        },

        add_line_break: function (id, filename, line) {
            if (!(filename in debugging.line_breakpoints)) {
                debugging.line_breakpoints[filename] = {};
            }
            debugging.line_breakpoints[filename][line] = true;
            debugging.emit('success', ['Line breakpoint for file \'' + filename + '\' on line ' + line + ' added!'], id);
        },

        'remove_line_break': function (seq, filename, line) {
            delete debugging.line_breakpoints[filename][line];
        },


        'js_eval': function (id, code) {
            eval(code);
        },

        'js_debugger': function (id) {
            debugger;
        }
    }
};


function debugger_patch_console() {
    var log, error;
    debugging.console_patched = true;
    if (window.console) {
        log = window.console.log;
        error = window.console.error;

        function patched_log() {
            log.apply(window.console, arguments);
            disable_patch();
            try {
                debugging.trace_console_log.apply(null, arguments);
            } finally {
                enable_patch();
            }
        }

        function patched_error() {
            error.apply(window.console, arguments);
            disable_patch();
            try {
                debugging.trace_console_error.apply(null, arguments);
            } finally {
                enable_patch();
            }
        }

        function enable_patch() {
            window.console.log = patched_log;
            window.console.error = patched_error;
        }

        function disable_patch() {
            window.console.log = log;
            window.console.error = error;
        }

        enable_patch();
    } else {
        window.console = {
            log: debugging.console_log,
            error: debugging.console_error
        }
    }

}


function debug(module, argv, url, options) {
    if (debugging.enabled) {
        raise(RuntimeError, 'debugger has already been started');
    }
    debugging.enabled = true;
    debugging.module = module;
    debugging.argv = argv;
    debugging.connect(url);

    options = options || {};

    if (options.patch_console && !debugging.console_patched) {
        debugger_patch_console();
    }
}


$.debugger = {};
$.debugger.run = debugging.run;
$.debugger.add_break = debugging.add_break;
$.debugger.remove_break = debugging.remove_break;
$.debugger.add_exception_break = debugging.add_exception_break;
$.debugger.remove_exception_break = debugging.remove_exception_break;
$.debugger.suspend_thread = debugging.suspend_thread;
$.debugger.resume_thread = debugging.resume_thread;
$.debugger.kill_thread = debugging.kill_thread;
$.debugger.step_over = debugging.step_over;
$.debugger.step_into = debugging.step_into;
$.debugger.step_out = debugging.step_out;
$.debugger.connect = debugging.connect;

$.debug = debug;
