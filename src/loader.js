function Loader() {
    this.root = './';
    this.modules = {};
    this.pending = {};
}
Loader.prototype.error = function (name) {
    console.log(name);
};
Loader.prototype.success = function (name, source) {
    console.log(name, source);
};
Loader.prototype.load = function (name, success, error) {
    if (name in this.modules) {
        return this.module[name];
    }
    if (name in this.pending) {
        this.pending[name].push({success: success, error: error})
        return;
    }
    this.pending[name] = [{success: success, error: error}]
    var filename = this.root + name.split('.').join('/') + '.js';
    var request = new XMLHttpRequest();
    request.open('GET', filename, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                jaspy.loader.success(name, request.responseText);
            } else {
                jaspy.loader.error(name);
            }
        }
    };
    request.send();
};

var loader = new Loader();

vm = new VM();