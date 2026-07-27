'use strict';
'require view';
'require view.fileman.actions as filemanActions';
'require view.fileman.browser as filemanBrowser';
'require view.fileman.editor as filemanEditor';
'require view.fileman.rpc as filemanRpc';
'require view.fileman.toolbar as filemanToolbar';
'require view.fileman.upload as filemanUpload';

function loadStyles() {
    if (document.getElementById('fileman-styles'))
        return;

    document.head.appendChild(E('link', {
        id: 'fileman-styles',
        rel: 'stylesheet',
        type: 'text/css',
        href: L.resource('view/fileman/styles.css')
    }));
}

function createApplication() {
    const root = E('div', {
        class: 'cbi-map fileman-app'
    });

    let browser = null;

    const editor = filemanEditor.createEditor({
        readFile: filemanRpc.read,
        writeFile: filemanRpc.write,
        onError: function(error) {
            browser.showError(error);
        },
        onSaved: function() {
            browser.refresh();
        }
    });

    browser = filemanBrowser.createBrowser({
        api: filemanRpc,
        onOpenFile: editor.open
    });

    const actions = filemanActions.createFileActions({
        api: filemanRpc,
        browser: browser
    });

    const toolbar = filemanToolbar.createToolbar(
        Object.assign({}, actions, {
            upload: filemanUpload.showUploadDialog
        })
    );

    root.appendChild(toolbar.root);
    root.appendChild(browser.root);

    return {
        root: root,
        browser: browser,
        editor: editor,
        actions: actions,
        toolbar: toolbar,

        start: function() {
            browser.refresh();
        }
    };
}

return view.extend({

    load: function() {
        return Promise.resolve();
    },

    render: function() {

        loadStyles();

        const app = createApplication();

        app.start();

        return app.root;
    }

});