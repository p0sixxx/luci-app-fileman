'use strict';

function createButton(label, className, handler) {
    const button = E('button', {
        'class': className || 'cbi-button',
        'type': 'button'
    }, [ _(label) ]);

    button.addEventListener('click', handler);

    return button;
}

function requireSelection(actions, callback) {
    return function() {
        const path = actions.selectedPath();

        if (!path) {
            actions.ensureSelection();
            return;
        }

        callback(path);
    };
}

function createToolbar(actions) {
    const root = E('div', {
        'class': 'cbi-section fileman-toolbar'
    });

    const newFolderButton = createButton('New folder', null, function() {
        const name = window.prompt(_('Folder name'));

        if (name)
            actions.createFolder(name);
    });

    const newFileButton = createButton('New file', null, function() {
        const name = window.prompt(_('File name'));

        if (name)
            actions.createFile(name);
    });

    const renameButton = createButton(
        'Rename',
        null,
        requireSelection(actions, function(path) {
            const destination = window.prompt(_('New name/path'), path);

            if (destination)
                actions.rename(destination);
        })
    );

    const deleteButton = createButton(
        'Delete',
        'cbi-button cbi-button-remove',
        requireSelection(actions, function(path) {
            if (window.confirm(_('Delete ') + path + '?'))
                actions.remove();
        })
    );

    const copyButton = createButton(
        'Copy',
        null,
        requireSelection(actions, function(path) {
            const destination = window.prompt(_('Copy to path'), path);

            if (destination)
                actions.copy(destination);
        })
    );

    const refreshButton = createButton(
        'Refresh',
        null,
        actions.refresh
    );

    const uploadButton = createButton(
        'Upload',
        null,
        actions.upload
    );

    const downloadButton = createButton(
        'Download',
        null,
        actions.download
    );

    [
        newFolderButton,
        newFileButton,
        renameButton,
        deleteButton,
        copyButton,
        refreshButton,
        uploadButton,
        downloadButton
    ].forEach(function(button) {
        root.appendChild(button);
    });

    return {
        root: root
    };
}

return {
    createToolbar: createToolbar
};