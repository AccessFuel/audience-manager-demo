define(function (require) {
    // Canned demo
    var State = require('state');

    var init = function() {
        if (State.get('isAuthorized') == 'true') {
            window.location.href = "./home.html";
        } else {
            window.location.href = "./login.html";
        }
    };

    init();
});