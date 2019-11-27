define(function (require) {
    var $ = require('jquery');

    require('global');
    require('chart');
    require('knob');

    const Connect = require('components/connectServices');
    const Navigation = require('components/navigation');

   var init = function(timeout = 500) {
        Connect();
        setTimeout(() => Navigation.navigate('main'), timeout);
    };

    return init;
});