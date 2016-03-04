function error(message) {
    throw new Error('[FATAL ERROR] ' + (message || 'fatal interpreter error'));
}

function assert(condition, message) {
    if (!condition) {
        error(message);
    }
}
function raise(exc_type, message) {
    if (exc_type) {
        var exc_value = new_exception(exc_type, message);
        exc_value.message = message;
        throw exc_value;
    } else {
        error(message);
    }
}


function is_iterable(object) {
    return object.cls.lookup('__next__') != undefined;
}

function main(name) {
    run(modules[name].code);
}
