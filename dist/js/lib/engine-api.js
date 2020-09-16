define(function (require) {

    var $ = require('jquery');
    //var API = "https://test-api.accessfuel.com/";
    var API = "./dist/static/data/api/engine/";
    var Debug = true;
    var Defaults = {
        contentType: false,
        cache: false,
        dataType: 'json',
        processData:false,
        type: 'GET',
        success: function(data, status, xhr) {
            _logAPI(data);
            return Promise.resolve(data);
        }
    };

    var _logAPI = function(data) {
        if (Debug) {
            console.log('=== AccessFuel Engine API ===', data);
        }
    };

    var _requestAPI = function(endpoint, param) {
        var options = $.extend({}, Defaults, param);

        options.url = API + endpoint;

        return $.ajax(options);
    };


    var AccessfuelEngineAPI = {

        getReport: function(project) {
            if (!project || !project.id) {
                return false;
            }

            if (!project.status) {
                project.status = 'upload';
            }

            return _requestAPI('job_results_get_v2.json?' + project.id + '/' + project.status + '/agg_json/true');
        },

        getStats: function(projectId) {
            if (!projectId) {
                return false;
            }

            return _requestAPI('quickscan_data_v2-' + projectId + '.json');
        }

    };

    return AccessfuelEngineAPI;
});

