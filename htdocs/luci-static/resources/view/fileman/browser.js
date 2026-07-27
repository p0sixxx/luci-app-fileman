'use strict';
'require view.fileman.icons as icons';
'require view.fileman.util as util';

function createBrowser(options) {
    const root = E('section', { 'class': 'fileman-browser' });
    const navigation = E('div', { 'class': 'fileman-navigation' });
    const breadcrumb = E('div', { 'class': 'fileman-breadcrumb' });
    const pathInput = E('input', {
        'class': 'cbi-input-text',
        'type': 'text',
        'value': '/',
        'aria-label': _('Path')
    });
    const status = E('p', { 'class': 'fileman-status' });
    const tableBox = E('div', { 'class': 'cbi-section-table fileman-table' });
    let entries = [];
    let selectedPath = null;
    let sortColumn = 'name';
    let sortAscending = true;

    navigation.appendChild(pathInput);
    root.appendChild(navigation);
    root.appendChild(breadcrumb);
    root.appendChild(status);
    root.appendChild(tableBox);

    function setStatus(message) {
        status.textContent = message || '';
    }

    function showError(error) {
        setStatus(_('Error: ') + error);
    }

    function sortEntries() {
        return entries.slice().sort(function(left, right) {
            if (left.type === 'directory' && right.type !== 'directory')
                return -1;
            if (left.type !== 'directory' && right.type === 'directory')
                return 1;

            const leftValue = sortColumn === 'size' ? Number(left.size) || 0 :
                sortColumn === 'mtime' ? Number(left.mtime) || 0 : String(left[sortColumn] || '').toLocaleLowerCase();
            const rightValue = sortColumn === 'size' ? Number(right.size) || 0 :
                sortColumn === 'mtime' ? Number(right.mtime) || 0 : String(right[sortColumn] || '').toLocaleLowerCase();
            const comparison = typeof leftValue === 'string' ? leftValue.localeCompare(rightValue) : leftValue - rightValue;

            return sortAscending ? comparison : -comparison;
        });
    }

    function select(entry) {
        selectedPath = entry.path;
        renderTable();

        if (options.onSelectionChange)
            options.onSelectionChange(entry);
    }

    function openEntry(entry) {
        if (entry.type === 'directory')
            navigate(entry.path);
        else if (options.onOpenFile)
            options.onOpenFile(entry.path);
    }

    function createHeader(label, column) {
        const button = E('button', { 'class': 'fileman-sort-button', 'type': 'button' }, [ _(label) ]);
        button.addEventListener('click', function() {
            sortAscending = sortColumn === column ? !sortAscending : true;
            sortColumn = column;
            renderTable();
        });
        return E('th', { 'scope': 'col' }, [ button ]);
    }

    function renderBreadcrumb(path) {
        breadcrumb.textContent = '';

        const normalized = util.normalizePath(path);
        const parts = normalized.split('/').filter(Boolean);

        let current = '';

        function addItem(label, target) {
            const button = E('button', {
                'class': 'fileman-breadcrumb-item',
                'type': 'button'
            }, [ label ]);

            button.addEventListener('click', function() {
                navigate(target);
            });

            breadcrumb.appendChild(button);
        }

        addItem('/', '/');

        parts.forEach(function(part, index) {
            current += '/' + part;

            breadcrumb.appendChild(E('span', {
                'class': 'fileman-breadcrumb-separator'
            }, [ '›' ]));

            if (index === parts.length - 1) {
                breadcrumb.appendChild(E('span', {
                    'class': 'fileman-breadcrumb-current'
                }, [ part ]));
            }
            else {
                addItem(part, current);
            }
        });
    }

    function renderTable() {
        tableBox.textContent = '';

        const table = E('table', { 'class': 'table' });
        table.appendChild(E('thead', {}, [ E('tr', {}, [
            createHeader('Name', 'name'),
            createHeader('Type', 'type'),
            createHeader('Size', 'size'),
            createHeader('Modified', 'mtime')
        ]) ]));

        const body = E('tbody');
        sortEntries().forEach(function(entry) {
            const row = E('tr', {
                'class': entry.path === selectedPath ? 'fileman-selected' : '',
                'tabindex': '0',
                'aria-selected': entry.path === selectedPath ? 'true' : 'false'
            });
            const openLink = E('a', { 'href': '#' }, [
                E('span', { 'class': 'fileman-icon', 'aria-hidden': 'true' }, [ icons.getFileIcon(entry) ]),
                ' ', entry.name
            ]);

            openLink.addEventListener('click', function(event) {
                event.preventDefault();
                select(entry);
                openEntry(entry);
            });
            row.addEventListener('click', function() { select(entry); });
            row.addEventListener('dblclick', function() { openEntry(entry); });
            row.addEventListener('keydown', function(event) {
                if (event.key === 'Enter')
                    openEntry(entry);
            });

            row.appendChild(E('td', {}, [ openLink ]));
            row.appendChild(E('td', {}, [ entry.type || _('unknown') ]));
            row.appendChild(E('td', {}, [ entry.type === 'directory' ? '—' : util.formatSize(entry.size) ]));
            row.appendChild(E('td', {}, [ util.formatDate(entry.mtime) ]));
            body.appendChild(row);
        });

        table.appendChild(body);
        tableBox.appendChild(table);
    }

    function refresh(path) {
        const requestedPath = util.normalizePath(path || pathInput.value);
        setStatus(_('Loading...'));

        return options.api.list(requestedPath).then(function(response) {
            if (!response || response.error) {
                entries = [];
                selectedPath = null;
                tableBox.textContent = '';
                showError(response && response.error || _('Unable to list directory'));
                return response;
            }

            entries = response.entries || [];
            selectedPath = entries.some(function(entry) { return entry.path === selectedPath; }) ? selectedPath : null;
            pathInput.value = response.path || requestedPath;
            renderBreadcrumb(pathInput.value);
            setStatus(_('Path: ') + pathInput.value);
            renderTable();
            return response;
        }).catch(function(error) {
            entries = [];
            selectedPath = null;
            tableBox.textContent = '';
            showError(error.message || error);
        });
    }

    function navigate(path) {
        return refresh(path);
    }

    function getSelection() {
        return entries.find(function(entry) { return entry.path === selectedPath; }) || null;
    }

    pathInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter')
            navigate(pathInput.value);
    });

    return {
        root: root,
        currentPath: function() { return util.normalizePath(pathInput.value); },
        getSelection: getSelection,
        navigate: navigate,
        refresh: refresh,
        showError: showError
    };
}

return {
    createBrowser: createBrowser
};
