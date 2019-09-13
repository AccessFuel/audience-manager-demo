define(function (require) {
    var $ = require('jquery');

    var navigate = function(callback) {
        var params = location.hash.replace('#','').split('/');

        if(callback) {
            callback(params);
        }
    };

    var init = function(callback) {
        window.onhashchange = navigate.bind(this, callback);

        navigate(callback);
    };

    return init;
});