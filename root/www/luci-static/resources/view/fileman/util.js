'use strict';

function normalizePath(path) {
    path = String(path || '/').replace(/\\/g, '/');
    path = path.replace(/\/+/g, '/');

    if (!path.startsWith('/'))
        path = '/' + path;

    return path === '/' ? path : path.replace(/\/+$/, '');
}

function joinPath(base, name) {
    return normalizePath(normalizePath(base) + '/' + String(name || ''));
}

function basename(path) {
    path = normalizePath(path);
    return path === '/' ? '/' : path.slice(path.lastIndexOf('/') + 1);
}

function dirname(path) {
    path = normalizePath(path);
    if (path === '/')
        return '/';

    const parent = path.slice(0, path.lastIndexOf('/'));
    return parent || '/';
}

function formatSize(size) {
    const value = Number(size) || 0;
    const units = [ 'B', 'KiB', 'MiB', 'GiB', 'TiB' ];
    let unit = 0;
    let formatted = value;

    while (formatted >= 1024 && unit < units.length - 1) {
        formatted /= 1024;
        unit++;
    }

    return (unit === 0 ? formatted : formatted.toFixed(formatted < 10 ? 1 : 0)) + ' ' + units[unit];
}

function formatDate(timestamp) {
    if (!timestamp)
        return '—';

    const date = new Date(Number(timestamp) * 1000);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function escapeHTML(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

return {
    normalizePath: normalizePath,
    joinPath: joinPath,
    basename: basename,
    dirname: dirname,
    formatSize: formatSize,
    formatDate: formatDate,
    escapeHTML: escapeHTML
};
