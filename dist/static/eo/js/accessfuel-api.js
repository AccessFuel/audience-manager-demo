var AccessfuelAPI = {
    accessfuel_api: "https://api.accessfuel.com/",

    ajax_it: function(endpoint, type, data, to_do){
        $.ajax({
                url: this.accessfuel_api + endpoint,
                type: type,
                data:  data,
                contentType: false,
                cache: false,
                processData:false,
                success: function(data){
                    to_do(data);
                }
           })
    },

    start_job: function(file_id, to_do) {
        if (!file_id) {
            return false;
        }

        $.ajax({
            url: this.accessfuel_api + 'start_job/' + file_id + '/local',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                to_do(data);
            }
        });
    },

    get_status: function(job_id, to_do) {
        if (!job_id) {
            return false;
        }

        $.ajax({
            url: this.accessfuel_api + 'job_status/' + job_id,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('===== get_status ======', data);

                if (to_do) {
                    to_do(data);
                }
            }
        });
    },

    get_results: function(job_id, to_do) {
        if (!job_id) {
            return false;
        }

        $.ajax({
            url: this.accessfuel_api + 'job_results/' + job_id + '/JSON/All',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('===== get_results ======', data);

                if (to_do) {
                    to_do(data);
                }
            }
        });
    },

    getQueryParameter: function(parameterName) {
        var name = parameterName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
};

