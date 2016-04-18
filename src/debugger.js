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


var DebugFuture = Class.extend({
    constructor: function () {
        this.result = null;

        this.success = false;
        this.error = false;

        this.callbacks = [];
    },

    done: function (callback) {
        this.callbacks.push(callback);
    },

    run_callbacks: function () {
        for (var index = 0; index < this.callbacks.length; index++) {
            this.callbacks[index](this)
        }
    },

    set_result: function (result) {
        this.result = result;
        this.success = true;
        this.run_callbacks();
    },

    set_exception: function (exception) {
        this.result = exception;
        this.error = true;
        this.run_callbacks();
    }
});



var debug_run_in_frame = new NativeCode(function (seq, in_frame, code, state, frame) {
    var py_frame;
    switch (state) {
        case 0:
            py_frame = new PythonFrame(code, {
                back: frame, locals: in_frame.locals, globals: in_frame.globals,
                builtins: in_frame.builtins
            });
            if (call(py_frame)) {
                return 1;
            }
        case 1:
            if (!vm.return_value) {
                // TODO: send exception data back
                return;
            }
            if (vm.return_value.call('__repr__')) {
                return 2;
            }
        case 2:
            if (!vm.return_value) {
                // TODO: send exception data back
                return;
            }
            debugging.emit('success', [vm.return_value.toString()], seq);
            return;
    }
}, {name: 'run_in_frame'}, ['seq', 'in_frame', 'code']);


var debug_get_frame_locals = new NativeCode(function (in_frame, state, frame) {
    var name;
    while (true) {
        switch (state) {
            case 0:
                frame.names = Object.keys(in_frame.locals);
                frame.result = {};
                frame.index = 0;
            case 1:
                if (frame.index >= frame.names.length) {
                    state = 3;
                    break;
                }
                if (in_frame.locals[frame.names[frame.index]].call('__repr__')) {
                    return 2;
                }
            case 2:
                // TODO: handle exceptions and deleted names
                if (!vm.return_value) {
                    console.log('error')
                } else {
                    name = frame.names[frame.index++];
                    frame.result[name] = {
                        type: in_frame.locals[name].__class__.name,
                        value: vm.return_value.toString()
                    };
                }
                state = 1;
                break;
            case 3:
                return pack_object(frame.result);
        }
    }
}, {name: 'get_locals'}, ['in_frame']);

var debugging = {
    enabled: false,
    connected: false,

    module: null,
    argv: null,

    websocket: null,

    line_breakpoints: {},
    exception_breakpoints: {},

    console_patched: false,

    sequence_counter: 2,


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

    call: function (native_code, args, kwargs) {
        var frame = new NativeFrame(native_code, {args: args, kwargs: kwargs});
        frame.debug_future = new DebugFuture();
        (new Thread(frame)).enqueue();
        threading.resume();
        return frame.debug_future;
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
        var return_value, last_exception;
        if (frame.debug_future) {
            if (vm.return_value) {
                frame.debug_future.set_result(vm.return_value);
            } else {
                frame.debug_future.set_exception(vm.last_exception);
            }
        }
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
        if (!thread.frame.debug_internal) {
            thread.debug_intenal = true;
            debugging.emit_thread_created(thread);
        }
    },

    trace_thread_finished: function (thread) {
        if (!thread.debug_internal) {
            debugging.emit_thread_finished(thread);
        }
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

    resume: function (thread, first) {
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
            seq = seq == undefined ? debugging.sequence_counter += 2 : seq;
            debugging.websocket.send(JSON.stringify({'event': cmd, 'seq': seq, 'args': args || []}));
        }
    },

    emit_hello: function () {
        debugging.emit('hello');
    },

    emit_error: function (message, seq) {
        debugging.emit('error', [message], seq);
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

        run_in_frame: function (seq, thread_id, frame_id, source) {
            var frame = threading.get_thread(thread_id).get_frame(frame_id);
            debugging.call(debug_run_in_frame, [seq, frame, eval(source)]);
        },

        run_in_thread: function (seq, source) {
            var code = eval(source);
            (new Thread(new PythonFrame(code))).enqueue();
            threading.resume();
        },

        js_eval: function (seq, source) {
            eval(source);
        },

        js_debugger: function (seq) {
            debugger;
        },

        get_threads: function (seq) {
            var identifier;
            var result = [];
            for (identifier in threading.registry) {
                if (threading.registry.hasOwnProperty(identifier)) {
                    result.push({
                        'id' : parseInt(identifier),
                        'name': threading.get_thread(identifier).name
                    });
                }
            }
            debugging.emit('threads', [result], seq);
        },

        get_locals: function (seq, thread_id, frame_id) {
            var frame = threading.get_thread(thread_id).get_frame(frame_id);
            debugging.call(debug_get_frame_locals, [frame]).done(function (future) {
                if (future.success) {
                    debugging.emit('locals', [future.result.primitive()], seq);
                } else {
                    debugging.emit_error('error receiving frame locals', seq)
                }
            });
        },

        add_break: function (seq, filename, line, condition, expression) {
            var condition_code = condition ? eval(condition): null;
            var expression_code = expression ? eval(expression) : null;
            debugging.add_break(filename, line, condition_code, expression_code);
        },

        remove_break: function (seq, filename, line) {
            debugging.remove_break(filename, line);
        },

        add_exception_break: function (seq, name, on_termination, on_raise) {
            debugging.add_exception_break(name, on_termination, on_raise);
        },

        remove_exception_break: function (seq, name) {
            debugging.remove_exception_break(name);
        }
    }
};


function debugger_patch_console() {
    var log, error;

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
    
    debugging.console_patched = true;
    if (window.console) {
        log = window.console.log;
        error = window.console.error;
        enable_patch();
    } else {
        window.console = {};
        window.console.log = debugging.trace_console_log;
        window.console.error = debugging.trace_console_error;
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
