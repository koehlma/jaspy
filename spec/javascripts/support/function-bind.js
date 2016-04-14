Function.prototype.bind = Function.prototype.bind || function (bind_to) {
    var func = this;
    return function () {
        return func.apply(bind_to, arguments);
    };
};
