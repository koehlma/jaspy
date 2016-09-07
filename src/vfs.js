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
 * Virtual File System
 * ===================
 *
 * This module implements a lightweight virtual file system.
 */



var PATH_REGEX = /(\\\/|[^/])+/g;


var vfs = {
    FLAGS: {
        READ: 1,
        WRITE: 2,

        READ_WRITE: 3,

        CREATE: 4
    },

    set_root: function (root) {
        vfs.root = root;
        //vfs.open = root.open;
        //vfs.chmod = root.chmod;
        //vfs.chown = root.chown;
    },

    get_parts: function (path) {
        var parts = [];
        var match;
        while (match = PATH_REGEX.exec(path)) {
            parts.push(match[0]);
        }
        return parts;
    },

    mount: function (system, path) {

    },

    umount: function(path) {

    }
};


vfs.Inode = Class({
    constructor: function (filesystem, id, type, size, user, group, mode, atime, mtime, ctime, nlink) {
        this.filesystem = filesystem;
        this.id = id;
        this.type = type || vfs.Inode.TYPES.FILE;
        this.size = size || 0;
        this.user = user || 0;
        this.group = group || 0;
        this.mode = mode || 511;
        this.atime = atime || -1;
        this.mtime = mtime || -1;
        this.ctime = ctime || -1;
        this.nlink = nlink || 0;
    },

    to_json: function () {
        return JSON.stringify();
    },

    sync: function () {
        return this.filesystem.sync_inode(this);
    }
});

vfs.Inode.TYPES = {
    FILE: 0,
    DIRECTORY: 1,
    LINK: 2
};

vfs.Inode.from_json = function (filesystem, string) {
    var data = JSON.parse(string);
    return new Inode(filesystem, data.id);
};



vfs.File = Class.extend({
    read: function () {

    },

    write: function () {

    },

    close: function () {

    }
});

vfs.Mountpoint = Class.extend({

});

vfs.Directory = Class({
    list: function () {

    }
});


/**
 * Implements a file system.
 * Attributes:
 *  - readonly
 *  - persistent
 */
vfs.System = Class.extend({
    constructor: function (readonly, persistent) {
        this.readonly = readonly === undefined ? false : readonly;
        this.persistent = persistent == undefined ? false : persistent;
    },

    mount: function (system, path) {

    },

    umount: function (system, path) {

    },

    open: function (path) {
        raise(NotImplementedError, 'filesystem does not implement \'open\'');
    },

    mkdir: function (path) {

    },

    rmdir: function (path) {

    },

    read: function (path, length, offset) {

    }


});


vfs.System.Memory = vfs.System.extend({
    constructor: function () {
        vfs.System.call(this, false, false);
        this.structure = {};
        this.inodes = {};
        this.counter = 0;
    },

    create_inode: function (type) {
        var inode = new Inode(this, this.counter++, type);
        this.inodes[inode.id] = inode;
        return inode;
    },

    update_inode: function (inode) {

    },

    remove_inode: function (inode) {
        delete this.inodes[inode.id];
    }
});


/**
 * Database: vfs-systems: [$name, $name, ...]
 * Counter: vfs-$name-counter
 * Inodes: vfs-$name-inodes-$id-inode
 * Data: vfs-$name-inodes-$id-data
 * Path: vfs-$name-structure-$path => inode_id
 *
 */
vfs.System.Local = vfs.System.extend({
    constructor: function (name) {
        vfs.System.call(this, false, true);
        this.name = name || 'default';
    },

    get_inode: function (id) {
        var data = localStorage['vfs-' + this.name + '-inodes-' + id + '-inode'];
        return JSON.parse(data);
    },


    create_inode: function () {

    },

    sync_inode: function () {

    }
});



/**
 * Endpoints:
 *  - GET: get file contents or directory listing
 *  - HEAD: get file metadata
 *  - POST: create new file
 *  - PUT: update or replace file
 *  - DELETE: delete file
 */
vfs.System.REST = vfs.System.extend({
    constructor: function (endpoint, readonly, user, password) {
        vfs.System.call(this);
        this.endpoint = endpoint;
        this.user = user;
        this.password = password;
        this.cache = {};
    },

    read: function () {

    },

    get_inode: function (id) {
        var request = new XMLHttpRequest();
        request.setRequestHeader('X-VFS', 'True');


        request.open('HEAD', this.endpoint, true, this.user, this.password);
    }
});

vfs.System.WebDav = vfs.System.extend({
    constructor: function (endpoint) {

    }
});








vfs.set_root(vfs.System.Memory());

$.vfs = vfs;
