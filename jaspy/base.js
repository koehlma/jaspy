function error(message) {
    throw new Error('[FATAL ERROR] ' + (message || 'fatal interpreter error'));
}

function raise(exc_type, exc_value, exc_tb) {
    error('exception occurred before jaspy has been fully initialized');
}

function assert(condition, message) {
    if (!condition) { error(message); }
}

$.error = error;
$.raise = raise;
$.assert = assert;
