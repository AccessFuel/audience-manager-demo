define(function (require) {
    var $ = require('jquery');

    // Template scripts
    require('global');

    var Navigation = require('components/navigation');

   var init = function(timeout = 500) {
        setTimeout(() => Navigation.navigate('main'), timeout);
    };

    return init;
});