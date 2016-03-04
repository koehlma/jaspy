function error(message) {
    throw new Error('[FATAL ERROR] ' + (message || 'fatal interpreter error'));
}

function raise(exc_type, exc_value, exc_tb) {
    error('exception occurred before vm has been initialized')
}

function assert(condition, message) {
    if (!condition) { error(message) }
}



function isiterable(object) {
    return object.cls.lookup('__next__') != undefined;
}


function main(name) {
    run(modules[name].code);
}
