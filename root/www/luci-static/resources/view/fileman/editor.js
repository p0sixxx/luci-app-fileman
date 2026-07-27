'use strict';
'require ui';

function createEditor(options) {
    function reportError(error) {
        if (options.onError)
            options.onError(error);
    }

    function open(path) {
        return options.readFile(path).then(function(response) {
            if (!response || response.error) {
                reportError(response && response.error || _('Unable to read file'));
                return response;
            }

            const textarea = E('textarea', {
                'class': 'cbi-input-textarea fileman-editor',
                'aria-label': _('File contents')
            }, [ response.content || '' ]);

            function save() {
                return options.writeFile(path, textarea.value).then(function(result) {
                    if (result && result.error) {
                        reportError(result.error);
                        return result;
                    }

                    ui.hideModal();
                    if (options.onSaved)
                        options.onSaved(path);
                    return result;
                }).catch(function(error) {
                    reportError(error.message || error);
                });
            }

            ui.showModal(_('Edit file'), [ textarea ], [
                E('button', {
                    'class': 'btn cbi-button cbi-button-neutral',
                    'click': ui.hideModal
                }, [ _('Cancel') ]),
                E('button', {
                    'class': 'btn cbi-button cbi-button-action',
                    'click': save
                }, [ _('Save') ])
            ]);
            return response;
        }).catch(function(error) {
            reportError(error.message || error);
        });
    }

    return {
        open: open
    };
}

return {
    createEditor: createEditor
};
