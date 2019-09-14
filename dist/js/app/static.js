define(function (require) {
    var $ = require('jquery');

    // Template scripts
    require('global');

    var Navigation = require('components/navigation');

   var init = function() {
        setTimeout(() => Navigation.navigate('main'), 500);
    };

    return init;
});