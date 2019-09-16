define(function (require) {

    // Canned demo
    var State = require('state');

    var $ = require('jquery');
    var API = "/dist/static/data/api/";
    var Debug = true;
    var Defaults = {
        contentType: false,
        cache: false,
        dataType: 'json',
        processData:false,
        type: 'GET',
        complete: function(data, status, xhr) {
            _logAPI(data);
            return data;
        }
    };

    var _logAPI = function(data) {
        if (Debug) {
            console.log('=== AccessFuel Admin API ===', data);
        }
    };

    var _requestAPI = function(endpoint, param) {
        var options = $.extend({}, Defaults, param);
        options.url = API + endpoint;
        return $.ajax(options);
    };

    var AccessfuelAdminAPI = {
        deleteFile: function(fileID) {
            if (!fileID) return false;

            State.set('hasFiles', false);

            return _requestAPI('uploads/delete.json?' + fileID, {
                // type: 'DELETE',
                dataType: 'text'
            });
        },
        getFile: function(fileID) {
            if (!fileID) return false;

            return _requestAPI('uploads/file-' + fileID + '.json', {
                type: 'GET'
            });
        },
        getFiles: function() {
            var url = (State.get('hasFiles') == 'true') ?'uploads/all.json' : 'uploads/empty.json';

            return _requestAPI(url, {
                type: 'GET'
            });
        },
        notify: function(subject, message, data) {
            return _requestAPI('notify.json', {
                data: JSON.stringify({
                    subject: subject,
                    message: message,
                    data: JSON.stringify(data)
                }),
                // type: 'POST',
                contentType: 'application/json'
            });
        },
        upload: function(data) {
            State.set('hasFiles', true);

            return _requestAPI('uploads/upload.json', {
                data: data,
                // type: 'POST'
            });
        }
    };

    return AccessfuelAdminAPI;
});

