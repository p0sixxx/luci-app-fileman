'use strict';
'require view.fileman.util as util';

const TEXT_EXTENSIONS = [ 'conf', 'css', 'csv', 'htm', 'html', 'js', 'json', 'log', 'md', 'sh', 'txt', 'uc', 'xml', 'yaml', 'yml' ];
const IMAGE_EXTENSIONS = [ 'avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp' ];
const ARCHIVE_EXTENSIONS = [ '7z', 'bz2', 'gz', 'rar', 'tar', 'tgz', 'xz', 'zip' ];

function fileExtension(path) {
    const name = util.basename(path).toLowerCase();
    const dot = name.lastIndexOf('.');
    return dot === -1 ? '' : name.slice(dot + 1);
}

function getFileIcon(entry) {
    const type = entry.type || 'unknown';
    const extension = fileExtension(entry.name || entry.path || '');

    if (type === 'directory')
        return '📁';
    if (type === 'link' || type === 'symlink')
        return '🔗';
    if (TEXT_EXTENSIONS.indexOf(extension) !== -1)
        return '📄';
    if (IMAGE_EXTENSIONS.indexOf(extension) !== -1)
        return '🖼️';
    if (ARCHIVE_EXTENSIONS.indexOf(extension) !== -1)
        return '🗜️';
    if (type === 'file' || type === 'regular')
        return '▪️';

    return '❔';
}

return {
    getFileIcon: getFileIcon
};
