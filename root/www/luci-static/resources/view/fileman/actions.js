'use strict';
'require view.fileman.util as util';

function createFileActions(options) {

    function showError(error) {
        options.browser.showError(error.message || error);
    }

    function handleResult(result) {
        if (result && result.error) {
            options.browser.showError(result.error);
            return false;
        }

        return true;
    }

    function selectedEntry(showMessage) {
        const entry = options.browser.getSelection();

        if (!entry && showMessage !== false)
            options.browser.showError(_('Select an entry first'));

        return entry;
    }

    function resolveEntry(entry, showMessage) {
        return entry || selectedEntry(showMessage);
    }

    function selectedEntries() {
        const entry = selectedEntry(false);
        return entry ? [ entry ] : [];
    }

    function selectedPath() {
        const entry = selectedEntry(false);
        return entry ? entry.path : '';
    }

    function refresh() {
        return options.browser.refresh();
    }

    function runAndRefresh(request) {
        return Promise.resolve(request)
            .then(function(result) {
                if (handleResult(result))
                    return refresh();

                return result;
            })
            .catch(showError);
    }

    function createFolder(name) {
        if (!name)
            return;

        return runAndRefresh(
            options.api.mkdir(
                util.joinPath(options.browser.currentPath(), name)
            )
        );
    }

    function createFile(name) {
        if (!name)
            return;

        return runAndRefresh(
            options.api.touch(
                util.joinPath(options.browser.currentPath(), name)
            )
        );
    }

    function rename(entry, destination) {
        if (typeof entry === 'string') {
            destination = entry;
            entry = null;
        }

        entry = resolveEntry(entry);

        if (!entry || !destination || destination === entry.path)
            return;

        return runAndRefresh(
            options.api.mv(entry.path, destination)
        );
    }

    function remove(entry) {
        entry = resolveEntry(entry);

        if (!entry)
            return;

        return runAndRefresh(
            options.api.rm(entry.path)
        );
    }

    function copy(entry, destination) {
        if (typeof entry === 'string') {
            destination = entry;
            entry = null;
        }

        entry = resolveEntry(entry);

        if (!entry || !destination || destination === entry.path)
            return;

        return runAndRefresh(
            options.api.copy(entry.path, destination)
        );
    }

    function download(entry) {
        entry = resolveEntry(entry);

        if (!entry || entry.type === 'directory')
            return;

        return options.api.download(entry.path)
            .then(function(result) {

                if (!handleResult(result))
                    return result;

                const blob = new Blob(
                    [ result.content || '' ],
                    { type: 'application/octet-stream' }
                );

                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');

                link.href = url;
                link.download = util.basename(entry.path);

                document.body.appendChild(link);
                link.click();
                link.remove();

                URL.revokeObjectURL(url);

                return result;
            })
            .catch(showError);
    }

    return {
        createFolder: createFolder,
        createFile: createFile,

        rename: rename,
        remove: remove,
        copy: copy,
        download: download,
        refresh: refresh,

        ensureSelection: selectedEntry,
        selectedEntry: selectedEntry,
        selectedEntries: selectedEntries,
        selectedPath: selectedPath,

        showError: showError
    };
}

return {
    createFileActions: createFileActions
};