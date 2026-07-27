'use strict';
'require rpc';

function declare(method, params) {
    return rpc.declare({
        object: 'fileman',
        method: method,
        params: params
    });
}

const methods = {
    list: declare('list', ['path']),
    stat: declare('stat', ['path']),
    read: declare('read', ['path']),
    write: declare('write', ['path', 'content']),
    mkdir: declare('mkdir', ['path']),
    rm: declare('rm', ['path']),
    mv: declare('mv', ['src', 'dst']),
    copy: declare('copy', ['src', 'dst']),
    touch: declare('touch', ['path']),
    download: declare('download', ['path'])
};

function invoke(name, args) {
    return methods[name].apply(null, args);
}

return {
    list: function(path) {
        return invoke('list', arguments);
    },

    stat: function(path) {
        return invoke('stat', arguments);
    },

    read: function(path) {
        return invoke('read', arguments);
    },

    write: function(path, content) {
        return invoke('write', arguments);
    },

    mkdir: function(path) {
        return invoke('mkdir', arguments);
    },

    rm: function(path) {
        return invoke('rm', arguments);
    },

    mv: function(src, dst) {
        return invoke('mv', arguments);
    },

    copy: function(src, dst) {
        return invoke('copy', arguments);
    },

    touch: function(path) {
        return invoke('touch', arguments);
    },

    download: function(path) {
        return invoke('download', arguments);
    }
};