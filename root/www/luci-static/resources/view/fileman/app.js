'use strict';
'require view';
'require uci';
'require rpc';
'require fs';
'require ui';

var callList = rpc.declare({
    object: 'fileman',
    method: 'list',
    params: [ 'path' ]
});

var callStat = rpc.declare({
    object: 'fileman',
    method: 'stat',
    params: [ 'path' ]
});

var callRead = rpc.declare({
    object: 'fileman',
    method: 'read',
    params: [ 'path' ]
});

var callWrite = rpc.declare({
    object: 'fileman',
    method: 'write',
    params: [ 'path', 'content' ]
});

var callMkdir = rpc.declare({
    object: 'fileman',
    method: 'mkdir',
    params: [ 'path' ]
});

var callRm = rpc.declare({
    object: 'fileman',
    method: 'rm',
    params: [ 'path' ]
});

var callMv = rpc.declare({
    object: 'fileman',
    method: 'mv',
    params: [ 'src', 'dst' ]
});

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]/, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
}

return view.extend({
    load: function () {
        return Promise.resolve();
    },

    render: function () {
        var root = E('div', { 'class': 'cbi-map' });
        var toolbar = E('div', { 'class': 'cbi-section' });
        var pathInput = E('input', { 'class': 'cbi-input-text', 'type': 'text', 'value': '/' });
        var refreshBtn = E('button', { 'class': 'cbi-button cbi-button-action' }, [ _('Open') ]);
        var newDirBtn = E('button', { 'class': 'cbi-button' }, [ _('New folder') ]);
        var newFileBtn = E('button', { 'class': 'cbi-button' }, [ _('New file') ]);
        var tableBox = E('div', { 'class': 'cbi-section-table' });
        var statusBox = E('div', { 'class': 'cbi-section' });

        toolbar.appendChild(pathInput);
        toolbar.appendChild(refreshBtn);
        toolbar.appendChild(newDirBtn);
        toolbar.appendChild(newFileBtn);
        root.appendChild(toolbar);
        root.appendChild(statusBox);
        root.appendChild(tableBox);

        function setStatus(msg) {
            statusBox.textContent = msg || '';
        }

        function renderTable(data) {
            tableBox.textContent = '';
            var table = E('table', { 'class': 'table' });
            var thead = E('tr');
            ['Name', 'Type', 'Size', 'Actions'].forEach(function (h) {
                thead.appendChild(E('th', {}, [ _(h) ]));
            });
            table.appendChild(E('thead', {}, [ thead ]));

            var tbody = E('tbody');
            (data.entries || []).forEach(function (e) {
                var tr = E('tr');
                var openLink = E('a', { 'href': '#', 'click': ui.createHandlerFn(this, function () {
                    if (e.type === 'directory') {
                        pathInput.value = e.path;
                        loadPath();
                    }
                }) }, [ e.name ]);

                var actions = E('div');
                var editBtn = E('button', { 'class': 'cbi-button cbi-button-neutral' }, [ _('Edit') ]);
                var delBtn = E('button', { 'class': 'cbi-button cbi-button-remove' }, [ _('Delete') ]);
                var renameBtn = E('button', { 'class': 'cbi-button' }, [ _('Rename') ]);

                editBtn.addEventListener('click', function () {
                    callRead(e.path).then(function (res) {
                        var content = res && res.content ? res.content : '';
                        var ta = E('textarea', { 'class': 'cbi-input-textarea', 'style': 'width:100%;min-height:18em;' }, [ content ]);
                        var dlg = ui.showModal(_('Edit file'), [ ta ], {
                            buttons: [
                                E('button', { 'class': 'btn cbi-button cbi-button-neutral', 'click': ui.hideModal }, [ _('Cancel') ]),
                                E('button', { 'class': 'btn cbi-button cbi-button-action', 'click': function () {
                                    callWrite(e.path, ta.value).then(function () { ui.hideModal(); loadPath(); });
                                } }, [ _('Save') ])
                            ]
                        });
                    });
                });

                delBtn.addEventListener('click', function () {
                    if (!window.confirm(_('Delete ') + e.path + '?'))
                        return;
                    callRm(e.path).then(function () { loadPath(); });
                });

                renameBtn.addEventListener('click', function () {
                    var dst = window.prompt(_('New name/path'), e.path);
                    if (!dst)
                        return;
                    callMv(e.path, dst).then(function () { loadPath(); });
                });

                actions.appendChild(editBtn);
                actions.appendChild(renameBtn);
                actions.appendChild(delBtn);

                tr.appendChild(E('td', {}, [ openLink ]));
                tr.appendChild(E('td', {}, [ e.type || '' ]));
                tr.appendChild(E('td', {}, [ String(e.size || 0) ]));
                tr.appendChild(E('td', {}, [ actions ]));
                tbody.appendChild(tr);
            }, this);
            table.appendChild(tbody);
            tableBox.appendChild(table);
        }

        function loadPath() {
            var p = pathInput.value || '/';
            setStatus(_('Loading...'));
            callList(p).then(function (res) {
                if (res && res.error) {
                    setStatus(_('Error: ') + res.error);
                    tableBox.textContent = '';
                    return;
                }
                setStatus(_('Path: ') + res.path);
                renderTable(res);
            });
        }

        refreshBtn.addEventListener('click', loadPath);
        newDirBtn.addEventListener('click', function () {
            var name = window.prompt(_('Folder name'));
            if (!name)
                return;
            var p = (pathInput.value || '/').replace(/\/$/, '') + '/' + name;
            callMkdir(p).then(function () { loadPath(); });
        });
        newFileBtn.addEventListener('click', function () {
            var name = window.prompt(_('File name'));
            if (!name)
                return;
            var p = (pathInput.value || '/').replace(/\/$/, '') + '/' + name;
            callWrite(p, '').then(function () { loadPath(); });
        });

        loadPath();
        return root;
    }
});
