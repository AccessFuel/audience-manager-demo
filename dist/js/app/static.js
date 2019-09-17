define(function (require) {
    var $ = require('jquery');

    require('global');
    require('chart');
    require('knob');

    var Navigation = require('components/navigation');

   var init = function(timeout = 500) {
        setTimeout(() => Navigation.navigate('main'), timeout);
    };

    return init;
});