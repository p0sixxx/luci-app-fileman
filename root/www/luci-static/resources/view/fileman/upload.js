'use strict';
'require ui';

function uploadFile(file, destination) {
    return Promise.reject(new Error(_('File upload is not available yet')));
}

function showUploadDialog() {
    const input = E('input', {
        'class': 'cbi-input-file',
        'type': 'file'
    });

    function startUpload() {
        const file = input.files[0];
        if (!file)
            return;

        uploadFile(file).catch(function(error) {
            ui.addNotification(null, E('p', {}, [ error.message || error ]));
        });
    }

    ui.showModal(_('Upload file'), [ input ], [
        E('button', {
            'class': 'btn cbi-button cbi-button-neutral',
            'click': ui.hideModal
        }, [ _('Cancel') ]),
        E('button', {
            'class': 'btn cbi-button cbi-button-action',
            'click': startUpload
        }, [ _('Upload') ])
    ]);
}

return {
    showUploadDialog: showUploadDialog,
    uploadFile: uploadFile
};
