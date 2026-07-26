'use strict';
'require view';
'require rpc';
'require ui';

var callList = rpc.declare({
    object: 'fileman',
    method: 'list',
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

function joinPath(base, name) {
    base = base || '/';
    if (base !== '/' && base.endsWith('/'))
        base = base.slice(0, -1);
    return (base === '/' ? '' : base) + '/' + name;
}

return view.extend({
    load: function () {
        return Promise.resolve();
    },

    render: function () {
        var root = E('div', { 'class': 'cbi-map' });
        var toolbar = E('div', { 'class': 'cbi-section' });
        var pathInput = E('input', { 'class': 'cbi-input-text', 'type': 'text', 'value': '/' });
        var openBtn = E('button', { 'class': 'cbi-button cbi-button-action' }, [ _('Open') ]);
        var upBtn = E('button', { 'class': 'cbi-button' }, [ _('Up') ]);
        var newDirBtn = E('button', { 'class': 'cbi-button' }, [ _('New folder') ]);
        var newFileBtn = E('button', { 'class': 'cbi-button' }, [ _('New file') ]);
        var tableBox = E('div', { 'class': 'cbi-section-table' });
        var statusBox = E('div', { 'class': 'cbi-section' });

        toolbar.appendChild(pathInput);
        toolbar.appendChild(openBtn);
        toolbar.appendChild(upBtn);
        toolbar.appendChild(newDirBtn);
        toolbar.appendChild(newFileBtn);
        root.appendChild(toolbar);
        root.appendChild(statusBox);
        root.appendChild(tableBox);

        function setStatus(msg) {
            statusBox.textContent = msg || '';
        }

        function parentPath(path) {
            if (!path || path === '/')
                return '/';
            path = path.replace(/\/+$|\/+$/g, '');
            var idx = path.lastIndexOf('/');
            return idx <= 0 ? '/' : path.slice(0, idx);
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
                var nameCell = E('td');
                var openLink = E('a', { 'href': '#', 'click': ui.createHandlerFn(this, function () {
                    if (e.type === 'directory') {
                        pathInput.value = e.path;
                        loadPath();
                    } else {
                        editFile(e.path);
                    }
                }) }, [ e.name ]);
                nameCell.appendChild(openLink);

                var typeCell = E('td', {}, [ e.type || '' ]);
                var sizeCell = E('td', {}, [ String(e.size || 0) ]);
                var actions = E('div');
                var editBtn = E('button', { 'class': 'cbi-button cbi-button-neutral' }, [ _('Edit') ]);
                var renameBtn = E('button', { 'class': 'cbi-button' }, [ _('Rename') ]);
                var delBtn = E('button', { 'class': 'cbi-button cbi-button-remove' }, [ _('Delete') ]);

                editBtn.addEventListener('click', function () { editFile(e.path); });
                renameBtn.addEventListener('click', function () { renameItem(e.path); });
                delBtn.addEventListener('click', function () { deleteItem(e.path); });

                actions.appendChild(editBtn);
                actions.appendChild(renameBtn);
                actions.appendChild(delBtn);

                tr.appendChild(nameCell);
                tr.appendChild(typeCell);
                tr.appendChild(sizeCell);
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
                pathInput.value = res.path || p;
                setStatus(_('Path: ') + (res.path || p));
                renderTable(res);
            });
        }

        function editFile(path) {
            callRead(path).then(function (res) {
                if (res && res.error) {
                    ui.addNotification(null, E('p', {}, [ _('Error: ') + res.error ]));
                    return;
                }

                var ta = E('textarea', {
                    'class': 'cbi-input-textarea',
                    'style': 'width:100%;min-height:22em;'
                }, [ res.content || '' ]);

                ui.showModal(_('Edit file'), [ ta ], [
                    E('button', {
                        'class': 'btn cbi-button cbi-button-neutral',
                        'click': ui.hideModal
                    }, [ _('Cancel') ]),
                    E('button', {
                        'class': 'btn cbi-button cbi-button-action',
                        'click': function () {
                            callWrite(path, ta.value).then(function () {
                                ui.hideModal();
                                loadPath();
                            });
                        }
                    }, [ _('Save') ])
                ]);
            });
        }

        function renameItem(path) {
            var dst = window.prompt(_('New name/path'), path);
            if (!dst || dst === path)
                return;
            callMv(path, dst).then(function () { loadPath(); });
        }

        function deleteItem(path) {
            if (!window.confirm(_('Delete ') + path + '?'))
                return;
            callRm(path).then(function () { loadPath(); });
        }

        openBtn.addEventListener('click', loadPath);
        upBtn.addEventListener('click', function () {
            pathInput.value = parentPath(pathInput.value || '/');
            loadPath();
        });
        newDirBtn.addEventListener('click', function () {
            var name = window.prompt(_('Folder name'));
            if (!name)
                return;
            callMkdir(joinPath(pathInput.value || '/', name)).then(function () { loadPath(); });
        });
        newFileBtn.addEventListener('click', function () {
            var name = window.prompt(_('File name'));
            if (!name)
                return;
            callWrite(joinPath(pathInput.value || '/', name), '').then(function () { loadPath(); });
        });

        loadPath();
        return root;
    }
});
