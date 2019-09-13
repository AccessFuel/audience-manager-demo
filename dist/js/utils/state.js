define(function (require) {
    var State = {
        get: function (key) {
            return localStorage.getItem('state.' + key);
        },
        set: function (key, value) {
            return localStorage.setItem('state.' + key, value);
        }
    };

    return State;
});